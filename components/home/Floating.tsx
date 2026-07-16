"use client";

import { motion } from "framer-motion";

// Flotación idle para elementos decorativos 3D: oscilación vertical + leve
// rotación en loop infinito (mirror), para que la página "respire" sin
// distraer. Envolver el contenido dentro del contenedor posicionado.
export default function Floating({
  children,
  duration = 6,
  y = 10,
  rotate = 0,
  delay = 0,
}: {
  children: React.ReactNode;
  duration?: number;
  y?: number;
  rotate?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className="relative w-full h-full"
      animate={{ y: [-y, y], rotate: [-rotate, rotate] }}
      transition={{ duration, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}
