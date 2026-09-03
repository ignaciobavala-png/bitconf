"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, useReducedMotion } from "framer-motion";
import { useLangStore } from "@/lib/store/lang";
import QubitFace from "./QubitFace";
import QubitText from "./QubitText";

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

  return (
    <>
      {open && (
        <div
          className="fixed flex flex-col overflow-hidden rounded-2xl"
          style={{
            zIndex: 6,
            bottom: "96px",
            right: "20px",
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

      {/* Botón de acceso. Lleva la palabra "CHATEÁ" a la vista (pedido de la
          organización, feedback 03/09): con la cara sola no se leía como un
          chat. Cuando el panel está abierto se contrae al círculo — el label
          ahí ya no informa nada y el título del panel lo repite. */}
      <div className="fixed flex items-center gap-3" style={{ zIndex: 6, bottom: "24px", right: "24px" }}>
        <motion.button
          onClick={() => setOpen((o) => !o)}
          className="relative flex items-center justify-center gap-2.5 rounded-full"
          style={{
            height: "60px",
            paddingLeft: "10px",
            paddingRight: open ? "10px" : "20px",
            background: "#ABF760",
          }}
          aria-label={t.open}
          aria-expanded={open}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          // El movimiento vive mientras nadie le habló todavía: una vez que la
          // persona escribe, el botón deja de pedir atención.
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
          {!open && (
            <span
              style={{
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 900,
                fontSize: "12px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#171616",
                whiteSpace: "nowrap",
              }}
            >
              {t.cta}
            </span>
          )}
        </motion.button>
      </div>
    </>
  );
}
