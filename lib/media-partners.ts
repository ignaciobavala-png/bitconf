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
  // Tanda del 22/10 (a ojo, contra la fila anterior).
  "agencia-informar": 1,
  "bitcoin-news": 1,
  "comunidad-inversores": 1.2,
  "jornal-bitcoin": 1.4,
  "payspace-magazine": 1.1,
  shecrypto: 1.3,
  "somos-bulls": 1.15,
  "tech-observer": 1,
  "women-in-bitcoin": 1.2,
};

export type MediaPartner = {
  src: string;
  alt: string;
  scale: number;
  href?: string | null;
};

const toMediaPartner = (f: (typeof MEDIA_PARTNER_FILES)[number]): MediaPartner => ({
  src: f.src,
  alt: f.alt,
  scale: SCALE[f.slug] ?? 1,
});

// Pedido de la organización (23/09): iProUP y CriptoNoticias van en su propia
// fila destacada arriba de la grilla, no mezclados con el resto — más
// presencia, no solo primeros en el orden.
const FEATURED_SLUGS = ["iproup", "criptonoticias"];

export const FEATURED_MEDIA_PARTNERS: MediaPartner[] = FEATURED_SLUGS
  .map((slug) => MEDIA_PARTNER_FILES.find((f) => f.slug === slug))
  .filter((f): f is (typeof MEDIA_PARTNER_FILES)[number] => Boolean(f))
  .map(toMediaPartner);

// Los 29 logos de la grilla original, en su orden. Sus filas y tamaños no se
// tocan: la organización se queja cada vez que algo cambia de lugar o de
// tamaño. Si se sumaran a las mismas 3 filas, las celdas pasarían de 10 a 13
// por fila y todos los logos viejos se achicarían.
const BASE_SLUGS = [
  "bank-magazine", "bitcoin-argentina", "bitcoin-only-events", "blockvoz",
  "builders-off-the-record", "ccs", "cripto-contador", "cripto247",
  "criptoinforme", "crypto-events", "cryptopolitan", "decentral-club",
  "deed-to-chain", "diario-bitcoin", "fxstreet", "go-latam", "inversor-latam",
  "livebnews", "noticias-fintech-latam", "random-access", "revista-plebs",
  "roadshow", "sla", "territorio-bitcoin", "thenewscrypto",
  "the-startup-journal", "tyn-magazine", "women-in-crypto", "yellow-media",
];

const isFeatured = (slug: string) => FEATURED_SLUGS.includes(slug);

export const MEDIA_PARTNERS: MediaPartner[] = MEDIA_PARTNER_FILES.filter(
  (f) => BASE_SLUGS.includes(f.slug) && !isFeatured(f.slug),
).map(toMediaPartner);

/** Logos que no están en `BASE_SLUGS`: entran en filas nuevas debajo. */
export const EXTRA_MEDIA_PARTNERS: MediaPartner[] = MEDIA_PARTNER_FILES.filter(
  (f) => !BASE_SLUGS.includes(f.slug) && !isFeatured(f.slug),
).map(toMediaPartner);

/** Tope de logos por fila: el de la grilla original (10 celdas). */
const MAX_PER_ROW = 10;

/** Cuántas filas tiene la grilla base. Fija — ver `mediaPartnerLanes`. */
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

/**
 * Grilla completa: las 3 filas base y, debajo, los logos nuevos en filas de a
 * 10 (mismo ancho de celda que arriba, así ninguno cambia de tamaño). Un logo
 * que se deje en la carpeta entra solo al final.
 */
export function mediaPartnerRows(): MediaPartner[][] {
  const rows = mediaPartnerLanes();
  for (let i = 0; i < EXTRA_MEDIA_PARTNERS.length; i += MAX_PER_ROW) {
    rows.push(EXTRA_MEDIA_PARTNERS.slice(i, i + MAX_PER_ROW));
  }
  return rows;
}
