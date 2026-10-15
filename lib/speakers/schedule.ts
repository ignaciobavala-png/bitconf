// Vocabulario del cronograma: días y escenarios.
//
// Vive acá y no en cada componente porque ya lo usan la ficha de speaker y la
// agenda. Cuando la organización confirme los nombres reales de los escenarios
// (hoy la planilla solo manda los códigos s1..s7), se cambia STAGE_NAMES y
// aparece en todo el sitio a la vez.

export const DAYS = ["oct30", "oct31"] as const;
export type Day = (typeof DAYS)[number];

export const DAY_LABELS: Record<ProgramDay, { es: string; en: string }> = {
  oct29: { es: "Jueves 29 de octubre", en: "Thursday, October 29" },
  oct30: { es: "Viernes 30 de octubre", en: "Friday, October 30" },
  oct31: { es: "Sábado 31 de octubre", en: "Saturday, October 31" },
  nov1: { es: "Domingo 1 de noviembre", en: "Sunday, November 1" },
};

/** Versión corta para los tabs, donde el label largo no entra en mobile. */
export const DAY_SHORT: Record<ProgramDay, { es: string; en: string }> = {
  oct29: { es: "Jue 29 oct", en: "Thu Oct 29" },
  oct30: { es: "Vie 30 oct", en: "Fri Oct 30" },
  oct31: { es: "Sáb 31 oct", en: "Sat Oct 31" },
  nov1: { es: "Dom 1 nov", en: "Sun Nov 1" },
};

export function isDay(value: string | null): value is Day {
  return value != null && (DAYS as readonly string[]).includes(value);
}

/**
 * Nombre propio de cada escenario.
 *
 * PENDIENTE con la organización: la planilla manda `s1`..`s7` y nada más, así
 * que hoy no hay con qué llenar esto. Mientras esté vacío se cae a
 * "Escenario N", que es correcto pero no ayuda a elegir — que es justamente
 * para lo que sirve filtrar por escenario.
 */
export const STAGE_NAMES: Record<string, { es: string; en: string }> = {
  // Columnas del Boceto de Temario 2026 (13/10/2026), en su orden.
  s1: { es: "Orange Pill", en: "Orange Pill" },
  s2: { es: "Visión", en: "Vision" },
  s3: { es: "ABC", en: "ABC" },
  s4: { es: "Workshop", en: "Workshop" },
  s5: { es: "B2B by IKIGII", en: "B2B by IKIGII" },
  s6: { es: "BitcoinAR", en: "BitcoinAR" },
  s7: { es: "La Bitcoineta", en: "La Bitcoineta" },
};

/**
 * Aclaración de acceso de un escenario, para mostrar chica debajo del nombre
 * (pedido de la org, 15/10/2026). Hoy solo B2B by IKIGII, que es únicamente
 * para tickets Business y Experience.
 */
const STAGE_NOTES: Record<string, { es: string; en: string }> = {
  s5: { es: "(Solo Ticket Business y Experience)", en: "(Business and Experience tickets only)" },
};

export function stageNote(stage: string, lang: "es" | "en"): string | null {
  return STAGE_NOTES[stage]?.[lang] ?? null;
}

export function stageLabel(stage: string, lang: "es" | "en"): string {
  const named = STAGE_NAMES[stage];
  if (named) return named[lang];
  const n = stage.replace(/^s/i, "");
  return lang === "es" ? `Escenario ${n}` : `Stage ${n}`;
}

/** s1, s2, … s10 en orden numérico (el alfabético pondría s10 antes que s2). */
export function compareStages(a: string, b: string): number {
  const na = Number(a.replace(/^s/i, ""));
  const nb = Number(b.replace(/^s/i, ""));
  if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
  return a.localeCompare(b);
}

