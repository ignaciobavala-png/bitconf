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
 * - `objectFit: contain` siempre (el video es 16:9). En desktop llena el hero
 *   full-bleed y el letterbox se funde con el #000. En mobile el contenedor es
 *   un bloque `aspect-video` (16:9 exacto) al ancho de la pantalla, así el video
 *   calza sin recorte ni negro sobrante, y el botón va debajo en flujo normal.
 * - `autoPlay muted loop playsInline` es obligatorio para autoplay en todos los
 *   navegadores (sin muted, ninguno deja arrancar solo).
 * - `poster` liviano (mismo origen, en public/) para pintar el LCP al instante
 *   mientras baja el video.
 */
export default function HeroVideo({
  src,
  poster,
  className,
  style,
}: {
  src: string;
  poster?: string;
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
      poster={poster}
      aria-label="LABITCONF 26 — HODL, Costa Salguero, Buenos Aires, OCT 30-31"
      style={{
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
