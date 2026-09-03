"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Barra dinámica de logos — componente ÚNICO para todo el sitio.
 *
 * Pedido explícito de la organización (feedback 03/09): donde haya logos
 * —sponsors, partners, universidades, comunidades— nunca una fila estática,
 * siempre esta barra: los logos entran por un borde, cruzan la pantalla, salen
 * por el otro y el ciclo no se detiene. No hay que resolverlo de nuevo en cada
 * sección: se usa este componente.
 *
 * El loop es el mismo patrón que los carriles de speakers de la home: el set se
 * repite `REPEATS` veces y la animación recorre exactamente `100/REPEATS`% del
 * ancho total, de modo que al reiniciar el frame es idéntico al inicial. Con un
 * set solo (o duplicado x2) queda un salto visible, porque unos pocos logos son
 * más angostos que el viewport y dejan hueco antes de reiniciar.
 */

export type LogoItem = {
  /** Ruta en /public. Sin `src` se dibuja el hueco punteado con `alt` adentro. */
  src?: string;
  alt: string;
  href?: string | null;
};

const REPEATS = 6;

export default function LogoMarquee({
  items,
  /** "right" = entran por la izquierda y salen por la derecha (default del pedido). */
  direction = "right",
  /** Segundos por vuelta completa. Más alto = más lento. */
  duration = 40,
  height = "clamp(56px, 9vw, 88px)",
  gap = 48,
  className = "",
}: {
  items: LogoItem[];
  direction?: "left" | "right";
  duration?: number;
  height?: string;
  gap?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (items.length === 0) return null;

  const repeated = Array.from({ length: REPEATS }, () => items).flat();
  const shift = `-${100 / REPEATS}%`;

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        height,
        // Los logos se desvanecen contra los bordes en vez de cortarse de golpe.
        maskImage:
          "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
      }}
    >
      <motion.div
        className="absolute top-0 left-0 flex h-full items-center"
        style={{ gap: `${gap}px`, width: "max-content" }}
        // Con "reducir movimiento" activado la barra queda quieta: el pedido es
        // que no se detenga, pero eso no puede pasar por encima de la
        // preferencia de accesibilidad del sistema.
        animate={
          reduced
            ? undefined
            : { x: direction === "right" ? [shift, "0%"] : ["0%", shift] }
        }
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {repeated.map((item, i) => (
          <LogoSlot key={`${item.alt}-${i}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
}

function LogoSlot({ item }: { item: LogoItem }) {
  const content = item.src ? (
    <Image
      src={item.src}
      alt={item.alt}
      width={220}
      height={88}
      className="h-full w-auto object-contain"
      style={{ maxHeight: "100%" }}
    />
  ) : (
    // Hueco explícito mientras la organización no mande los archivos.
    <span
      className="flex h-full items-center justify-center rounded-2xl px-8"
      style={{
        border: "1px dashed rgba(171,247,96,0.35)",
        background: "rgba(13,13,11,0.35)",
        fontFamily: "var(--font-neue-machina), sans-serif",
        fontWeight: 900,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "rgba(165,168,177,0.7)",
        fontSize: "11px",
        minWidth: "clamp(120px, 18vw, 180px)",
        whiteSpace: "nowrap",
      }}
    >
      {item.alt}
    </span>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full shrink-0 transition-opacity duration-200 hover:opacity-70"
      >
        {content}
      </a>
    );
  }
  return <div className="block h-full shrink-0">{content}</div>;
}
