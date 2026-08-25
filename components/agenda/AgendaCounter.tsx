"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAgendaStore } from "@/lib/store/agenda";
import { useLangStore } from "@/lib/store/lang";

const T = {
  es: { view: (n: number) => `Ver mi agenda (${n})` },
  en: { view: (n: number) => `View my agenda (${n})` },
} as const;

/**
 * Barra flotante con lo que se lleva elegido.
 *
 * Sin esto, tocar el + no tiene devolución visible más allá del propio botón y
 * no queda claro a dónde fue a parar la charla. Aparece recién con la primera
 * elegida para no ocupar pantalla en la visita normal.
 *
 * Va a la izquierda porque abajo a la derecha ya vive la burbuja de Bi.
 */
export default function AgendaCounter() {
  const lang = useLangStore((s) => s.lang);
  const hydrated = useAgendaStore((s) => s.hydrated);
  const n = useAgendaStore((s) => s.picked.length);
  const show = hydrated && n > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-6 left-6 sm:left-10"
          style={{ zIndex: 40 }}
        >
          <Link
            href="/mi-agenda"
            className="block rounded-full transition-opacity duration-200 hover:opacity-85"
            style={{
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontWeight: 900,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#171616",
              background: "#ABF760",
              fontSize: "clamp(10px, 1vw, 12px)",
              padding: "14px 24px",
              boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
            }}
          >
            {T[lang].view(n)}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