// ---------------------------------------------------------------------------
// Programa público (PDF "LABITCONF 26 · AGENDA" de la organización)
// ---------------------------------------------------------------------------
//
// `DAYS` de arriba es el vocabulario de la PLANILLA y también lo que muestra
// la agenda: oct30 y oct31, los dos días de conferencia.
//
// El jueves (Open Fest) y el domingo (Closing Day) siguen descriptos acá pero
// **la agenda ya no los lista** — decisión de la organización (08/09/2026):
// son solo Experience y no tienen charlas. Se dejan porque son el material de
// la sección de experiencias; no viene de ningún origen sincronizable, así que
// cuando confirmen el detalle se edita este archivo.

export const PROGRAM_DAYS = ["oct29", "oct30", "oct31", "nov1"] as const;
export type ProgramDay = (typeof PROGRAM_DAYS)[number];

export function isProgramDay(value: string | null): value is ProgramDay {
  return value != null && (PROGRAM_DAYS as readonly string[]).includes(value);
}

type Text = { es: string; en: string };

export type ProgramDayInfo = {
  /** Rótulo de la organización: OPENING / DAY 1 / DAY 2 / CLOSING DAY. */
  tag: Text;
  hours: Text;
  access: Text;
  /**
   * Solo las jornadas sin charlas en la planilla. Su presencia es lo que
   * decide si la agenda dibuja escenarios o el programa de la jornada.
   */
  program?: { title: Text; lead: Text; items: Text[] };
};

export const PROGRAM: Record<ProgramDay, ProgramDayInfo> = {
  oct29: {
    tag: { es: "Opening", en: "Opening" },
    hours: { es: "Tarde / noche", en: "Afternoon / evening" },
    access: { es: "Solo Experience", en: "Experience only" },
    program: {
      title: { es: "Open Fest · LABITCONF HODL", en: "Open Fest · LABITCONF HODL" },
      lead: {
        es: "El opening del universo LABITCONF. Tiene formato propio: no es una jornada de conferencia.",
        en: "The opening of the LABITCONF universe. It has its own format — this is not a conference day.",
      },
      items: [
        { es: "LABITCONF HODL — Opening", en: "LABITCONF HODL — Opening" },
        { es: "Inauguración del Monumento de Satoshi", en: "Unveiling of the Satoshi Monument" },
        { es: "Activaciones especiales", en: "Special activations" },
        { es: "Networking", en: "Networking" },
        { es: "Experiencias para Experience holders", en: "Experiences for Experience holders" },
      ],
    },
  },
  oct30: {
    tag: { es: "Day 1", en: "Day 1" },
    hours: { es: "09:00 — 19:00", en: "09:00 — 19:00" },
    access: { es: "General · Business · Experience", en: "General · Business · Experience" },
  },
  oct31: {
    tag: { es: "Day 2", en: "Day 2" },
    hours: { es: "09:30 — 19:00", en: "09:30 — 19:00" },
    access: { es: "General · Business · Experience", en: "General · Business · Experience" },
  },
  nov1: {
    tag: { es: "Closing Day", en: "Closing Day" },
    hours: { es: "Horario por definir", en: "Time to be confirmed" },
    access: { es: "Solo Experience", en: "Experience only" },
    program: {
      title: { es: "Closing Day · LABITCONF Experience", en: "Closing Day · LABITCONF Experience" },
      lead: {
        es: "El cierre de la comunidad, fuera de la sede del evento.",
        en: "The community's closing, away from the main venue.",
      },
      items: [
        { es: "Cierre LABITCONF", en: "LABITCONF closing" },
        { es: "Experiencia fuera de LABITCONF", en: "Experience outside LABITCONF" },
        { es: "Networking", en: "Networking" },
        { es: "Cóctel", en: "Cocktail" },
        { es: "Conexiones", en: "Connections" },
        { es: "Cierre de comunidad", en: "Community wrap-up" },
      ],
    },
  },
};

/**
 * HODLween no es una charla más en un escenario: es la fiesta de cierre del
 * sábado, con identidad propia. La organización pidió explícitamente que no se
 * cargue dentro de un escenario, así que se dibuja aparte, al pie del día 31.
 */
