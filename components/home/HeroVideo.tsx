"use client";

/**
 * Video banner del hero, full-bleed (patrón "1:1 screen").
 *
 * El master (`HERO WEB LABC`) es el banner definitivo de los diseñadores:
 * LABITCONF26 + HODL animado sobre negro puro, autocontenido.
 *
 * - Se sirve desde Supabase Storage (bucket público `media`), no desde el repo:
 *   es un binario pesado (~5MB) que va contra la convención de no trackear
 *   binarios en git. Se referencia por URL pública.
 * - Dos masters: 16:9 para desktop (`src`) y 3:4 para mobile (`mobileSrc`,
 *   02/10/2026, rearmado por los diseñadores — recortar el 16:9 cortaba el
 *   wordmark). Se elige con `<source media>`, así cada dispositivo baja un solo
 *   video. El corte es el `sm` de Tailwind, el mismo del layout del hero.
 * - `objectFit: contain` siempre. En desktop llena el hero full-bleed y el
 *   letterbox se funde con el #000. En mobile el contenedor es un bloque 3:4 al
 *   ancho de la pantalla, así el video calza sin recorte ni negro sobrante.
 * - `autoPlay muted loop playsInline` es obligatorio para autoplay en todos los
 *   navegadores (sin muted, ninguno deja arrancar solo).
 * - El poster no va en el atributo `poster` (no admite media query): lo pinta
 *   el contenedor como fondo, uno por breakpoint, y el video lo tapa al tener
 *   el primer frame.
 */
const MOBILE_QUERY = "(max-width: 639.98px)";

export default function HeroVideo({
  src,
  mobileSrc,
  className,
  style,
}: {
  src: string;
  mobileSrc?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <video
      className={`object-contain ${className ?? ""}`}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label="LABITCONF 26 — HODL, Costa Salguero, Buenos Aires, OCT 30-31"
      style={{
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      {mobileSrc && <source src={mobileSrc} type="video/mp4" media={MOBILE_QUERY} />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
