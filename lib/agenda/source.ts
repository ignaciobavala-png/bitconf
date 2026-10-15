import { createClient } from "@supabase/supabase-js";
import { SESSIONS, type Session } from "./temario";
import { toSessions, validateTemario, type SnapshotPayload } from "./snapshot";
import feedRespaldo from "./feed-respaldo.json";

// Lectura del temario publicado por la organización.
//
// Anon key a propósito, incluso en el servidor: la RLS de `temario_snapshots`
// es la que decide qué se ve (ver lib/db/temario.sql).

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export type LatestSnapshot = { payload: SnapshotPayload; createdAt: string };

/** El envío más reciente, o null si no hay (o la tabla todavía no existe). */
export async function getLatestSnapshot(
  client: ReturnType<typeof publicClient> = publicClient()
): Promise<LatestSnapshot | null> {
  const { data, error } = await client
    .from("temario_snapshots")
    .select("payload, created_at")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // Tabla inexistente o base caída: la agenda sigue con el temario del repo.
    console.error("[temario] no se pudo leer el envío publicado:", error.message);
    return null;
  }
  if (!data) return null;

  // Se vuelve a validar al leer: si el contrato cambió desde que se guardó,
  // preferimos el temario del repo a dibujar algo a medias.
  const v = validateTemario(data.payload);
  if (!v.ok) {
    console.error("[temario] el envío guardado ya no valida:", v.errors[0]);
    return null;
  }
  return { payload: v.payload, createdAt: data.created_at as string };
}

/**
 * Modo lectura (opciones A y B del acuerdo con la organización): la web va a
 * buscar el `temario.json` que la organización publica, en vez de esperar un
 * envío. Se activa con `TEMARIO_SOURCE_URL`; si el origen pide clave va en
 * `TEMARIO_SOURCE_KEY` como Bearer. Se revalida cada 5 minutos.
 *
 * Si la URL es el documento `publico/temario` de Firestore
 * (https://firestore.googleapis.com/v1/projects/labitconf-2026/databases/(default)/documents/publico/temario)
 * funciona igual: son ~288 lecturas por día contra las 50.000 del plan gratuito,
 * porque lee el servidor y cachea; nunca cada navegador.
 *
 * Una respuesta que no valida NO se usa: se sigue con lo anterior.
 */
const PULL_REVALIDATE_SECONDS = 300;

/**
 * La API REST de Firestore no devuelve el documento tal cual: lo envuelve en
 * `{ fields: { json: { stringValue: "<temario v1 como texto>" } } }`. La
 * organización publica en `publico/temario` (relevamiento del 13/10) con el
 * temario entero en el campo `json`. Se desenvuelve acá para que el mismo
 * `TEMARIO_SOURCE_URL` sirva para un archivo plano o para ese documento.
 */
export function unwrapFirestore(body: unknown): unknown {
  const fields = (body as { fields?: { json?: { stringValue?: unknown } } } | null)?.fields;
  if (!fields) return body;
  const text = fields.json?.stringValue;
  if (typeof text !== "string") throw new Error('el documento de Firestore no trae el campo "json"');
  return JSON.parse(text);
}

async function getPulledPayload(): Promise<SnapshotPayload | null> {
  const url = process.env.TEMARIO_SOURCE_URL;
  if (!url) return null;
  try {
    const key = process.env.TEMARIO_SOURCE_KEY;
    const res = await fetch(url, {
      headers: key ? { Authorization: `Bearer ${key}` } : undefined,
      next: { revalidate: PULL_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const v = validateTemario(unwrapFirestore(await res.json()));
    if (!v.ok) throw new Error(`no valida: ${v.errors[0]}`);
    return v.payload;
  } catch (e) {
    console.error("[temario] no se pudo leer el origen:", (e as Error).message);
    return null;
  }
}

function getRespaldoPayload(): SnapshotPayload | null {
  const v = validateTemario(feedRespaldo);
  return v.ok ? v.payload : null;
}

/**
 * Las sesiones que muestra la web, por orden de preferencia:
 *   1. el temario que la organización publica y la web LEE (TEMARIO_SOURCE_URL),
 *   2. el último que la organización ENVIÓ (POST /api/org/temario),
 *   3. una copia congelada del feed de la organización (`feed-respaldo.json`),
 *   4. el cargado a mano en `lib/agenda/temario.ts`.
 *
 * (3) existe porque `TEMARIO_SOURCE_URL` no está cargada en Production (15/10/2026:
 * el token de la cuenta del cliente no sirve) y el temario a mano tenía 76 sesiones
 * contra las 184 del feed. Es una foto: se vuelve a bajar a mano mientras no haya (1).
 */
export async function getSessions(): Promise<Session[]> {
  const payload =
    (await getPulledPayload()) ?? (await getLatestSnapshot())?.payload ?? getRespaldoPayload();
  if (!payload) return SESSIONS;
  const sessions = toSessions(payload);
  return sessions.length > 0 ? sessions : SESSIONS;
}
