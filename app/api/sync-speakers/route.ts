import { NextResponse } from "next/server";
import { syncSpeakers } from "@/lib/speakers/sync";
import { recordFailure, recordRun } from "@/lib/speakers/runs";

// El sync habla con Google Apps Script y baja fotos: puede tardar bastante más
// que una request normal.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Autorización.
 *
 * Dos llamadores legítimos: el cron de Vercel (manda
 * `Authorization: Bearer $CRON_SECRET`) y nosotros a mano con el ADMIN_SECRET
 * que ya usa el panel. Cualquier otra cosa es 401 — este endpoint escribe en la
 * base y consume cuota del Apps Script de la organización, no puede quedar
 * abierto.
 */
function authorized(req: Request): boolean {
  const auth = req.headers.get("authorization") ?? "";

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;

  const provided = req.headers.get("x-sync-secret") ?? auth.replace(/^Bearer\s+/i, "");
  return provided === adminSecret;
}

async function run(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "no autorizado" }, { status: 401 });
  }
  // Quién llama determina cómo queda registrada la corrida: el cron manda
  // Bearer, nosotros desde el admin mandamos x-sync-secret.
  const trigger = req.headers.get("x-sync-secret") ? "manual" : "cron";
  const startedAt = Date.now();

  try {
    const report = await syncSpeakers();
    // El reporte se persiste ANTES de devolverlo: quien llama es el cron, que
    // no lee la respuesta. Sin esta línea el JSON se genera y se tira.
    await recordRun(report, trigger);
    return NextResponse.json(report);
  } catch (err) {
    // El detalle importa: si falla, casi siempre es la planilla (cuota de Apps
    // Script, permiso cambiado, JSON roto) y el mensaje dice cuál de esas es.
    console.error("[sync-speakers]", err);
    // Es la fila que más importa del historial, y solo se puede escribir desde
    // acá — por eso el registro vive en la ruta y no dentro de syncSpeakers().
    await recordFailure(err, trigger, Date.now() - startedAt);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}
