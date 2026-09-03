"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAgendaStore } from "@/lib/store/agenda";
import { useLangStore } from "@/lib/store/lang";

const T = {
  es: { label: "Mi agenda" },
  en: { label: "My agenda" },
} as const;

/**
 * Acceso permanente a Mi Agenda.
 *
 * Pedido de la organización (feedback 03/09): Mi Agenda no es una pestaña más
 * del navbar, es un CTA que acompaña toda la experiencia — como el botón de
 * Qubit. Reemplaza al viejo `AgendaCounter`, que hacía lo mismo pero solo
 * dentro de /agenda y solo después de elegir la primera charla.
 *
 * Va como solapa vertical sobre el borde derecho, a media altura, y no apilado
 * sobre la burbuja de Qubit: el panel del chat se abre desde abajo a la derecha
 * y taparía el botón justo cuando está en uso. Por eso también queda en un
 * `zIndex` menor que el del chat — si igual se cruzan, gana el panel abierto.
 */
export default function MyAgendaButton() {
  const lang = useLangStore((s) => s.lang);
  const hydrated = useAgendaStore((s) => s.hydrated);
  const n = useAgendaStore((s) => s.picked.length);
  const pathname = usePathname();

  // Dentro de /mi-agenda el botón no lleva a ningún lado.
  if (pathname?.startsWith("/mi-agenda")) return null;

  // El contador espera a la hidratación del store; el botón no. Si esperara,
  // aparecería de golpe un rato después de cargar la página.
  const count = hydrated && n > 0 ? ` (${n})` : "";

  return (
    <motion.div
      className="fixed right-0"
      style={{ zIndex: 5, top: "50%" }}
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1, y: "-50%" }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.6 }}
    >
      <Link
        href="/mi-agenda"
        className="block transition-opacity duration-200 hover:opacity-85"
        style={{
          writingMode: "vertical-rl",
          // vertical-rl escribe de arriba hacia abajo; rotado se lee de abajo
          // hacia arriba, que es la convención de las solapas laterales.
          transform: "rotate(180deg)",
          fontFamily: "var(--font-neue-machina), sans-serif",
          fontWeight: 900,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontSize: "11px",
          color: "#171616",
          background: "#ABF760",
          padding: "18px 10px",
          borderRadius: "10px 0 0 10px",
          boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
          whiteSpace: "nowrap",
        }}
      >
        {T[lang].label}
        {count}
      </Link>
    </motion.div>
  );
}
