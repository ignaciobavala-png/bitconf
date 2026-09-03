import { createHash } from "crypto";
import { normalizeIdentity } from "./rules";

// Lo que la persona escriba para identificar su agenda —mail o alias— NUNCA se
// guarda en claro; ver lib/db/itineraries.sql para el porqué largo. Resumen: la
// recuperación es sin verificación, así que la tabla no puede contener la lista
// de quién va al evento.

const SALT = process.env.RATE_LIMIT_SALT ?? "dev-salt";

export function hashIdentity(raw: string): string {
  return createHash("sha256").update(normalizeIdentity(raw) + SALT).digest("hex");
}
