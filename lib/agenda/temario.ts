// Temario de LABITCONF 2026 — transcripción del "Boceto de Temario 2026"
// (PDF de la organización, 13/10/2026).
//
// Es DATO CARGADO A MANO, no sale del sync con la planilla de speakers: el
// boceto es una grilla de 6 columnas × medias horas, con celdas combinadas que
// cruzan columnas (las plenarias), y esa forma no existe en la base. Cuando la
// organización mande el temario definitivo se edita este archivo.
//
// Reglas de la transcripción:
// - El texto va LITERAL, con sus tildes, mayúsculas y hasta los errores de la
//   planilla ("constriur", "Santostassi" vs "Santostasi"). No se corrige: si
//   hay un error, se le avisa a la organización.
// - Duración = lo que ocupa la celda en el boceto. Casi todo son 30 min; las
//   celdas combinadas verticalmente (Saifedean, Tet-a-Tet, Brunch, Porqué
//   Hodleamos) duran lo que abarcan. No es la duración "real" de cada charla:
//   el boceto no la informa.
// - Las celdas grises del boceto (sin contenido) no se cargan.

import type { CanonicalTag } from "@/lib/speakers/tags";

export const TRACKS = [
  "pastilla",
  "vision",
  "abc",
  "workshop",
  "business",
  "autocustodia",
] as const;
export type TrackId = (typeof TRACKS)[number];

/** Nombre que usa la organización en el encabezado de cada columna. */
export const TRACK_NAMES: Record<TrackId, string> = {
  pastilla: "Pastilla",
  vision: "Visión",
  abc: "ABC",
  workshop: "WorkShop",
  business: "Business",
  autocustodia: "Autocustodia",
};

export type TemarioDay = "oct30" | "oct31";

export type Session = {
  /**
   * Clave estable y legible: `día-título`. Se deriva del título y no de la
   * hora, porque en un boceto lo que más se mueve es el horario; cambiar de
   * lugar una charla no tiene que borrarla del itinerario de quien la eligió.
   * Si le cambian el título, es otra sesión (mismo criterio que `talkKey` en
   * lib/speakers/source.ts). El id con el que viaja a Mi Agenda sale de acá:
   * ver lib/agenda/ids.ts.
   */
  id: string;
  day: TemarioDay;
  /** Columna donde arranca la celda. */
  track: TrackId;
  /** Cuántas columnas ocupa: 2 = plenaria entre `track` y la siguiente. */
  span: 1 | 2;
  /** Minutos desde medianoche. */
  start: number;
  /** Minutos. */
  dur: number;
  title: string;
  /** Speakers tal cual figuran (la parte en negrita del boceto). */
  who?: string;
  /** Moderador, cuando el boceto lo marca como MOD. */
  mod?: string;
  /**
   * Temas para el filtro. El boceto NO trae temas: estos los asignó el equipo
   * leyendo el título, con los 12 clusters de la organización. Provisorio, a
   * validar con ellos. Una sesión sin tags sigue apareciendo en la búsqueda.
   */
  tags: CanonicalTag[];
};

const t = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

type Draft = {
  track: TrackId;
  at: string;
  title: string;
  who?: string;
  mod?: string;
  dur?: number;
  span?: 1 | 2;
  tags?: CanonicalTag[];
};

/** "Cómo es vivir desde CUBA" → "como-es-vivir-desde-cuba". */
function slug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

function day(d: TemarioDay, drafts: Draft[]): Session[] {
  return drafts.map((x) => ({
    id: `${d}-${slug(x.title)}`,
    day: d,
    track: x.track,
    span: x.span ?? 1,
    start: t(x.at),
    dur: x.dur ?? 30,
    title: x.title,
    who: x.who,
    mod: x.mod,
    tags: x.tags ?? [],
  }));
}

