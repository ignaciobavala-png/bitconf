// Los filtros públicos son los 12 clusters que definió la organización
// (29/09/2026) en su tablero LABITCONF-speakers/web.html. Van por speaker, no
// por charla: "Rodo quiere dar prioridad al speaker, no a su charla".
//
// Las charlas siguen trayendo sus propios tags en texto libre (77 valores para
// 93 charlas, con sinónimos como "INTELIGENCIA ARTIFICIAL"/"IA"/"AI"). Ese
// texto se traduce acá a los mismos 12 clusters, así speakers y agenda filtran
// con el mismo vocabulario. Es una decisión editorial, no técnica, y por eso
// vive en el repo. Un tag sin mapear no rompe nada: queda sin filtro pero se
// sigue encontrando por el buscador de texto.

export const CANONICAL_TAGS = [
  "bitcoin",
  "custodia",
  "ia",
  "legal",
  "finanzas",
  "adopcion",
  "mining",
  "tecnico",
  "privacidad",
  "educacion",
  "institucional",
  "emprendimiento",
] as const;

export type CanonicalTag = (typeof CANONICAL_TAGS)[number];

export const TAG_LABELS: Record<CanonicalTag, { es: string; en: string }> = {
  bitcoin:        { es: "Bitcoin",        en: "Bitcoin" },
  custodia:       { es: "Custodia",       en: "Custody" },
  ia:             { es: "IA",             en: "AI" },
  legal:          { es: "Legal",          en: "Legal" },
  finanzas:       { es: "Finanzas",       en: "Finance" },
  adopcion:       { es: "Adopción",       en: "Adoption" },
  mining:         { es: "Mining",         en: "Mining" },
  tecnico:        { es: "Técnico",        en: "Technical" },
  privacidad:     { es: "Privacidad",     en: "Privacy" },
  educacion:      { es: "Educación",      en: "Education" },
  institucional:  { es: "Institucional",  en: "Institutional" },
  emprendimiento: { es: "Emprendimiento", en: "Entrepreneurship" },
};

/** true si el valor es uno de los 12 clusters vigentes. */
export function isCanonicalTag(value: unknown): value is CanonicalTag {
  return typeof value === "string" && (CANONICAL_TAGS as readonly string[]).includes(value);
}

/**
 * Descarta lo que no sea un cluster vigente. La base puede traer valores del
 * vocabulario anterior (los 9 filtros previos al 29/09: "tecnologia",
 * "regulacion"...) y `TAG_LABELS[c]` de un valor desconocido rompe el render.
 */
export function onlyCanonical(values: readonly unknown[] | null | undefined): CanonicalTag[] {
  return (values ?? []).filter(isCanonicalTag);
}

// Tag crudo (sin tildes, en mayúsculas) → cluster. Cada tag cae en uno solo,
// para que la lista siga siendo revisable de un vistazo. Incluye los nombres
// de los propios clusters, así el día que la organización cargue la columna
// `tags` ("IA,Tecnico") se lee con esta misma función.
const RAW_TO_CANONICAL: Record<string, CanonicalTag> = {
  // Los 12 clusters tal como los escribe la organización
  BITCOIN: "bitcoin",
  CUSTODIA: "custodia",
  IA: "ia",
  LEGAL: "legal",
  FINANZAS: "finanzas",
  ADOPCION: "adopcion",
  MINING: "mining",
  TECNICO: "tecnico",
  PRIVACIDAD: "privacidad",
  EDUCACION: "educacion",
  INSTITUCIONAL: "institucional",
  EMPRENDIMIENTO: "emprendimiento",

  // Bitcoin
  HODL: "bitcoin",
  HALVING: "bitcoin",
  "CICLOS DE BITCOIN": "bitcoin",
  "METRICAS ON-CHAIN": "bitcoin",
  "RABBIT HOLE": "bitcoin",
  FILOSOFIA: "bitcoin",
  LIBERTAD: "bitcoin",
  HISTORIA: "bitcoin",

  // Custodia
  BILLETERA: "custodia",
  SEGURIDAD: "custodia",
  HACKS: "custodia",

  // IA
  "INTELIGENCIA ARTIFICIAL": "ia",
  AI: "ia",
  INTELIGENCIA: "ia",
  "FUTURE OF WORK": "ia",

  // Legal
  REGULACION: "legal",
  POLITICA: "legal",

  // Finanzas
  ECONOMIA: "finanzas",
  TRADING: "finanzas",
  STABLECOINS: "finanzas",
  PAGOS: "finanzas",
  LENDING: "finanzas",
  ETF: "finanzas",
  INVERSION: "finanzas",
  PIGNORACION: "finanzas",
  EXCHANGE: "finanzas",
  DEFI: "finanzas",
  RWAT: "finanzas",

  // Adopción
  COMUNIDADES: "adopcion",
  LATAM: "adopcion",
  ARGENTINA: "adopcion",
  GLOBAL: "adopcion",
  CREADORES: "adopcion",
  INFLUENCER: "adopcion",
  "REDES SOCIALES": "adopcion",
  COMUNICACION: "adopcion",
  ARTE: "adopcion",
  CINE: "adopcion",
  "CULTURA POP": "adopcion",

  // Mining
  MINERIA: "mining",
  ENERGY: "mining",
  ENERGIA: "mining",

  // Técnico
  DEV: "tecnico",
  CRYPTOGRAFIA: "tecnico",
  ESCALABILIDAD: "tecnico",
  "LAYER-2": "tecnico",
  QUANTUM: "tecnico",
  NOSTR: "tecnico",
  BLOCKCHAIN: "tecnico",
  WEB3: "tecnico",
  NFT: "tecnico",
  "UTILITY TOKEN": "tecnico",
  TRAZABILIDAD: "tecnico",
  CRYPTO: "tecnico",
  CIENCIA: "tecnico",

  // Privacidad
  IDENTIDAD: "privacidad",

  // Educación
  "PRIMEROS PASOS": "educacion",
  NINOS: "educacion",
  LIBRO: "educacion",
  DEBATE: "educacion",
  "SESGOS COGNITIVOS": "educacion",

  // Institucional
  GOBIERNO: "institucional",

  // Emprendimiento
  STARTUPS: "emprendimiento",
  EMPRESA: "emprendimiento",
  MARKETING: "emprendimiento",
  CREATIVIDAD: "emprendimiento",
};

/**
 * Normaliza un tag crudo para buscarlo en el mapa: sin tildes, sin espacios de
 * más y en mayúsculas. La organización escribe "Adopcion" y "Tecnico" sin
 * tilde y las charlas "ADOPCIÓN"; las dos formas tienen que caer igual.
 */
function normalize(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

/** Traduce una lista de tags crudos a filtros canónicos, sin repetidos. */
export function toCanonicalTags(raw: readonly string[]): CanonicalTag[] {
  const out = new Set<CanonicalTag>();
  for (const tag of raw) {
    const hit = RAW_TO_CANONICAL[normalize(tag)];
    if (hit) out.add(hit);
  }
  // Se devuelve en el orden de CANONICAL_TAGS y no en el de aparición, para que
  // los chips de una card se vean siempre en la misma secuencia.
  return CANONICAL_TAGS.filter((t) => out.has(t));
}

/** Parte el campo `tags` de la planilla ("BITCOIN,IA") en una lista limpia. */
export function splitRawTags(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
