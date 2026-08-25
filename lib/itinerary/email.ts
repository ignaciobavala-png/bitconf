import { createHash } from "crypto";

// El mail NUNCA se guarda en claro — ver lib/db/itineraries.sql para el porqué
// largo. Resumen: la recuperación es por mail sin verificar, así que la tabla
// no puede contener la lista de quién va al evento.

const SALT = process.env.RATE_LIMIT_SALT ?? "dev-salt";

/** Normaliza para que "  Nacho@Mail.com " y "nacho@mail.com" sean el mismo. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function hashEmail(raw: string): string {
  return createHash("sha256").update(normalizeEmail(raw) + SALT).digest("hex");
}

/**
 * Validación deliberadamente laxa: alcanza con que tenga forma de mail.
 *
 * No se verifica que exista — no mandamos nada a esa casilla. Un mail
 * inventado simplemente genera un itinerario que solo esa persona sabe
 * recuperar, que es exactamente lo mismo que un mail real acá.
 */
export function looksLikeEmail(raw: string): boolean {
  const v = normalizeEmail(raw);
  return v.length >= 6 && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}