const FRIDAY = day("oct30", [
  // Pastilla + Visión (plenarias y charlas de las dos columnas)
  { track: "pastilla", span: 2, at: "9:30", title: "El rol de Bitcoin en un futuro de la abundancia", who: "Rodolfo Andragnes", tags: ["bitcoin"] },
  { track: "pastilla", span: 2, at: "11:00", dur: 60, title: "What I learnt after 8 years of the Bitcoin Standard + Open MIC", who: "Saifedean Ammous", tags: ["bitcoin"] },
  { track: "pastilla", at: "12:00", title: "Qué aprendimos de usar Bitcoin como un Standard", who: "Borja Matel", tags: ["bitcoin"] },
  { track: "pastilla", at: "12:30", title: "Carlos Maslatón" },
  { track: "pastilla", at: "14:30", title: "Invertir en Bitcoin o esclavitud", who: "JJ Chagerben", tags: ["finanzas", "bitcoin"] },
  { track: "pastilla", span: 2, at: "15:00", title: "Encendiendo los motores del Cohete To the Moon", who: "Norbert, Joven Inversor, Papa Bitcoin, Mariel & Co.", tags: ["finanzas"] },
  { track: "pastilla", at: "15:30", title: "Mathematical Science applied to the Bitcoin Price \"The Power Law\"", who: "Giovanni Santostasi", tags: ["finanzas", "tecnico"] },
  { track: "pastilla", span: 2, at: "17:00", title: "Hacia donde van los negocios en un mundo de Agente e IA", who: "Daniel Rabinovich + Rodrigo Benzaquén", tags: ["ia", "emprendimiento"] },
  { track: "pastilla", span: 2, at: "18:30", title: "Why and How do we HODL", who: "Dušan Matuška , Saifedean Ammous , Jerremy Almond , Giaccomo Zucco, Giovanni Santostassi", tags: ["bitcoin"] },

  { track: "vision", at: "10:00", title: "Cuan cerca estamos de las AGI y las ASI y que podría pasar", who: "Maximiliano Firtman", tags: ["ia"] },
  { track: "vision", at: "12:00", title: "Explorando la frontera junto a Santi Siri" },
  { track: "vision", at: "12:30", title: "Propiedad Intelectual e IA: ¿Vestigio del pasado o necesidad esencial para el desarrollo tecnológico?", who: "Camilo Jorajuria de León, Agus Rizzo, Julián Landerreche, Gonza Nazar", tags: ["ia", "legal"] },
  { track: "vision", at: "13:00", title: "\"Seed\" Propiedad Intelectual Programable en la Era de la IA", who: "Andrés Felipe Durán", tags: ["ia", "legal"] },
  { track: "vision", at: "13:30", title: "Gobiernos Agénticos: más inteligencia, menos impuestos", who: "Darío Nieto", tags: ["ia", "institucional"] },
  { track: "vision", at: "14:00", title: "¿Puede la IA ser la respuesta a los problemas de seguridad que genera en el mundo descentralizado?", who: "Mauricio Tovar (maurotov)", tags: ["ia", "tecnico"] },
  { track: "vision", at: "16:00", title: "Quantum FUD or Reality next Door", who: "Graeme Moore", tags: ["tecnico"] },
  { track: "vision", at: "17:30", title: "Hacia donde van los Exchanges", who: "Julián Colombo, Manuel Beaudroit, Andrés Ondarra, otros", tags: ["finanzas"] },
  { track: "vision", at: "18:00", title: "Rol del BPI y el Impacto de la Clarity ACT", who: "David Zell", tags: ["institucional", "legal"] },

  // ABC
  { track: "abc", at: "10:00", title: "Primeros Pasos en Bitcoin", tags: ["educacion", "adopcion"] },
  { track: "abc", at: "10:30", title: "Por que la Gen Z necesita Bitcoin", who: "Adrian Treviño", tags: ["adopcion", "educacion"] },
  { track: "abc", at: "11:00", title: "Vos también tenés algo que ocultar", who: "Diego Gurpegui", tags: ["privacidad"] },
  { track: "abc", at: "11:30", title: "El Estado y tu Bitcoin", who: "Aldana Fernández", tags: ["institucional"] },
  { track: "abc", at: "12:30", title: "Los desafíos de las Universidades frente a la IA", who: "Luis J. Canessa y Otros", tags: ["ia", "educacion"] },
  { track: "abc", at: "13:00", title: "Tributación de las Finanzas Descentralizadas en Bitcoin y criptoactivos", who: "Marcos Zocaro", tags: ["legal", "finanzas"] },
  { track: "abc", at: "14:00", title: "Tips para el desarrollo de economias circulares", who: "Ivan Kaleja, Brasil, Roman", tags: ["adopcion"] },
  { track: "abc", at: "14:30", title: "Cómo es vivir desde CUBA", who: "Forte", tags: ["adopcion"] },
  { track: "abc", at: "16:00", title: "LABIF: Impulsando el Impacto Real y la Adopción de Bitcoin en América Latina", who: "Luis J. Canessa, Alexandra Navarro, Román Martinez", tags: ["adopcion", "institucional"] },
  { track: "abc", at: "17:00", title: "Nadie hackeó a Bitcoin pero así se roban tus criptos", who: "Gonzaccardi", tags: ["custodia"] },

  // WorkShop
  { track: "workshop", at: "11:00", title: "PayJoin, CoinJoin y otras técnicas de ofuscación y privacidad Online", who: "Lucas Ontivero", tags: ["privacidad", "tecnico"] },
  { track: "workshop", at: "11:30", title: "Trazabilidad OnChain", who: "Gaby Battiato & Co.", tags: ["tecnico"] },
  { track: "workshop", at: "12:00", title: "Bit2: El L2 de Bitcoin para comercio entre agentes", who: "Sergio Demián Lerner", tags: ["tecnico", "ia"] },
  { track: "workshop", at: "12:30", title: "Técnicas de HODL apalancado", who: "ROXOM, NEXO, TOWER, otros", tags: ["finanzas"] },
  { track: "workshop", at: "13:00", title: "Privacy for Stablecoins: RGB on Bitcoin", who: "Birkan Kayadibi", tags: ["privacidad", "tecnico"] },
  { track: "workshop", at: "13:30", title: "Finanzas con Bitcoin: introducción práctica a DeFi", who: "Manuel Ferrari", tags: ["finanzas"] },
  { track: "workshop", at: "14:00", title: "Cómo constriur una economía circular de Bitcoin", who: "Iván Kaleja", tags: ["adopcion", "emprendimiento"] },
  { track: "workshop", at: "14:30", title: "La nueva guerra por la atención: Cómo posicionar una marca dentro de la inteligencia artificial", who: "Malena Martin", tags: ["ia", "emprendimiento"] },
  { track: "workshop", at: "15:00", title: "Herencias en Bitcoin ¿Que pasa con tus bitcoin si mañana no estás?", who: "MatheyBTC", tags: ["custodia", "legal"] },
  { track: "workshop", at: "15:30", title: "HODL, ¿con todo tu sueldo? Repensando el riesgo más allá de la volatilidad", who: "Javier García Sánchez", tags: ["finanzas"] },
  { track: "workshop", at: "16:00", title: "No todo está perdido: recuperación de seeds, passphrases y billeteras de Bitcoin", who: "Nicolás Schteinschraber", tags: ["custodia"] },
  { track: "workshop", at: "16:30", title: "¿De dónde vienen tus bitcoins? Seguí el rastro on-chain", who: "Gabi Battiato", tags: ["tecnico"] },
  { track: "workshop", at: "17:00", title: "Lanzando proyectos Bitcoin y Crypto desde Argentina al mundo en 2026", who: "Juanma Cáceres", tags: ["emprendimiento"] },
  { track: "workshop", at: "17:30", title: "Del prompt al backtest: un agente de IA que investiga estrategias sin engañarte", who: "El Bull (Somos Bulls)", tags: ["ia", "finanzas"] },
  { track: "workshop", at: "18:00", title: "Holdeando la neurociencia del Bitcoin", who: "Bianca Prieto", tags: ["bitcoin"] },

  // Business
  { track: "business", at: "11:30", title: "FARDO : Estrategias para posicionar las marcas en las respuestas de la IA", who: "Nicolás Seguro", tags: ["ia", "emprendimiento"] },
  { track: "business", at: "12:00", title: "Prediction Markets", who: "Juan Manuel Campos Álvarez", tags: ["finanzas"] },
  { track: "business", at: "12:30", title: "Riesgos jurídicos y penales en Crypto y Web3", who: "Juanma Cáceres", tags: ["legal"] },
  { track: "business", at: "13:00", title: "Fundraising BITCOIN Y Crypto", who: "Juanma Cáceres", tags: ["emprendimiento", "finanzas"] },
  { track: "business", at: "15:00", dur: 60, title: "Tet-a-Tet con Saifedean Ammous", tags: ["bitcoin"] },

  // Autocustodia
  { track: "autocustodia", at: "10:00", title: "Libros Bitcoin", who: "Adrian Bernabeu", tags: ["educacion"] },
  { track: "autocustodia", at: "11:00", title: "Andrés BTC / Bull Bitcoin" },
  { track: "autocustodia", at: "12:00", title: "Adrian Treviño" },
  { track: "autocustodia", at: "13:00", title: "Mathey BTC" },
  { track: "autocustodia", at: "14:00", title: "Seed Signer", tags: ["custodia"] },
]);

