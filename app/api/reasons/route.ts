import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import {
  containsBlockedContent,
  containsPII,
  hasValidCharset,
} from "@/lib/db/blocklist";

const RATE_LIMIT_SALT = process.env.RATE_LIMIT_SALT ?? "dev-salt";
const MAX_PER_WINDOW = 3;           // envíos por IP en 10 minutos
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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  // 1. Honeypot — bots completan este campo, humans no
  if (body.website) {
    return NextResponse.json({ ok: true }, { status: 201 }); // silencioso
  }

  const text: unknown = body.text;

  // 2. Validación básica
  if (typeof text !== "string") {
    return NextResponse.json({ error: "Texto inválido" }, { status: 400 });
  }
  const trimmed = text.trim();
  if (trimmed.length < 2 || trimmed.length > 60) {
    return NextResponse.json(
      { error: "El texto debe tener entre 2 y 60 caracteres" },
      { status: 400 }
    );
  }
  if (!hasValidCharset(trimmed)) {
    return NextResponse.json(
      { error: "Caracteres no permitidos" },
      { status: 400 }
    );
  }
  if (containsPII(trimmed)) {
    return NextResponse.json(
      { error: "No incluyas datos personales" },
      { status: 400 }
    );
  }

  // 3. Blocklist
  const flagged = containsBlockedContent(trimmed);

  // 4. Rate limit por IP
  const ip = getIP(req);
  const ipHash = hashIP(ip);
  const supabase = createServiceClient();
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("rate_limit")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("window_start", windowStart);

  if ((count ?? 0) >= MAX_PER_WINDOW) {
    return NextResponse.json(
      { error: "Demasiados envíos. Esperá unos minutos." },
      { status: 429 }
    );
  }

  // 5. Obtener lane_index basado en total de reasons
  const { count: totalCount } = await supabase
    .from("reasons")
    .select("*", { count: "exact", head: true });

  const laneIndex = (totalCount ?? 0) % 6;

  // 6. Insertar reason
  const { data, error } = await supabase
    .from("reasons")
    .insert({ text: trimmed, ip_hash: ipHash, flagged, lane_index: laneIndex })
    .select("id, text, lane_index")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  // 7. Registrar en rate_limit
  await supabase.from("rate_limit").insert({ ip_hash: ipHash });

  return NextResponse.json(data, { status: 201 });
}
