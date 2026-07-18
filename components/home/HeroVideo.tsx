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
 * - `objectFit: contain` sobre una sección de fondo negro puro: el video llena
 *   el ancho y nunca recorta el HODL; el letterbox arriba/abajo se funde con el
 *   negro de la sección (mismo #000 que el negro horneado del video), así se ve
 *   como un banner a pantalla completa sin bandas visibles ni recorte.
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
      className={className}
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
        objectFit: "contain",
        ...style,
      }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
