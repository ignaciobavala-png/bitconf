"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Qubit, la cara del asistente.
 *
 * La idea es de la organización y el truco está en la B: girada 90° es un par
 * de anteojos. No es una B dibujada a ojo — es **la ₿ oficial de Bitcoin**
 * (`public/assets/home/bi-anteojos.png`, el archivo que mandaron, recortado al
 * glifo y rotado 90° en sentido horario). Al girarla, sus dos barras verticales
 * quedan sobresaliendo a los costados y hacen de patillas, y las dos panzas
 * cuelgan como lentes. Los ojos son las contraformas de la letra: no se dibujó
 * ningún agujero, ya estaban ahí.
 *
 * Las pupilas van sobre esas contraformas, en las coordenadas medidas sobre el
 * propio archivo (centro del hueco izquierdo en 33,4% / 54,1% del bitmap;
 * derecho en 68,2% / 52,0%). Si se reemplaza el PNG por otro trazo, hay que
 * volver a medirlas o los ojos quedan fuera de los lentes.
 */

// Caja del glifo dentro del viewBox de 100, y las pupilas derivadas de ella.
const B = { x: 12, y: 14, w: 76, h: 76 / (184 / 126) };
const EYES = [
  { cx: B.x + 0.3336 * B.w, cy: B.y + 0.5413 * B.h },
  { cx: B.x + 0.6817 * B.w, cy: B.y + 0.5198 * B.h },
];

export default function QubitFace({
  size = 40,
  state = "idle",
  ink = "#171616",
}: {
  size?: number;
  /** `thinking` mientras el modelo responde: mira para arriba y cierra la boca. */
  state?: "idle" | "thinking";
  /** Color de pupilas y boca. Los anteojos vienen del PNG y son negros. */
  ink?: string;
}) {
  const reduced = useReducedMotion();
  const thinking = state === "thinking";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      <image href="/assets/home/bi-anteojos.png" x={B.x} y={B.y} width={B.w} height={B.h} />

      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={
          reduced
            ? undefined
            : {
                // El parpadeo ocupa una fracción del ciclo: repartido parejo
                // queda un tic nervioso, no un pestañeo.
                scaleY: [1, 1, 0.12, 1, 1],
                x: thinking ? 0 : [0, 2.4, 0, -2.4, 0],
                y: thinking ? -3.5 : 0,
              }
        }
        transition={{
          scaleY: { duration: 5, times: [0, 0.9, 0.94, 0.98, 1], repeat: Infinity, ease: "easeInOut" },
          x: { duration: 9, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 0.4, ease: "easeOut" },
        }}
      >
        {EYES.map((e, i) => (
          <circle key={i} cx={e.cx} cy={e.cy} r="6.4" fill={ink} />
        ))}
      </motion.g>

      {/* Boca: sonrisa cuando está libre, línea corta mientras piensa */}
      <motion.path
        animate={{ d: thinking ? "M44 80 h12" : "M38 77 q12 9 24 0" }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        stroke={ink}
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
