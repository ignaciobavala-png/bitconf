"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*<>/";
/** Letras por delante del frente que ciclan glifos; el resto espera invisible. */
const WINDOW = 7;
/** Cada cuánto cambian los glifos (ms). Va aparte del frente, que avanza por cuadro. */
const GLYPH_MS = 70;

// Glifo "al azar" pero determinista: depende de la letra y del turno de
// refresco, no de Math.random() en el render.
function glyph(i: number, seed: number) {
  const h = Math.imul(i + 1, 2654435761) ^ Math.imul(seed + 1, 40503);
  return GLYPHS[(h >>> 0) % GLYPHS.length];
}

// Frase que entra "descifrándose" de izquierda a derecha: lo resuelto aparece
// con un fundido corto, una ventana por delante cicla glifos en verde Brote
// (más tenues cuanto más lejos del frente) y lo que falta todavía no aparece.
//
// El frente avanza en cada cuadro (60 fps), así las letras se resuelven de a
// una y no a saltos; los glifos cambian a su propio ritmo (GLYPH_MS) porque a
// 60 fps el cambio es ruido, no lectura.
//
// Cada letra es su propia caja con la letra real marcando el ancho, y el glifo
// se superpone centrado: en una fuente proporcional el glifo no mide lo mismo
// y, si no, correría las palabras. Con reduced-motion se muestra el texto directo.
export default function ScrambleText({
  text,
  delay = 0,
  duration = 1500,
}: {
  text: string;
  /** ms antes de arrancar, contados desde que entra en pantalla. */
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  // front: posición del frente en letras (null = todavía no arrancó).
  const [state, setState] = useState<{ front: number; seed: number } | null>(null);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    let start = 0;
    const total = text.length + WINDOW;
    const tick = (now: number) => {
      if (!start) start = now + delay;
      if (now >= start) {
        const p = Math.min(1, (now - start) / duration);
        // ease-out suave: arranca decidido y frena al final de la frase.
        const eased = 1 - (1 - p) * (1 - p);
        setState({ front: eased * total - WINDOW, seed: Math.floor((now - start) / GLYPH_MS) });
        if (p >= 1) return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setState(null);
    };
  }, [inView, reduce, text, delay, duration]);

  if (reduce) return <span ref={ref}>{text}</span>;

  // Índice de la primera letra de cada palabra dentro de `text` (el espacio
  // cuenta, para que el frente avance parejo con la duración).
  const words = text.split(" ");
  const offsets = words.map((_, w) => words.slice(0, w).reduce((n, x) => n + x.length + 1, 0));

  return (
    <span ref={ref} aria-label={text}>
      {words.map((word, w) => (
        <span key={w}>
          {/* nowrap por palabra: el corte de línea sigue siendo entre palabras. */}
          <span aria-hidden className="whitespace-nowrap">
            {Array.from(word).map((c, k) => {
              const i = offsets[w] + k;
              const dist = state ? i - state.front : Infinity;
              const resolved = dist < 0;
              const scrambling = !resolved && dist < WINDOW;
              return (
                <span key={i} className="relative inline-block">
                  <span style={{ opacity: resolved ? 1 : 0, transition: "opacity 220ms ease-out" }}>{c}</span>
                  {scrambling && state && (
                    <span
                      className="absolute inset-0 flex justify-center"
                      style={{ color: "#ABF760", opacity: 0.95 - (dist / WINDOW) * 0.75 }}
                    >
                      {glyph(i, state.seed)}
                    </span>
                  )}
                </span>
              );
            })}
          </span>
          {w < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
