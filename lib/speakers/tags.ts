// Los tags de la planilla son texto libre: 77 valores distintos para 93
// charlas, con mayúsculas inconsistentes ("BITCOIN" y "Bitcoin"), sinónimos
// ("INTELIGENCIA ARTIFICIAL", "IA", "AI") y muchísimos que aparecen una sola
// vez. El mapa web pide en cambio un puñado de filtros estables.
//
// Este archivo es esa traducción: tag crudo → filtro público. Es una decisión
// editorial, no técnica, así que vive en el repo (versionada, revisable) en vez
// de en la base. Un tag sin mapear no rompe nada: la charla queda sin filtro
// canónico pero se sigue encontrando por el buscador de texto.

export const CANONICAL_TAGS = [
  "bitcoin",
  "ia",
  "blockchain",
  "finanzas",
  "tecnologia",
  "startups",
  "regulacion",
  "comunidad",
  "cultura",
] as const;

export type CanonicalTag = (typeof CANONICAL_TAGS)[number];

export const TAG_LABELS: Record<CanonicalTag, { es: string; en: string }> = {
  bitcoin:    { es: "Bitcoin",     en: "Bitcoin" },
  ia:         { es: "IA",          en: "AI" },
  blockchain: { es: "Blockchain",  en: "Blockchain" },
  finanzas:   { es: "Finanzas",    en: "Finance" },
  tecnologia: { es: "Tecnología",  en: "Technology" },
  startups:   { es: "Startups",    en: "Startups" },
  regulacion: { es: "Regulación",  en: "Regulation" },
  comunidad:  { es: "Comunidad",   en: "Community" },
  cultura:    { es: "Cultura",     en: "Culture" },
};

// Cada tag crudo cae en exactamente un filtro. Se eligió 1:1 en vez de permitir
// varios para que la lista siga siendo legible y la organización pueda
// revisarla de un vistazo — algunos casos son discutibles a propósito
// (CUSTODIA podría ser tecnología o finanzas; quedó en tecnología porque las
// charlas que lo usan hablan de cómo guardar, no de cuánto rinde).
const RAW_TO_CANONICAL: Record<string, CanonicalTag> = {
  // Bitcoin
  BITCOIN: "bitcoin",
  HODL: "bitcoin",
  HALVING: "bitcoin",
  "CICLOS DE BITCOIN": "bitcoin",
  "MÉTRICAS ON-CHAIN": "bitcoin",
  MINERÍA: "bitcoin",
  "RABBIT HOLE": "bitcoin",

  // IA
  "INTELIGENCIA ARTIFICIAL": "ia",
  IA: "ia",
  AI: "ia",
  INTELIGENCIA: "ia",

  // Blockchain
  BLOCKCHAIN: "blockchain",
  WEB3: "blockchain",
  DEFI: "blockchain",
  NFT: "blockchain",
  RWAT: "blockchain",
  "UTILITY TOKEN": "blockchain",
  TRAZABILIDAD: "blockchain",
  IDENTIDAD: "blockchain",
  CRYPTO: "blockchain",

  // Finanzas
  ECONOMÍA: "finanzas",
  TRADING: "finanzas",
  STABLECOINS: "finanzas",
  PAGOS: "finanzas",
  LENDING: "finanzas",
  ETF: "finanzas",
  INVERSION: "finanzas",
  PIGNORACION: "finanzas",
  EXCHANGE: "finanzas",
  BILLETERA: "finanzas",

  // Tecnología
  DEV: "tecnologia",
  CRYPTOGRAFIA: "tecnologia",
  SEGURIDAD: "tecnologia",
  PRIVACIDAD: "tecnologia",
  CUSTODIA: "tecnologia",
  ESCALABILIDAD: "tecnologia",
  "LAYER-2": "tecnologia",
  QUANTUM: "tecnologia",
  HACKS: "tecnologia",
  ENERGY: "tecnologia",
  ENERGIA: "tecnologia",
  NOSTR: "tecnologia",

  // Startups
  STARTUPS: "startups",
  EMPRESA: "startups",
  MARKETING: "startups",
  "FUTURE OF WORK": "startups",

  // Regulación
  REGULACIÓN: "regulacion",
  LEGAL: "regulacion",
  POLÍTICA: "regulacion",
  GOBIERNO: "regulacion",

  // Comunidad
  COMUNIDADES: "comunidad",
  ADOPCIÓN: "comunidad",
  EDUCACIÓN: "comunidad",
  LATAM: "comunidad",
  ARGENTINA: "comunidad",
  GLOBAL: "comunidad",
  "PRIMEROS PASOS": "comunidad",
  NIÑOS: "comunidad",
  CREADORES: "comunidad",
  INFLUENCER: "comunidad",
  "REDES SOCIALES": "comunidad",
  COMUNICACIÓN: "comunidad",
  DEBATE: "comunidad",

  // Cultura
  FILOSOFÍA: "cultura",
  LIBERTAD: "cultura",
  ARTE: "cultura",
  CIENCIA: "cultura",
  HISTORIA: "cultura",
  CINE: "cultura",
  "CULTURA POP": "cultura",
  LIBRO: "cultura",
  CREATIVIDAD: "cultura",
  HUMANO: "cultura",
  "SESGOS COGNITIVOS": "cultura",
  FUTURO: "cultura",
  IMPERDIBLE: "cultura",
};

/** Normaliza un tag crudo para buscarlo en el mapa: sin espacios de más y en mayúsculas. */
function normalize(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, " ");
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
