// Brillo de los fondos de imagen/video de todo el sitio. Cada fondo declara
// su opacidad "de diseño" (0.15–0.55 según la sección) y se multiplica por
// este factor. Subido a 1.35 el 29/09/2026 cuando el fondo de página pasó a
// #000 y todo quedaba demasiado oscuro (regla 9 de docs/reglas-de-diseno.md).
// Para aclarar u oscurecer todos los fondos a la vez, se toca solo esto.
export const BG_BOOST = 1.35;

export function bgOpacity(opacity: number): number {
  return Math.min(1, opacity * BG_BOOST);
}
