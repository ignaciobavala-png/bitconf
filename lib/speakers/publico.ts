// Lectura de `publico/speakers`: la lista de speakers que publica la app de la
// organización (17/10/2026). Reemplaza a `web-list.ts` + la planilla para armar
// `/speakers`, y es la fuente de los ids con que el temario referencia a cada
// persona (`speakerIds` / `moderatorId`), así el cruce deja de ser por nombre.
//
// Mismo patrón que `lib/agenda/source.ts`: el servidor lee y cachea 5 minutos,
// nunca el navegador. Si el origen no responde o no valida devuelve null y el
// llamador sigue con la base propia.

import { unwrapFirestore } from "@/lib/agenda/source";

export const SPEAKERS_SCHEMA = "labitconf.speakers.v1";

const DEFAULT_URL =
  "https://firestore.googleapis.com/v1/projects/labitconf-2026/databases/(default)/documents/publico/speakers";
const REVALIDATE_SECONDS = 300;

export type PublicSpeaker = {
  /** "sp" + nº de ficha. Estable aunque cambie el nombre. No es el id de un escenario (s1..s7). */
  id: string;
  /** Nombre público (alias si lo cargó): es el que se muestra. */
  nombre: string;
  /** Solo para búsqueda y cruces; no se muestra. */
  nombreReal: string;
  empresa: string | null;
  webCategoria: number | null;
  /** Posición final ya calculada: se ordena por esto y nada más. */
  webOrder: number;
  /** Habla o modera en al menos una sesión publicada. */
  enGrilla: boolean;
  foto: string | null;
  x: string | null;
  web: string | null;
};

export const SPEAKER_ID = /^sp\d+$/;

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function text(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t && t.length <= max ? t : null;
}

/** Solo http(s): este texto termina en un href. */
function link(v: unknown): string | null {
  const t = text(v, 500);
  return t && /^https?:\/\//i.test(t) ? t : null;
}

/**
 * Reconstruye la lista desde campos validados (no devuelve el body recibido).
 * Una fila rota se descarta sola; si no queda ninguna, el documento no sirve.
 */
export function parseSpeakers(body: unknown): PublicSpeaker[] {
  if (!isObj(body) || body.schema !== SPEAKERS_SCHEMA || !Array.isArray(body.speakers)) {
    throw new Error(`no es ${SPEAKERS_SCHEMA}`);
  }
  const seen = new Set<string>();
  const out: PublicSpeaker[] = [];
  for (const raw of body.speakers) {
    if (!isObj(raw)) continue;
    const id = text(raw.id, 20);
    const nombre = text(raw.nombre, 120);
    if (!id || !SPEAKER_ID.test(id) || !nombre || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      nombre,
      nombreReal: text(raw.nombreReal, 160) ?? nombre,
      empresa: text(raw.empresa, 160),
      webCategoria: typeof raw.webCategoria === "number" ? raw.webCategoria : null,
      webOrder: typeof raw.webOrder === "number" ? raw.webOrder : Number.MAX_SAFE_INTEGER,
      enGrilla: raw.enGrilla === true,
      foto: link(raw.foto),
      x: link(raw.x),
      web: link(raw.web),
    });
  }
  if (out.length === 0) throw new Error("sin speakers");
  return out.sort((a, b) => a.webOrder - b.webOrder);
}

/** La lista publicada, o null si el origen no responde o no valida. */
export async function getPublicSpeakers(): Promise<PublicSpeaker[] | null> {
  const url = process.env.SPEAKERS_PUBLIC_URL || DEFAULT_URL;
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseSpeakers(unwrapFirestore(await res.json()));
  } catch (e) {
    console.error("[speakers] no se pudo leer publico/speakers:", (e as Error).message);
    return null;
  }
}
