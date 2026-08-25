import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { hashEmail, looksLikeEmail } from "@/lib/itinerary/email";

// Respaldo y recuperación del itinerario.
//
// El browser nunca toca la tabla `itineraries` directamente: no tiene policy de
// lectura para anon, así que todo pasa por acá con service_role.

export const dynamic = "force-dynamic";

const RATE_LIMIT_SALT = process.env.RATE_LIMIT_SALT ?? "dev-salt";

/**
 * Rate limit por IP.
 *
 * Es la contención del patrón "poné tu mail y te devuelvo el itinerario": sin
 * verificación, alguien podría probar mails en masa para averiguar quién va al
 * evento. Una persona real escribe su mail una o dos veces y nunca lo nota;
 * probar miles se vuelve inviable.
 */
const MAX_PER_WINDOW = 8;
const WINDOW_MINUTES = 10;

function hashIP(ip: string): string {
  return createHash("sha256").update(ip + RATE_LIMIT_SALT).digest("hex");
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

type Supabase = ReturnType<typeof createServiceClient>;

async function rateLimited(supabase: Supabase, ipHash: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("rate_limit")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("window_start", windowStart);
  return (count ?? 0) >= MAX_PER_WINDOW;
}

/**
 * Descarta ids de charlas que ya no existen.
 *
 * Pasa de verdad: si la organización le cambia el título a una charla, el sync
 * la borra y crea una nueva (ver `talkKey` en lib/speakers/source.ts). Un
 * itinerario viejo queda apuntando a un id muerto y hay que ignorarlo, no
 * romper la respuesta.
 */
async function keepLiveTalks(supabase: Supabase, ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const { data } = await supabase.from("talks").select("id").in("id", ids);
  const live = new Set((data ?? []).map((r) => r.id as string));
  return ids.filter((id) => live.has(id));
}

function parseBody(body: unknown): { email: string; talkIds: string[] | null } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email : "";
  if (!looksLikeEmail(email)) return null;

  if (b.talkIds === undefined) return { email, talkIds: null };
  if (!Array.isArray(b.talkIds)) return null;
  const ids = b.talkIds.filter((x): x is string => typeof x === "string").slice(0, 200);
  return { email, talkIds: ids };
}

/** Guarda (o pisa) el itinerario de ese mail. */
export async function PUT(req: NextRequest) {
  const parsed = parseBody(await req.json().catch(() => null));
  if (!parsed || parsed.talkIds === null) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const ipHash = hashIP(getIP(req));
  if (await rateLimited(supabase, ipHash)) {
    return NextResponse.json({ error: "Demasiados intentos. Esperá unos minutos." }, { status: 429 });
  }
  await supabase.from("rate_limit").insert({ ip_hash: ipHash });

  const talkIds = await keepLiveTalks(supabase, parsed.talkIds);

  const { error } = await supabase
    .from("itineraries")
    .upsert({ email_hash: hashEmail(parsed.email), talk_ids: talkIds }, { onConflict: "email_hash" });

  if (error) {
    console.error("[mi-agenda] no se pudo guardar:", error.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, saved: talkIds.length });
}

/** Devuelve el itinerario guardado con ese mail. */
export async function POST(req: NextRequest) {
  const parsed = parseBody(await req.json().catch(() => null));
  if (!parsed) return NextResponse.json({ error: "Mail inválido" }, { status: 400 });

  const supabase = createServiceClient();
  const ipHash = hashIP(getIP(req));
  if (await rateLimited(supabase, ipHash)) {
    return NextResponse.json({ error: "Demasiados intentos. Esperá unos minutos." }, { status: 429 });
  }
  await supabase.from("rate_limit").insert({ ip_hash: ipHash });

  const { data, error } = await supabase
    .from("itineraries")
    .select("talk_ids")
    .eq("email_hash", hashEmail(parsed.email))
    .maybeSingle();

  if (error) {
    console.error("[mi-agenda] no se pudo leer:", error.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ found: false, talkIds: [] });

  return NextResponse.json({
    found: true,
    talkIds: await keepLiveTalks(supabase, (data.talk_ids ?? []) as string[]),
  });
}
