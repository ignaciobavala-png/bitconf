// Normaliza el texto antes de compararlo con la blocklist.
// El texto original (con tildes, mayúsculas) se guarda en DB tal cual.
// Esta función solo se usa internamente para detectar palabras prohibidas.
export function normalizeForFilter(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")   // strip diacríticos
    .replace(/0/g, "o")
    .replace(/3/g, "e")
    .replace(/1/g, "i")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/(.)\1{2,}/g, "$1");      // colapsar repeticiones (loooco → loc)
}

// Lista de términos prohibidos (español, inglés, portugués).
// Mantener en minúsculas sin diacríticos (ya normalizados).
// Agregar variantes si la normalización no las cubre.
const BLOCKLIST: string[] = [
  // ES
  "puta", "puto", "culo", "mierda", "concha", "coño", "pene", "verga",
  "follar", "cagar", "cagada", "idiota", "imbecil", "pelotudo", "boludo",
  "forro", "hdp", "hijadeputa", "hijodeputa", "negro", "judío", "nazi",
  "maricon", "trolo", "trava", "gordo", "gorda", "pedo", "prostituta",
  "puton", "zorra", "perra", "bestia", "suicid", "matar", "asesino",
  // EN
  "fuck", "shit", "cunt", "bitch", "asshole", "nigger", "faggot",
  "retard", "whore", "slut", "dick", "cock", "pussy", "bastard",
  "kill", "rape", "nazi", "hate",
  // PT
  "merda", "caralho", "porra", "buceta", "viado", "puta", "fodase",
];

// Retorna true si el texto (ya normalizado) contiene algún término prohibido.
export function containsBlockedContent(text: string): boolean {
  const normalized = normalizeForFilter(text);
  return BLOCKLIST.some((term) => normalized.includes(term));
}

// Regex para detectar PII básica.
const PII_PATTERNS = [
  /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i,          // email
  /\b(\+?[\d\s\-().]{7,15})\b/,               // teléfono
  /https?:\/\/[^\s]+/i,                        // URL
  /\bwww\.[^\s]+/i,                            // URL sin protocolo
];

export function containsPII(text: string): boolean {
  return PII_PATTERNS.some((pattern) => pattern.test(text));
}

// Charset permitido: letras (español incluido), números, puntuación básica.
const ALLOWED_CHARSET = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9 .,!?'"()\-]+$/;

export function hasValidCharset(text: string): boolean {
  return ALLOWED_CHARSET.test(text);
}
