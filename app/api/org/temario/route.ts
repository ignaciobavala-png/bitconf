import { createHash, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { SCHEMA, validateTemario } from "@/lib/agenda/snapshot";
import { getLatestSnapshot } from "@/lib/agenda/source";

// Recepción del temario desde el artefacto de la organización.
//
//   POST /api/org/temario   Authorization: Bearer <ORG_API_KEY>
//   GET  /api/org/temario   (misma clave) estado de lo publicado
//
// Contrato en docs/api-temario.md. Reglas:
// · Snapshot completo: cada envío reemplaza al anterior. Idempotente.
// · Si no valida, 4xx con los motivos y NO se toca lo publicado.
// · Sin ORG_API_KEY configurada el endpoint está apagado (503), nunca abierto.

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1_000_000;
const KEEP_SNAPSHOTS = 20;

/** Comparación en tiempo constante: no filtra la clave por cuánto tarda en fallar. */
function authorized(req: Request, key: string): boolean {
  const provided = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(key).digest();
  return timingSafeEqual(a, b);
}

function gate(req: Request): NextResponse | null {
  const key = process.env.ORG_API_KEY;
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "Endpoint no habilitado todavía (falta ORG_API_KEY en el servidor)." },
      { status: 503 }
    );
  }
  if (!authorized(req, key)) {
    return NextResponse.json({ ok: false, error: "no autorizado" }, { status: 401 });
  }
  return null;
}

export async function GET(req: Request) {
  const denied = gate(req);
  if (denied) return denied;

  const latest = await getLatestSnapshot();
  if (!latest) {
    return NextResponse.json({ ok: true, published: false, schema: SCHEMA });
  }
  const byDay: Record<string, number> = {};
  for (const s of latest.payload.sessions) byDay[s.day] = (byDay[s.day] ?? 0) + 1;
  return NextResponse.json({
    ok: true,
    published: true,
    schema: SCHEMA,
    publishedAt: latest.createdAt,
    generatedAt: latest.payload.generatedAt,
    sessions: latest.payload.sessions.length,
    sessionsByDay: byDay,
  });
}

export async function POST(req: Request) {
  const denied = gate(req);
  if (denied) return denied;

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "El envío es demasiado grande." }, { status: 413 });
  }
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "El envío es demasiado grande." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "El cuerpo no es JSON válido." }, { status: 400 });
  }

  const v = validateTemario(body);
  if (!v.ok) {
    return NextResponse.json(
      { ok: false, error: "El temario no valida; no se publicó nada.", errors: v.errors },
      { status: 422 }
    );
  }

  const supabase = createServiceClient();

  // Freno contra el accidente de mandar un temario casi vacío encima del bueno
  // (una exportación a medio cargar). `?force=1` lo salta a propósito.
  const force = new URL(req.url).searchParams.get("force") === "1";
  const previous = await getLatestSnapshot(supabase);
  if (!force && previous && previous.payload.sessions.length >= 10) {
    if (v.payload.sessions.length < previous.payload.sessions.length * 0.5) {
      return NextResponse.json(
        {
          ok: false,
          error: `Llegaron ${v.payload.sessions.length} sesiones y lo publicado tiene ${previous.payload.sessions.length}. Parece un envío incompleto; no se publicó. Si es intencional, reenviá con ?force=1.`,
        },
        { status: 409 }
      );
    }
  }

  const { error } = await supabase.from("temario_snapshots").insert({
    schema: SCHEMA,
    generated_at: v.payload.generatedAt,
    sessions_count: v.payload.sessions.length,
    payload: v.payload,
  });
  if (error) {
    console.error("[temario] no se pudo guardar:", error.message);
    return NextResponse.json({ ok: false, error: "No se pudo guardar el temario." }, { status: 500 });
  }

  // Se conservan las últimas N; el resto no sirve para volver atrás.
  const { data: old } = await supabase
    .from("temario_snapshots")
    .select("id")
    .order("id", { ascending: false })
    .range(KEEP_SNAPSHOTS, KEEP_SNAPSHOTS + 500);
  if (old && old.length > 0) {
    await supabase.from("temario_snapshots").delete().in("id", old.map((r) => r.id as number));
  }

  revalidatePath("/agenda");
  revalidatePath("/mi-agenda");

  const byDay: Record<string, number> = {};
  for (const s of v.payload.sessions) byDay[s.day] = (byDay[s.day] ?? 0) + 1;

  return NextResponse.json({
    ok: true,
    published: v.payload.sessions.length,
    sessionsByDay: byDay,
    warnings: v.warnings,
  });
}
