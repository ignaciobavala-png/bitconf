"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Capa animada sobre la tira de íconos punteados del hero de Embajadores
// (`iconos-fondo-bit.png`): un recuadro verde que salta de ícono en ícono como
// una cámara de reconocimiento, con su etiqueta hex, más una línea de barrido.
// Va dentro del contenedor de la tira (container-type: inline-size) y todo
// se posiciona en % de la tira, así acompaña a cualquier ancho.
//
// Las posiciones salen de la tira recortada (1626px de ancho): centros de
// casa 6,5% · ojo 21% · rayo 36,5% · cuadrado 52% · candado 67,5% ·
// diamante 80,5% · llave 93%. Hex y confianza fijos, no Math.random(): si no,
// el HTML del server y el del cliente no coinciden.
type Step = { l: number; t: number; w: number; h: number; hex: string; conf: string };

const STEPS: Step[] = [
  { l: 30, t: 6, w: 13, h: 92, hex: "0x2a795b", conf: "0.91" },
  { l: 63, t: 8, w: 8, h: 40, hex: "0x637814", conf: "0.64" },
  { l: 61, t: 4, w: 13, h: 94, hex: "0x637814", conf: "0.97" },
  { l: 0.5, t: 8, w: 12, h: 90, hex: "0x1b0b7a", conf: "0.88" },
  { l: 76, t: 20, w: 9, h: 48, hex: "0x6fc2d7", conf: "0.58" },
  { l: 74, t: 4, w: 13, h: 94, hex: "0x6fc2d7", conf: "0.95" },
  { l: 45.5, t: 6, w: 13, h: 92, hex: "0xae78ef", conf: "0.93" },
  { l: 86.5, t: 2, w: 13, h: 96, hex: "0xedd4a0", conf: "0.99" },
  { l: 14, t: 6, w: 14.5, h: 90, hex: "0x7c01e3", conf: "0.86" },
];

const BROTE = "#ABF760";

export default function DetectionTracker() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % STEPS.length), 1600);
    return () => clearInterval(id);
  }, [reduce]);

  if (reduce) return null;
  const s = STEPS[i];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Barrido de la cámara, ida y vuelta. */}
      <motion.div
        className="absolute top-0 bottom-0"
        style={{
          width: 2,
          background: `linear-gradient(to bottom, transparent, ${BROTE}, transparent)`,
          opacity: 0.55,
        }}
        animate={{ left: ["0%", "100%"] }}
        transition={{ duration: 4, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
      />

      {/* Recuadro que busca: se desliza al próximo objetivo y "fija". */}
      <motion.div
        className="absolute"
        initial={false}
        animate={{ left: `${s.l}%`, top: `${s.t}%`, width: `${s.w}%`, height: `${s.h}%` }}
        transition={{ type: "spring", stiffness: 110, damping: 17 }}
        style={{ border: `1.5px solid ${BROTE}`, boxShadow: "0 0 14px rgba(171,247,96,0.35)" }}
      >
        {/* Pulso de "objetivo fijado" al llegar. */}
        <motion.div
          key={`lock-${i}`}
          className="absolute inset-0"
          style={{ border: `1px solid ${BROTE}` }}
          initial={{ scale: 1.25, opacity: 0 }}
          animate={{ scale: [1.25, 1], opacity: [0, 0.9, 0] }}
          transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
        />
        <motion.span
          key={`label-${i}`}
          className="absolute left-0 whitespace-nowrap"
          style={{
            bottom: "100%",
            marginBottom: 3,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "max(8px, 0.8cqw)",
            color: BROTE,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.3, 1] }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {s.hex} · {s.conf}
        </motion.span>
      </motion.div>
    </div>
  );
}
