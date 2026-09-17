"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, useReducedMotion } from "framer-motion";
import { useLangStore } from "@/lib/store/lang";
import QubitFace from "./QubitFace";
import QubitText from "./QubitText";

/** Margen del lanzador contra el borde inferior, y aire contra lo que no debe tapar. */
const LAUNCHER_BOTTOM = 24;
const STOP_GAP = 16;

/**
 * Alto del carril por donde flota el lanzador: de la cabeza de la página hasta
 * `STOP_GAP` arriba del marcador `data-qubit-stop` que pone el footer.
 *
 * Acá **no** se posiciona nada. El lanzador es `position: sticky` dentro de un
 * carril de este alto, así que la frenada la hace el navegador: flota pegado al
 * borde inferior y, cuando el carril se termina, se queda ahí y sigue con la
 * página. Este hook solo mide el carril, al montar y al cambiar de tamaño.
 *
 * Los dos intentos anteriores movían el botón desde JavaScript —uno con
 * `scroll` + rAF, otro con un `IntersectionObserver`— y los dos rebotaban: el
 * callback llega uno o varios cuadros después del scroll (el observer, sobre
 * todo, se entrega tarde justo cuando se scrollea rápido), así que en esos
 * cuadros el botón se pintaba en su lugar viejo. Se veía tocar el piso y
 * saltar. Nada atado al scroll por JS puede evitarlo; `sticky` sí, porque lo
 * resuelve el compositor antes de pintar.
 */
function useCarrilHeight() {
  const [alto, setAlto] = useState<number | null>(null);

  useEffect(() => {
    const medir = () => {
      // Puede haber más de un marcador (desktop y mobile son bloques
      // distintos): vale el visible, que es el que tiene altura.
      const marker = [...document.querySelectorAll<HTMLElement>("[data-qubit-stop]")].find(
        (el) => el.getBoundingClientRect().height > 0,
      );
      if (!marker) return setAlto(null);
      setAlto(marker.getBoundingClientRect().top + window.scrollY - STOP_GAP);
    };

    medir();
    window.addEventListener("resize", medir);
    // La página cambia de alto sola (el footer, el copy en otro idioma, las
    // imágenes que entran): sin esto el carril se queda con la medida vieja.
    const ro = new ResizeObserver(medir);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("resize", medir);
      ro.disconnect();
    };
  }, []);

  return alto;
}

const T = {
  es: {
    title: "Qubit",
    subtitle: "Tu asistente personal",
    placeholder: "Escribí tu pregunta...",
    send: "Enviar",
    // Presentación textual de la organización (feedback 03/09). Qubit se
    // presenta SIEMPRE al abrir el chat: no es un placeholder gris, es el
    // primer mensaje del asistente, para que no se lea como un bot genérico.
    greeting:
      "¡Hola! Soy Qubit, el asistente personal al cuadrado de LABITCONF 2026. ¿En qué puedo ayudarte?",
    hint: "Preguntame sobre tickets, agenda, el venue o los programas de LABITCONF.",
    cta: "Chateá",
    open: "Chateá con Qubit",
  },
  en: {
    title: "Qubit",
    subtitle: "Your personal assistant",
    placeholder: "Type your question...",
    send: "Send",
    greeting:
      "Hi! I'm Qubit, LABITCONF 2026's personal assistant squared. How can I help you?",
    hint: "Ask me about tickets, agenda, the venue or LABITCONF's programs.",
    cta: "Chat",
    open: "Chat with Qubit",
  },
} as const;

// Nombre del evento que abre el chat desde afuera del componente.
export const QUBIT_OPEN_EVENT = "qubit:open";

export function openQubitChat() {
  window.dispatchEvent(new Event(QUBIT_OPEN_EVENT));
}

