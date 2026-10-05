import { splitRawTags, toCanonicalTags, type CanonicalTag } from "./tags";

// Lectura de la planilla de la organización.
//
// El origen es un Google Apps Script que expone dos hojas de un Google Sheet:
//   · Speakers — una fila por postulación, 38 columnas
//   · MKT      — flag `publicado` por speaker (calendario de anuncios en redes)
//
// La respuesta viene como matriz de filas crudas (la fila 0 es el encabezado),
// así que acá se resuelven los índices POR NOMBRE de columna en vez de por
// posición: la organización agrega columnas seguido y hardcodear r[19] hace que
// todo se corra en silencio el día que insertan una en el medio.

const SOURCE_URL = process.env.SPEAKERS_SOURCE_URL;
const SOURCE_KEY = process.env.SPEAKERS_SOURCE_KEY;

export type SourceTalk = {
  sourceKey: string;
  title: string;
  abstract: string | null;
  description: string | null;
  rawTags: string[];
  tags: CanonicalTag[];
  level: string | null;
  formats: string[];
  durationMin: number | null;
  isPanel: boolean;
  status: string;
  stage: string | null;
  day: string | null;
};

export type SourceSpeaker = {
  /**
   * Clave de upsert. NO es `postulacion_num`: ese número está repetido en la
   * planilla (15 números usados por dos personas distintas, los del rango
   * 25-42), así que como clave única rompe el upsert y además vuelve ambiguo el
   * flag `publicado` de la hoja MKT, que se referencia solo por número.
   * Num + nombre normalizado sí es único en las 83 filas.
   */
  sourceKey: string;
  sourceNum: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  company: string | null;
  country: string | null;
  languages: string[];
  bio: string | null;
  photoSourceUrl: string | null;
  website: string | null;
  linkedin: string | null;
  xHandle: string | null;
  instagram: string | null;
  github: string | null;
  status: string;
  /** null = no se pudo leer la hoja MKT; el sync conserva lo que había. */
  mktPublished: boolean | null;
  /** Tilde "Publicar" del tablero de la organización: decide si sale en la web. */
  landing: boolean;
  /** `# WEB` de la organización. null si la planilla no lo trae. */
  webOrder: number | null;
  /**
   * Columna `tags` de la planilla. `[]` = la columna existe y esta fila está
   * vacía (el speaker queda sin tag). `null` = la planilla no trajo la columna.
   */
  tags: CanonicalTag[] | null;
  talks: SourceTalk[];
};

type SheetResponse = { ok?: boolean; data?: unknown[][]; version?: string };

async function readSheet(sheet: string): Promise<SheetResponse> {
  if (!SOURCE_URL || !SOURCE_KEY) {
    throw new Error(
      "Faltan SPEAKERS_SOURCE_URL / SPEAKERS_SOURCE_KEY. La planilla de speakers no se puede leer."
    );
  }
  const url = `${SOURCE_URL}?action=get_data&sheet=${encodeURIComponent(
    sheet
  )}&key=${encodeURIComponent(SOURCE_KEY)}`;

  // Apps Script responde entre 1 y 3 segundos y ocasionalmente redirige, por eso
  // el timeout es generoso. `cache: no-store` porque el punto del sync es
  // justamente traer lo último.
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) throw new Error(`La hoja ${sheet} respondió HTTP ${res.status}`);

  const json = (await res.json()) as SheetResponse;
  if (!Array.isArray(json.data)) throw new Error(`La hoja ${sheet} no devolvió filas`);
  return json;
}

/** Resuelve índices de columna por nombre de encabezado. */
function columnIndex(header: unknown[]) {
  const map = new Map<string, number>();
  header.forEach((h, i) => {
    const key = String(h ?? "").trim().toLowerCase();
    if (key && !map.has(key)) map.set(key, i);
  });
  return (name: string) => map.get(name.toLowerCase()) ?? -1;
}

function cell(row: unknown[], idx: number): string {
  if (idx < 0 || idx >= row.length) return "";
  const v = row[idx];
  return v === null || v === undefined ? "" : String(v).trim();
}

function text(row: unknown[], idx: number): string | null {
  const v = cell(row, idx);
  return v || null;
}

/**
 * `# WEB` → entero positivo, o null. Cualquier otra cosa (vacío, "si", texto)
 * se toma como "sin asignar" en vez de romper el sync: lo peor que pasa con un
 * valor raro es que ese speaker no ordena.
 */
function webOrder(raw: string): number | null {
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) && n >= 1 ? Math.round(n) : null;
}

/** "@nacho" y "https://x.com/nacho" y "x.com/nacho" → "nacho". */
function handle(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?(x|twitter|instagram)\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?]/)[0]
    .trim();
  return cleaned || null;
}

