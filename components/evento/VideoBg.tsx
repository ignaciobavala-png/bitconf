"use client";

import { useEffect, useState } from "react";

// Mismo video que el banner de /agenda (ya publicado, ~1 MB): puntitos oscuros
// que se ven detrás del texto sin competir con él.
const SRC =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/home/media-partners-bg.mp4";

/**
 * Video de fondo fijo para una pantalla de la app. Sin conexión (o con
 * "reducir movimiento") no se dibuja y queda el negro liso: el contenido no
 * depende de él.
 */
export default function VideoBg() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
      {show && (
        <video
          className="h-full w-full object-cover"
          style={{ opacity: 0.9 }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={SRC} type="video/mp4" />
        </video>
      )}
      {/* Degradé: el texto de arriba y de abajo siempre se lee sobre negro. */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.15) 70%, #000 100%)" }}
      />
    </div>
  );
}
