// Reglas de identificación del itinerario: mail O alias, lo que la persona
// prefiera (decisión de la organización, feedback 03/09). No obligamos a dejar
// un mail — lo que se guarda es una lista de charlas, no un dato sensible.
//
// Este archivo es puro a propósito: lo comparten el formulario (cliente) y la
// ruta (servidor), así la validación es literalmente la misma de los dos lados.
// El hasheo vive aparte, en identity.ts, porque necesita `crypto` de Node.

/**
 * Largo mínimo del alias.
 *
 * El alias es adivinable y el mail no: "juan" o "btc" los prueba cualquiera.
 * Seis caracteres no lo vuelven secreto, pero sacan del juego los obvios. La
 * contención real sigue siendo el rate limit por IP de la ruta, y el peor caso
 * de una colisión no es destructivo: `merge()` en el store es unión, así que
 * dos personas con el mismo alias mezclan agendas, no se borran.
 */
export const MIN_ALIAS_LENGTH = 6;
const MAX_ALIAS_LENGTH = 40;

/** Normaliza para que "  Nacho " y "nacho" sean el mismo. */
export function normalizeIdentity(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Validación deliberadamente laxa: alcanza con que tenga forma de mail.
 *
 * No se verifica que exista — no mandamos nada a esa casilla. Un mail
 * inventado genera un itinerario que solo esa persona sabe recuperar, que es
 * exactamente lo mismo que un mail real acá.
 */
export function looksLikeEmail(raw: string): boolean {
  const v = normalizeIdentity(raw);
  return v.length >= 6 && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

/** Alias: sin espacios ni arroba, para que no se confunda con un mail a medias. */
export function looksLikeAlias(raw: string): boolean {
  const v = normalizeIdentity(raw);
  return (
    v.length >= MIN_ALIAS_LENGTH &&
    v.length <= MAX_ALIAS_LENGTH &&
    /^[a-z0-9._-]+$/.test(v)
  );
}

/**
 * Qué se aceptó. El `@` decide cómo se valida: con arroba tiene que ser un mail
 * bien formado, sin arroba tiene que ser un alias válido. Así un mail tipeado a
 * medias ("nacho@mail") no pasa como si fuera un alias raro.
 */
export function identityKind(raw: string): "email" | "alias" | null {
  const v = normalizeIdentity(raw);
  if (v.includes("@")) return looksLikeEmail(v) ? "email" : null;
  return looksLikeAlias(v) ? "alias" : null;
}

export function isValidIdentity(raw: string): boolean {
  return identityKind(raw) !== null;
}
