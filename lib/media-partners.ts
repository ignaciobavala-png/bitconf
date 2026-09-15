import { MEDIA_PARTNER_FILES } from "./media-partners.generated";

/**
 * Media partners — listado y reparto en carriles.
 *
 * El listado sale de la carpeta (`media-partners.generated.ts`, regenerado en
 * cada dev/build). Acá solo va lo que no se puede deducir del archivo: cuánto
 * ocupa cada logo de su caja y a dónde linkea.
 */

// Compensación óptica. Un logo de una sola palabra ancha y otro de un ícono
// cuadrado con la MISMA caja se ven de tamaños distintos, así que el factor
// sale de la TINTA (píxeles opacos) con exponente 0.35 —el ojo no compara áreas
// de forma lineal— topeado en [0.8, 1.25]. Un logo nuevo entra en 1 y se ajusta
// a ojo si hace falta: 1 es un default correcto, no un placeholder.
const SCALE: Record<string, number> = {
  "bitcoin-argentina": 0.8,
  "bank-magazine": 0.8,
  ccs: 0.85,
  cripto247: 0.87,
  cryptopolitan: 1,
  "deed-to-chain": 1,
  "diario-bitcoin": 1.02,
  "inversor-latam": 1.24,
  iproup: 0.8,
  "random-access": 1.25,
  "noticias-fintech-latam": 1.16,
  sla: 0.8,
  "territorio-bitcoin": 1.1,
  thenewscrypto: 1.04,
};

export type MediaPartner = {
  src: string;
  alt: string;
  scale: number;
  href?: string | null;
};

export const MEDIA_PARTNERS: MediaPartner[] = MEDIA_PARTNER_FILES.map((f) => ({
  src: f.src,
  alt: f.alt,
  scale: SCALE[f.slug] ?? 1,
}));

/** Cuántas filas tiene la sección. Fijo a propósito — ver `mediaPartnerLanes`. */
export const MEDIA_LANES = 3;

/**
 * Reparte los logos en 3 filas.
 *
 * Pedido de la organización (15/09): tres filas de cinco. Con 14 logos la
 * última queda en cuatro; el hueco se disimula en el render centrando la fila
 * sobre celdas del mismo ancho que las llenas (medio hueco de cada lado en vez
 * de uno entero a la derecha).
 *
 * El número de filas es fijo y lo que cambia es cuántos logos entran en cada
 * una: con 14 o con 60, la sección mide lo mismo — la nota del 10/09 pedía que
 * no quedara en "scroll infinito". El reparto es por módulo para que queden
 * parejas y para que un logo nuevo no reordene a todos los demás.
 */
export function mediaPartnerLanes(
  items: MediaPartner[] = MEDIA_PARTNERS,
  lanes = MEDIA_LANES,
): MediaPartner[][] {
  const out: MediaPartner[][] = Array.from({ length: lanes }, () => []);
  items.forEach((item, i) => out[i % lanes].push(item));
  return out.filter((lane) => lane.length > 0);
}
