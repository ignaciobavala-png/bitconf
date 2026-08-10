"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLangStore } from "@/lib/store/lang";

// Checkout de Hallos en modo embed (ver "Guía de Usuario: ¿Cómo funciona el
// Embed de Hallos?"): el param `embed=true` sirve el checkout sin header ni
// footer de Hallos para incrustarlo en un iframe. Solo funciona sobre la URL de
// checkout (`/event/{slug}/checkout`), no sobre la página del evento.
// El `ref` es de tracking: le dice a Hallos desde dónde entró la compra.
export const HALLOS_CHECKOUT_URL =
  "https://www.hallos.io/event/labitconf/checkout?embed=true&ref=landing-labitconf";
// Fallback: mismo checkout pero standalone (con el chrome de Hallos), para el
// link de escape del modal.
const HALLOS_CHECKOUT_STANDALONE =
  "https://www.hallos.io/event/labitconf/checkout";

const T = {
  es: {
    title: "Comprar Ticket",
    close: "Cerrar",
    fallback: "¿No carga? Abrir en una pestaña nueva",
    fallbackShort: "Abrir ↗",
    loading: "Cargando checkout...",
  },
  en: {
    title: "Buy Ticket",
    close: "Close",
    fallback: "Not loading? Open in a new tab",
    fallbackShort: "Open ↗",
    loading: "Loading checkout...",
  },
} as const;

export default function CheckoutModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  // Esc para cerrar + bloqueo del scroll del body mientras el modal está abierto
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          // El padding recién aparece en `lg`: abajo de eso le restaría ancho al
          // iframe y lo tiraría por debajo de los 768px, que es donde el
          // checkout de Hallos colapsa a una sola columna (ver comentario del
          // ancho). Preferimos un modal casi a pantalla completa en tablets
          // antes que perder el layout de dos columnas.
          className="fixed left-0 top-0 flex items-center justify-center p-0 lg:p-6"
          style={{
            zIndex: 60,
            // dvh/dvw en vez de `inset-0`: en iOS Safari el viewport de `inset-0`
            // incluye el área bajo la barra de URL, así que el pie del modal
            // (y el último paso del checkout) quedaba fuera de pantalla.
            width: "100dvw",
            height: "100dvh",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
        >
          <motion.div
            className="relative flex flex-col overflow-hidden rounded-none sm:rounded-2xl"
            style={{
              // 880px NO es un número estético: medido sobre el checkout real,
              // todo su layout gira sobre un breakpoint en 768px. Por debajo
              // colapsa a una columna, recorta el banner (lo estira a ancho
              // completo con alto fijo sobre un original 2:1) y el resumen de
              // orden queda flotando sobre el formulario. Por encima pasa a dos
              // columnas: banner entero y resumen como columna lateral. 880 deja
              // margen sobre el umbral sin que la columna de tickets quede
              // angosta.
              width: "min(100%, 880px)",
              height: "100%",
              maxHeight: "1040px",
              background: "#E6EEF2",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.6)",
            }}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra propia: el checkout embebido no trae header, así que el
                control de cierre lo pone el organizador (nosotros) */}
            <div
              className="flex items-center justify-between shrink-0"
              style={{
                background: "#171616",
                // Barra angosta a propósito: cada píxel de cromo propio se le
                // resta al iframe, y el alto disponible es justamente lo que
                // determina cuánto tapa el resumen fijo del checkout de Hallos.
                padding: "8px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-neue-machina), sans-serif",
                  fontWeight: 900,
                  fontSize: "12px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#ABF760",
                }}
              >
                {t.title}
              </span>
              <div className="flex items-center" style={{ gap: "12px" }}>
                {/* Escape hatch: si Hallos pasa su CSP `frame-ancestors` de
                    report-only a enforced, el iframe queda en blanco y este
                    link es la única salida del usuario. Vive en la barra (y no
                    en una franja al pie) para no gastar alto útil del iframe. */}
                <a
                  href={HALLOS_CHECKOUT_STANDALONE}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t.fallback}
                  className="transition-opacity duration-200 hover:opacity-70"
                  style={{
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 300,
                    fontSize: "11px",
                    color: "#A5A8B1",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.fallbackShort}
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t.close}
                  className="flex items-center justify-center rounded-full transition-opacity duration-200 hover:opacity-70"
                  style={{
                    width: "26px",
                    height: "26px",
                    background: "rgba(230,238,242,0.1)",
                    color: "#E6EEF2",
                    fontSize: "16px",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* iframe: se monta solo con el modal abierto (no carga Hallos en
                cada visita a la landing) */}
            <iframe
              src={HALLOS_CHECKOUT_URL}
              title={t.title}
              className="flex-1 w-full"
              // `minHeight: 0` es necesario: sin eso el flex item toma como
              // mínimo el alto del contenido del iframe y desborda el modal en
              // vez de scrollear adentro (Safari sobre todo).
              style={{ border: "none", background: "#E6EEF2", minHeight: 0 }}
              allow="payment; clipboard-write"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