export default function QaChatWidget() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/qa-chat" }),
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const carril = useCarrilHeight();
  // El portal necesita el DOM: en el server no hay nada donde montarlo.
  // `useSyncExternalStore` da false en el server y true en el cliente sin
  // pasar por un efecto, que es lo que evita el render en cascada.
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Qubit es una capa transversal (mapa web fase 2): cualquier parte del sitio puede
  // abrir el chat sin que haya que levantar este estado a la página. El evento
  // `bi:open` lo dispara hoy la burbuja "No sé por dónde empezar" de la home.
  useEffect(() => {
    function openFromOutside() {
      setOpen(true);
    }
    window.addEventListener(QUBIT_OPEN_EVENT, openFromOutside);
    return () => window.removeEventListener(QUBIT_OPEN_EVENT, openFromOutside);
  }, []);

  const isStreaming = status === "streaming" || status === "submitted";

  // Llama la atención solo hasta el primer contacto: si la persona ya escribió,
  // el halo y el vaivén pasan de invitación a molestia.
  const attract = !open && messages.length === 0 && !reduced;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage({ text: input });
    setInput("");
  }

  if (!montado) return null;

  /* Carril + caja sticky.

     El carril va por portal al <body> a propósito: el <main> de las páginas
     tiene `overflow-hidden`, y un `sticky` adentro de un ancestro con overflow
     se pega a esa caja —que no scrollea— en vez de al viewport, o sea que no
     se pega a nada.

     El carril arranca en la cabeza de la página y termina arriba de las redes.
     La caja sticky es su último hijo (`justify-end`), así que su lugar natural
     es el final del carril: `sticky bottom` la mantiene flotando sobre el
     viewport durante todo el scroll y la suelta justo cuando el carril se
     termina. El panel abierto va adentro de la misma caja, arriba del botón,
     para que lo acompañe sin tener que posicionarlo por separado. */
  return createPortal(
    <div
      className="absolute left-0 flex w-full flex-col justify-end pointer-events-none"
      style={{
        top: 0,
        // Sin marcador (una página sin footer) el carril llega hasta el fondo
        // y el lanzador flota hasta el final, que es el comportamiento viejo.
        height: carril === null ? "100%" : `${carril}px`,
        zIndex: 6,
      }}
    >
      <div
        className="sticky flex flex-col items-end gap-3 pr-6 pointer-events-none"
        style={{ bottom: `${LAUNCHER_BOTTOM}px` }}
      >
      {open && (
        <div
          className="flex flex-col overflow-hidden rounded-2xl pointer-events-auto"
          style={{
            width: "min(90vw, 360px)",
            height: "min(70vh, 480px)",
            background: "#151512",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
          >
            <span className="flex items-center gap-2.5">
              <span
                className="flex items-center justify-center rounded-full"
                style={{ width: 30, height: 30, background: "#ABF760", flexShrink: 0 }}
              >
                <QubitFace size={22} state={isStreaming ? "thinking" : "idle"} />
              </span>
              <span className="flex flex-col">
                <span
                  style={{
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 900,
                    fontSize: "13px",
                    color: "#ABF760",
                    textTransform: "uppercase",
                    lineHeight: 1.1,
                  }}
                >
                  {t.title}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 300,
                    fontSize: "10px",
                    color: "#6b6e73",
                    lineHeight: 1.2,
                  }}
                >
                  {t.subtitle}
                </span>
              </span>
            </span>
            <button
              onClick={() => setOpen(false)}
              className="hover:opacity-70 transition-opacity"
              style={{ color: "#A5A8B1", fontSize: "18px", lineHeight: 1 }}
              aria-label="close"
            >
              ×
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {messages.length === 0 && (
              <>
                <div
                  className="rounded-xl px-3 py-2"
                  style={{
                    alignSelf: "flex-start",
                    maxWidth: "85%",
                    background: "rgba(255,255,255,0.06)",
                    color: "#E5E5E0",
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 300,
                    fontSize: "13px",
                  }}
                >
                  {t.greeting}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 300,
                    fontSize: "12px",
                    color: "#6b6e73",
                  }}
                >
                  {t.hint}
                </p>
              </>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className="rounded-xl px-3 py-2"
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: m.role === "user" ? "#ABF760" : "rgba(255,255,255,0.06)",
                  color: m.role === "user" ? "#171616" : "#E5E5E0",
                  fontFamily: "var(--font-neue-machina), sans-serif",
                  fontWeight: 300,
                  fontSize: "13px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.parts.map((p, i) =>
                  p.type === "text" ? (
                    m.role === "user" ? (
                      <span key={i}>{p.text}</span>
                    ) : (
                      // Lo que escribe el modelo viene con markdown; el de la
                      // persona se muestra literal, tal cual lo tipeó.
                      <QubitText key={i} text={p.text} />
                    )
                  ) : null
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              disabled={isStreaming}
              className="flex-1 bg-transparent outline-none"
              style={{
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 300,
                fontSize: "13px",
                color: "#E5E5E0",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                padding: "8px 10px",
              }}
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="rounded-lg px-3 py-2 disabled:opacity-40 hover:opacity-90 transition-opacity"
              style={{
                background: "#ABF760",
                color: "#171616",
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 900,
                fontSize: "11px",
              }}
            >
              {t.send}
            </button>
          </form>
        </div>
      )}

      {/* Botón de acceso.

          Qubit es un personaje, así que el botón es su cara y nada más: un
          círculo, sin la palabra adentro. El "CHATEÁ" que pidió la
          organización (feedback 03/09) va AFUERA del círculo, a la izquierda,
          dibujado como globo de conversación con la cola apuntando a la cara —
          así se lee como algo que Qubit dice, no como la etiqueta de un botón.
          Con el panel abierto el globo desaparece: el título del panel ya lo
          repite. */}
      <div className="flex items-center pointer-events-auto">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5"
          aria-label={t.open}
          aria-expanded={open}
        >
          {!open && (
            <motion.span
              className="relative"
              style={{
                background: "#E6EEF2",
                color: "#171616",
                borderRadius: "16px",
                padding: "9px 14px",
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 900,
                fontSize: "12px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
              initial={reduced ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {t.cta}
              {/* Cola del globo: un cuadrado girado 45° del mismo color,
                  medio metido debajo del cuerpo para que no se vea la unión. */}
              <span
                aria-hidden
                className="absolute"
                style={{
                  right: "-3px",
                  top: "50%",
                  width: "10px",
                  height: "10px",
                  background: "#E6EEF2",
                  transform: "translateY(-50%) rotate(45deg)",
                  borderRadius: "2px",
                }}
              />
            </motion.span>
          )}

          <motion.span
            className="relative flex items-center justify-center rounded-full"
            style={{ width: "60px", height: "60px", background: "#ABF760" }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            // El movimiento vive mientras nadie le habló todavía: una vez que
            // la persona escribe, Qubit deja de pedir atención. Se mueve solo
            // la cara, no el globo: si oscilara todo, el texto se marea.
            animate={attract ? { rotate: [0, -7, 6, -3, 0] } : { rotate: 0 }}
            transition={{ duration: 0.9, repeat: attract ? Infinity : 0, repeatDelay: 5.5, ease: "easeInOut" }}
          >
            {attract && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{ border: "2px solid #ABF760" }}
                animate={{ scale: [1, 1.5], opacity: [0.55, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <QubitFace size={40} state={isStreaming ? "thinking" : "idle"} />
          </motion.span>
        </button>
      </div>
      </div>
    </div>,
    document.body,
  );
}