/**
 * Fotos que la organización no carga en la planilla sino a mano en el
 * `FOTO_OVERRIDE` del JS de su tablero (web.html), y que por eso el sync nunca
 * veía: el link de la columna `foto` de estas personas apunta a un Drive
 * privado (30/09/2026). Mandan sobre la columna, igual que en su tablero.
 * Clave: nombre + apellido normalizados — no el `postulacion_num`, que
 * renumeran seguido. Si algún día pegan estos links en la planilla, esto se
 * borra.
 */
const PHOTO_OVERRIDE: Record<string, string> = {
  "saifedean ammous": "https://drive.google.com/thumbnail?id=1RyIiH_JsFBqDP7MPtjNzBoEVOi7DOkGF&sz=w400",
  "giacomo zucco": "https://drive.google.com/thumbnail?id=1l6Nbs_zhArGMIddA8VIdnEJRmM6D5hR9&sz=w400",
  // La org la mandó por fuera (30/09): el link de la planilla es un Drive
  // privado. Subida a mano al bucket, recortada a 400x400.
  "lorena ortiz":
    "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/speakers/1a73663fcdd972e9bef407f3b65e5c70b351f690bde52ae403ef52dabfe1d8de.jpg",
};

/** "Nacho  Bávala" → "nacho bavala". Solo para construir la clave de upsert. */
function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Completa el esquema de una URL escrita a mano ("miweb.com"). */
function absoluteUrl(value: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/**
 * La columna `temas` guarda las charlas propuestas como JSON. Es la parte más
 * valiosa de la planilla — trae título, abstract, tags, día y escenario — y
 * también la más frágil: si alguien edita la celda a mano y rompe el JSON, esa
 * fila se pierde. Por eso el parseo falla en silencio POR SPEAKER en vez de
 * cortar el sync entero.
 */
/**
 * Identidad estable de una charla dentro de un speaker.
 *
 * NO se usa el índice en el array. Al principio la clave era `speakerKey#0`,
 * `speakerKey#1`, etc., y eso tiene un problema silencioso: si la organización
 * reordena las charlas de un speaker en la planilla, la charla que era la #0
 * pasa a ser la #1 y el upsert **reescribe la misma fila con otro contenido**.
 * El uuid queda igual pero adentro hay otra charla.
 *
 * Mientras nada guardara referencias a `talks.id` eso no se notaba. Con "Mi
 * agenda" sí: un itinerario guardado apuntaría de golpe a una charla distinta.
 *
 * Por eso la clave sale del título normalizado. Reordenar ya no cambia nada, y
 * si le cambian el título se crea una charla nueva y la vieja se borra por
 * huérfana — que es lo correcto: una charla retitulada es otra charla, y es más
 * honesto que desaparezca del itinerario a que mute sin avisar.
 */
function talkKey(speakerKey: string, title: string, seen: Map<string, number>): string {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  // Un mismo speaker con dos charlas de título idéntico: se desempata con un
  // sufijo, estable mientras no cambie el orden entre esos dos duplicados.
  const n = seen.get(base) ?? 0;
  seen.set(base, n + 1);
  return n === 0 ? `${speakerKey}#${base}` : `${speakerKey}#${base}~${n}`;
}

function parseTalks(raw: string, speakerKey: string): SourceTalk[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const seen = new Map<string, number>();

  return parsed.flatMap((item): SourceTalk[] => {
    if (!item || typeof item !== "object") return [];
    const t = item as Record<string, unknown>;
    const title = String(t.titulo ?? "").trim();
    if (!title) return [];

    const rawTags = splitRawTags(t.tags);
    const duration = Number.parseInt(String(t.duracion ?? ""), 10);

    return [
      {
        sourceKey: talkKey(speakerKey, title, seen),
        title,
        abstract: String(t.abstract ?? "").trim() || null,
        description: String(t.descripcion ?? "").trim() || null,
        rawTags,
        tags: toCanonicalTags(rawTags),
        level: String(t.nivel ?? "").trim() || null,
        formats: splitRawTags(t.formatos),
        durationMin: Number.isFinite(duration) ? duration : null,
        isPanel: String(t.panel ?? "").trim().toLowerCase() === "si",
        status: String(t.estado ?? "").trim() || "revision",
        stage: String(t.stage ?? "").trim() || null,
        day: String(t.day ?? "").trim() || null,
      },
    ];
  });
}

/**
 * Lee las dos hojas y devuelve speakers normalizados.
 *
 * IMPORTANTE: la hoja trae mail, whatsapp, telegram y signal de cada persona.
 * Esta función NO los copia al resultado. Es el único punto del código donde
 * esos datos existen, y mueren acá — nunca llegan a la base ni al browser.
 */
export async function fetchSpeakersFromSource(): Promise<{
  speakers: SourceSpeaker[];
  version: string | null;
}> {
  // MKT es opcional: desde que publica el tilde `landing` (28/09) su flag solo
  // se guarda como dato, y el 05/10 la organización borró la hoja ("hoja no
  // encontrada: MKT"). Que falte no puede frenar el sync entero.
  const [sp, mkt] = await Promise.all([
    readSheet("Speakers"),
    readSheet("MKT").catch((e: Error) => {
      console.warn("[speakers] hoja MKT no disponible:", e.message);
      return null;
    }),
  ]);

  const spRows = sp.data ?? [];
  if (spRows.length < 2) return { speakers: [], version: sp.version ?? null };

  const col = columnIndex(spRows[0]);
  const iNum = col("postulacion_num");
  const iConf = col("confname");
  const iNombre = col("nombre");
  const iApellido = col("apellido");

  // El orden todavía no tiene columna en la planilla (28/09): el tablero de la
  // organización (LABITCONF-speakers/web.html) lo espera en `r[40]`, que no
  // existe, y mientras tanto usa un mapa escrito a mano en su JS. Se busca por
  // encabezado, nunca por índice. `landing` NO es esto: es el tilde de
  // publicar (valor "si").
  //
  // 30/09: la org suma una columna `orden web` con el orden nuevo de su
  // tablero. Si existe, manda entera sobre `web_order`: no se completa fila
  // por fila con la vieja, porque mezclaría dos numeraciones distintas.
  const iWeb =
    [col("orden web"), col("orden_web"), col("web_order"), col("# web"), col("web")].find(
      (i) => i >= 0
    ) ?? -1;

  // Tags por speaker (los 12 clusters de la organización), columna `tags` (AP)
  // desde el 30/09. Mismos encabezados que busca su página.
  const iTags = [col("tags"), col("tag"), col("cluster")].find((i) => i >= 0) ?? -1;

  // MKT: num → publicado
  const mktPublished = new Set<number>();
  for (const row of (mkt?.data ?? []).slice(1)) {
    const num = Number.parseInt(String(row?.[0] ?? ""), 10);
    if (Number.isFinite(num) && String(row?.[1] ?? "").trim().toLowerCase() === "si") {
      mktPublished.add(num);
    }
  }

  const speakers: SourceSpeaker[] = [];

  for (const row of spRows.slice(1)) {
    if (!Array.isArray(row)) continue;

    const sourceNum = Number.parseInt(cell(row, iNum), 10);
    const first = text(row, iNombre);
    const last = text(row, iApellido);

    // Sin número de postulación no hay clave de upsert estable, y sin nombre la
    // fila está vacía. En ambos casos se descarta en vez de inventar un id.
    if (!Number.isFinite(sourceNum) || !first) continue;

    const sourceKey = `${sourceNum}|${normalizeName([first, last].filter(Boolean).join(" "))}`;
    const talks = parseTalks(cell(row, col("temas")), sourceKey);

    // Los tags del speaker los decide la organización por persona, no salen de
    // sus charlas ("prioridad al speaker, no a su charla"). Sale solo de la
    // columna `tags`: sin valor, el speaker queda sin tag. No se cae a la unión
    // de las charlas (sería inventar una clasificación que ellos no hicieron) ni
    // al mapa que tenían escrito en el JS de su tablero: ese mapa iba por
    // `postulacion_num` y quedó corrido una fila cuando renumeraron (Rodo con el
    // tag de visionario_btc, un abogado en "Mining"). Un chip equivocado es peor
    // que ninguno.
    const tags = iTags >= 0 ? toCanonicalTags(splitRawTags(text(row, iTags) ?? undefined)) : null;

    speakers.push({
      sourceKey,
      sourceNum,
      name: text(row, iConf) ?? [first, last].filter(Boolean).join(" "),
      firstName: first,
      lastName: last,
      role: text(row, col("cargo")),
      company: text(row, col("empresa")),
      country: text(row, col("pais")),
      languages: splitRawTags(cell(row, col("idioma"))).map((l) => l.toLowerCase()),
      bio: text(row, col("bio")),
      photoSourceUrl:
        PHOTO_OVERRIDE[normalizeName([first, last].filter(Boolean).join(" "))] ??
        text(row, col("foto")),
      website: absoluteUrl(text(row, col("website"))),
      linkedin: absoluteUrl(text(row, col("linkedin"))),
      xHandle: handle(text(row, col("x"))),
      instagram: handle(text(row, col("instagram"))),
      github: handle(text(row, col("github"))),
      status: (text(row, col("estado")) ?? "revision").toLowerCase(),
      mktPublished: mkt ? mktPublished.has(sourceNum) : null,
      // Criterio de publicación confirmado por la organización (28/09/2026):
      // `landing === "si"`, sin mirar `estado`, que es de uso interno de ellos.
      landing: cell(row, col("landing")).toLowerCase() === "si",
      webOrder: webOrder(cell(row, iWeb)),
      tags,
      talks,
    });
  }

  return { speakers, version: sp.version ?? null };
}
