import { createHash } from "node:crypto";
import { SESSIONS } from "./temario";

// El id con el que una sesión del temario viaja a Mi Agenda.
//
// Es un UUID v5 (determinista) calculado desde la clave legible de la sesión,
// y no un string suelto, por una razón concreta: `itineraries.talk_ids` es
// `uuid[]`. Cambiar el tipo de la columna sería una migración sobre la base
// compartida entre ramas; derivando UUIDs, el respaldo existente anda tal cual.
//
// Mismo input → mismo UUID, así que el id es estable entre deploys y entre
// dispositivos. Solo se importa desde el servidor (usa node:crypto).

const NAMESPACE = "labitconf-temario-2026";

export function sessionUuid(key: string): string {
  const h = createHash("sha1").update(`${NAMESPACE}:${key}`).digest();
  h[6] = (h[6] & 0x0f) | 0x50; // versión 5
  h[8] = (h[8] & 0x3f) | 0x80; // variante RFC 4122
  const x = h.subarray(0, 16).toString("hex");
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20, 32)}`;
}

/** Todos los ids vivos del temario, para validar itinerarios guardados. */
export const TEMARIO_IDS: ReadonlySet<string> = new Set(
  SESSIONS.map((s) => sessionUuid(s.id))
);