const SATURDAY = day("oct31", [
  { track: "pastilla", span: 2, at: "10:00", title: "Antología viva de Andreas Antonópoulos", tags: ["bitcoin"] },
  { track: "pastilla", at: "11:00", title: "La riqueza no ganada ¿Qué hacemos con el privilegio de haber descubierto Bitcoin antes que el resto?", who: "Miguel Klagges", tags: ["bitcoin"] },
  { track: "pastilla", at: "14:00", title: "White Paper, Lutero y Presente \"Una historia para HODLWEEN\"", who: "Alejandro Palantzas", tags: ["bitcoin"] },
  { track: "pastilla", at: "14:30", title: "Technologies of Freedom 2026: Disruptive Crypto & AI", who: "Pavol Luptak", tags: ["ia", "tecnico"] },
  { track: "pastilla", at: "16:00", title: "Offgrid Mining y Rentabilidad", who: "Ariel Perelmann, Tomás Ocampo, Walter Sebastián Schanz.", mod: "Adolfo Raed", tags: ["mining"] },
  { track: "pastilla", span: 2, at: "17:00", title: "Panel con Saifedean Ammous y otros", tags: ["bitcoin"] },
  { track: "pastilla", at: "18:00", title: "Panel Economías Circulares", who: "Gabriel Kurman, Motiv, Bitcoin Beach, Brasil, Ivan", tags: ["adopcion"] },
  { track: "pastilla", span: 2, at: "18:30", dur: 60, title: "Porqué Hodleamos", who: "Lunaticoin , Alberto Mera , Papa Bitcoin , Andrés BTC , Lorena Ortiz", tags: ["bitcoin"] },

  { track: "vision", at: "10:30", title: "Qué HODLear de vos (y qué soltar) en la era de la IA", who: "Stephie Cherni", tags: ["ia"] },
  { track: "vision", at: "11:00", title: "¿Quién es, y quién responde? — Identidad, responsabilidad y wallets en la era de los agentes de IA", who: "Alejandro Narancio y Ana Ojeda (criptolawyer)", tags: ["ia", "legal"] },
  { track: "vision", at: "11:30", title: "Cómo impacta Bitcoin en el futuro de la humanidad", who: "Adrián Bernabéu", tags: ["bitcoin"] },
  { track: "vision", at: "15:00", title: "Halving 2028: ¿Muerte de la Minería Privada?", who: "Bruno Vacotti, Dušan Matuška, Fabrizio Bianchi.", mod: "Juan Manuel Dominguez", tags: ["mining"] },
  { track: "vision", at: "15:30", title: "Minería de IA vs Minería BTC", who: "Gustavo HIVE", tags: ["mining", "ia"] },

  { track: "abc", at: "10:30", title: "8, 18, 80: Un Bitcoin para cada edad", who: "Diego Coria", tags: ["educacion"] },
  { track: "abc", at: "11:00", title: "Cripto para gente normal: de cero a usarla", who: "Bitacora (Noelia Robles)", tags: ["educacion", "adopcion"] },
  { track: "abc", at: "11:30", title: "El cine, la mente y Bitcoin: Navegando las paradojas del HODL", who: "Leonardo Klug (Leoklug)", tags: ["bitcoin"] },
  { track: "abc", at: "12:00", title: "Estafas: como reconocerlas y evitarlas", who: "Ezequiel Olgiatti", tags: ["custodia", "educacion"] },
  { track: "abc", at: "12:30", title: "Educación del bitcoin para niños y su impacto en la familia", who: "Yuri da Silva Barbosa", tags: ["educacion"] },
  { track: "abc", at: "13:00", dur: 120, title: "Brunch \"Mujeres en Bitcoin\"", who: "Paystand + Mujeres en Crypto + Otros", tags: ["adopcion"] },

  { track: "workshop", at: "10:30", title: "Dont Trust the AI. Verify: cómo usar IA para HODL, DCA, trading y research en Bitcoin", who: "Alfredo Roisenzvit", tags: ["ia", "finanzas"] },

  { track: "business", at: "11:00", title: "Minería en Paraguay y la región", who: "Gustavo Hive , Mario Morlas , Bruno Vacotti , El Sultán (venezuela)", tags: ["mining"] },
  { track: "business", at: "12:00", title: "LATAM no es un mercado: cómo instalar y escalar una empresa B2B en la región", who: "Ary Frischman", tags: ["emprendimiento"] },

  { track: "autocustodia", at: "10:30", title: "El Ciclo de vida de la Autocustodia Soberana", who: "Marco Esparza Montejo", tags: ["custodia"] },
]);

export const SESSIONS: Session[] = [...FRIDAY, ...SATURDAY];

// Dos sesiones con la misma clave pisarían el itinerario de la otra: se frena
// en el build y no en producción.
{
  const seen = new Set<string>();
  for (const x of SESSIONS) {
    if (seen.has(x.id)) throw new Error(`[temario] id repetido: ${x.id}`);
    seen.add(x.id);
  }
}

export function sessionsOf(d: TemarioDay): Session[] {
  return SESSIONS.filter((s) => s.day === d).sort(
    (a, b) => a.start - b.start || TRACKS.indexOf(a.track) - TRACKS.indexOf(b.track)
  );
}

/** Columnas que toca una sesión: la propia y, si es plenaria, la siguiente. */
export function tracksOf(s: Session): TrackId[] {
  const i = TRACKS.indexOf(s.track);
  return TRACKS.slice(i, i + s.span);
}