export const HODLWEEN = {
  day: "oct31" as ProgramDay,
  tag: { es: "Special event", en: "Special event" },
  title: { es: "HODLween", en: "HODLween" },
  hours: { es: "19:00 → 00:00", en: "19:00 → 00:00" },
  lead: {
    es: "La fiesta de cierre del sábado, con show performático y DJ.",
    en: "Saturday's closing party, with a performance show and DJ.",
  },
} as const;

// ---------------------------------------------------------------------------
// Cronograma: ventana horaria, color por escenario y utilidades de tiempo
// ---------------------------------------------------------------------------

/**
 * El evento es presencial en Costa Salguero: la hora es la de Buenos Aires
 * para todo el mundo. Se fija acá y no se usa la del navegador — alguien que
 * abre la agenda desde Madrid tiene que leer el horario del evento, no el
 * suyo. (Nerdearla sí ofrece selector de zona porque es híbrido con streaming;
 * nosotros no.)
 */
export const EVENT_TZ = "America/Argentina/Buenos_Aires";

/** Ventana de la jornada, en minutos desde medianoche. Es el alto de la grilla. */
export type DayWindow = { opens: number; closes: number };

/**
 * Las horas de `PROGRAM`, según el Boceto de Temario (vie 09:00–19:00, sáb 09:30–19:00; relevamiento de la org, 13/10). Se guarda en minutos y no como texto
 * porque acá el dato se usa para calcular píxeles, no para mostrar.
 */
export const DAY_WINDOW: Record<Day, DayWindow> = {
  oct30: { opens: 9 * 60, closes: 19 * 60 },
  oct31: { opens: 9 * 60 + 30, closes: 19 * 60 },
};

/**
 * Color de cada escenario, FIJO por escenario según el doc ESCENARIOS de la org
 * (15/10/2026): Orange Pill naranja, Visión azul, ABC amarillo, Workshop verde,
 * B2B plata. Antes salía de la posición de la columna y no significaba nada.
 *
 * s6 y s7 (BitcoinAR y La Bitcoineta) no son escenarios sino sectores: van en
 * mostaza clarito, para no robarle el color a ninguno de los cinco.
 */
const STAGE_ACCENTS = [
  "#FF4E01", // s1 Orange Pill — Orange 021 C
  // s2 Visión — Electric Ekko (#1311FC) aclarado hacia el celeste: sobre el
  // fondo oscuro se veía eléctrico y opaco (pedido de la org, 14/10/2026).
  // Excepción acotada a este acento: no es un color nuevo de paleta.
  "#5B8DFF",
  "#FFAB0B", // s3 ABC — Almico
  "#ABF760", // s4 Workshop — Brote
  "#A5A8B1", // s5 B2B — plata (el gris secundario ya aceptado como excepción)
  "#E8CB6A", // s6 BitcoinAR — mostaza clarito (pedido de la org 15/10; no es de paleta)
  "#E8CB6A", // s7 La Bitcoineta — ídem
] as const;

/**
 * Determinista por número de escenario, no por orden de aparición: si un día
 * no tiene s4, el s6 no se corre de color. Que el escenario 6 sea siempre del
 * mismo color en los dos días es lo que hace que el color sirva para ubicarse.
 */
export function stageColor(stage: string): string {
  const n = Number(stage.replace(/^s/i, ""));
  if (!Number.isFinite(n) || n < 1) return STAGE_ACCENTS[0];
  return STAGE_ACCENTS[(n - 1) % STAGE_ACCENTS.length];
}

/** Minutos desde medianoche de un instante ISO, leído en la hora del evento. */
export function eventMinutes(iso: string): number | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: EVENT_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === "hour")?.value);
  const m = Number(parts.find((p) => p.type === "minute")?.value);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

/** 570 → "09:30". Sin AM/PM: en Argentina nadie lee la agenda en 12 horas. */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
