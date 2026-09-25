"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

// Fondo full-bleed con parallax: se desplaza a distinto ritmo que el contenido
// al scrollear (scroll-linked) + un leve zoom idle infinito. La imagen se
// sobredimensiona (insets negativos) para que el desplazamiento nunca exponga
// los bordes. Reemplaza el <div><Image fill/></div> estático de cada sección;
// el degradé de legibilidad sigue yendo como capa hermana encima.
export default function ParallaxBg({
  src,
  opacity = 0.22,
  objectPosition = "center",
  filter,
  priority = false,
  drift = 10,
  zIndex = 0,
  fadeEdges,
}: {
  src: string;
  opacity?: number;
  objectPosition?: string;
  filter?: string;
  priority?: boolean;
  drift?: number; // % de desplazamiento vertical por parallax
  zIndex?: number;
  // Largo (ej. "180px") del desvanecido del fondo en el borde superior e
  // inferior de la sección: así no queda una línea recta donde termina la
  // imagen y empieza la sección siguiente. Opt-in: sin prop, recorte seco.
  fadeEdges?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${drift}%`, `${drift}%`]);

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{
        zIndex,
        opacity,
        ...(fadeEdges && {
          maskImage: `linear-gradient(to bottom, transparent 0, #000 ${fadeEdges}, #000 calc(100% - ${fadeEdges}), transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0, #000 ${fadeEdges}, #000 calc(100% - ${fadeEdges}), transparent 100%)`,
        }),
      }}
    >
      <motion.div
        className="absolute"
        style={{ top: "-25%", bottom: "-25%", left: 0, right: 0, y }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      >
        <Image
          src={src}
          alt=""
          fill
          priority={priority}
          style={{ objectFit: "cover", objectPosition, filter }}
        />
      </motion.div>
    </div>
  );
}
