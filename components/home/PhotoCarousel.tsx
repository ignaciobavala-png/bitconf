"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

/**
 * El carrusel full-bleed de la home, en el lugar donde hasta el 16/09/26
 * estaban los cuatro carriles de píldoras (fotos + stats) heredados del sitio
 * de 2025. La organización los dio de baja: querían una sola pieza, ancho
 * completo, que pase solas las placas que mandaron.
 *
 * Las decisiones que sostienen esto:
 *
 * - **La relación de aspecto la manda el asset, no el viewport.** Las placas
 *   vienen con el texto horneado en el render (851x315 ≈ 2,7:1), así que
 *   cualquier recorte se come una palabra. El contenedor toma esa misma
 *   relación y la imagen entra justa; nada se recorta en ningún ancho.
 * - **Una sola placa montada por vez.** Las diapositivas entran desde la
 *   derecha y salen por la izquierda con `AnimatePresence`, en vez de una tira
 *   que se desplaza: así el salto de la última a la primera sigue yendo hacia
 *   adelante, sin el barrido hacia atrás que deja un track con `x: -i * 100%`.
 * - **No se pausa con el mouse encima.** Fue lo primero que probé y es un
 *   error en una pieza a ancho completo: la placa ocupa la pantalla entera, así
 *   que el cursor queda apoyado sobre ella apenas alguien scrollea hasta acá y
 *   el carrusel no arranca nunca. Lo único que lo frena es que la pestaña pase
 *   a segundo plano, donde de verdad no lo está mirando nadie.
 */

export type CarouselSlide = {
  src: string;
  /** Texto de la placa, para lectores de pantalla. */
  alt: { es: string; en: string };
};

const INTERVAL_MS = 3000;

/** El tamaño nativo de las placas. El contenedor respeta esta relación. */
const SLIDE_RATIO = "851 / 315";

export default function PhotoCarousel({
  slides,
  lang,
}: {
  slides: CarouselSlide[];
  lang: "es" | "en";
}) {
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  // Con la pestaña oculta los timers siguen corriendo: sin esto el carrusel
  // vuelve de un plumazo varias placas más adelante.
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (hidden || slides.length < 2) return;
    const id = window.setTimeout(() => go(index + 1), INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [index, hidden, go, slides.length]);

  return (
    <div className="relative w-full select-none">
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: SLIDE_RATIO, background: "#171616" }}
        aria-roledescription="carousel"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            <Image
              src={slides[index].src}
              alt={slides[index].alt[lang]}
              fill
              sizes="100vw"
              priority={index === 0}
              style={{ objectFit: "cover" }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-2 pt-5 sm:pt-6">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => go(i)}
            aria-label={`${lang === "es" ? "Ir a la placa" : "Go to slide"} ${i + 1}`}
            aria-current={i === index}
            className="rounded-full transition-all"
            style={{
              width: i === index ? "28px" : "8px",
              height: "8px",
              background: i === index ? "#FF4E01" : "rgba(230,238,242,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
