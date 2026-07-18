"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useLangStore } from "@/lib/store/lang";

const T = {
  es: {
    title: "Preguntas frecuentes",
    placeholder: "Escribí tu pregunta...",
    send: "Enviar",
    empty: "Preguntame sobre tickets, agenda, el venue o los programas de LABITCONF.",
  },
  en: {
    title: "Frequently asked questions",
    placeholder: "Type your question...",
    send: "Send",
    empty: "Ask me about tickets, agenda, the venue or LABITCONF's programs.",
  },
} as const;

export default function QaChatWidget() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/qa-chat" }),
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const isStreaming = status === "streaming" || status === "submitted";

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
            <span
              style={{
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 900,
                fontSize: "13px",
                color: "#ABF760",
                textTransform: "uppercase",
              }}
            >
              {t.title}
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
              <p
                style={{
                  fontFamily: "var(--font-neue-machina), sans-serif",
                  fontWeight: 300,
                  fontSize: "13px",
                  color: "#6b6e73",
                }}
              >
                {t.empty}
              </p>
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
                {m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
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

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-105"
        style={{
          zIndex: 6,
          bottom: "28px",
          right: "28px",
          width: "56px",
          height: "56px",
          background: "#ABF760",
          color: "#171616",
          fontFamily: "var(--font-neue-machina), sans-serif",
          fontWeight: 900,
          fontSize: "12px",
        }}
        aria-label="Q&A"
      >
        Q&A
      </button>
    </>
  );
}
