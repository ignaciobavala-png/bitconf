"use client";

import { useEffect, useRef, useState } from "react";

// Mismo texto/estilo que la línea "Latin American Bitcoin & Blockchain
// Conference" del hero de /home — se usa como referencia de ancho para
// justificar los párrafos de copy en /home y /home/comunidad (mismo criterio
// en ambas páginas, aunque en comunidad esa línea no se renderiza visible).
export const HEADLINE_TEXT = "Latin American Bitcoin & Blockchain Conference";
export const HEADLINE_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  fontSize: "clamp(20px, 3.2vw, 34px)",
};

// Fallback antes de medir (equivalente aprox. a los max-w-2xl que reemplaza).
const FALLBACK_WIDTH = 672;

/**
 * Mide el ancho renderizado de HEADLINE_TEXT vía un probe invisible y lo
 * recalcula al resize (el font-size usa vw). Devuelve el ancho + el probe
 * a renderizar una sola vez en el árbol.
 */
export function useHeadlineWidth() {
  const ref = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>(FALLBACK_WIDTH);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.getBoundingClientRect().width);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const probe = (
    <span
      ref={ref}
      aria-hidden
      style={{
        ...HEADLINE_STYLE,
        position: "fixed",
        top: -9999,
        left: -9999,
        whiteSpace: "nowrap",
        visibility: "hidden",
        pointerEvents: "none",
      }}
    >
      {HEADLINE_TEXT}
    </span>
  );

  return { width, probe };
}
