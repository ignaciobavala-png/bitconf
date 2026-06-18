"use client";

import { useState, KeyboardEvent } from "react";
import WatermarkLayer from "@/components/WatermarkLayer";

type SubmitState = "idle" | "loading" | "success" | "error" | "ratelimit";

export default function Page() {
  const [input, setInput] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || submitState === "loading") return;

    setSubmitState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/reasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, website: "" }),
      });

      if (res.status === 429) {
        setSubmitState("ratelimit");
        setErrorMsg("Demasiados envíos. Esperá unos minutos.");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitState("error");
        setErrorMsg(data.error ?? "Error al enviar. Intentá de nuevo.");
        return;
      }

      setInput("");
      setSubmitState("success");
      setTimeout(() => setSubmitState("idle"), 3000);
    } catch {
      setSubmitState("error");
      setErrorMsg("Error de conexión. Intentá de nuevo.");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  const statusColor: Record<SubmitState, string> = {
    idle: "#4A6E2D",
    loading: "#A5A8B1",
    success: "#9ACE6A",
    error: "#E3551C",
    ratelimit: "#E3551C",
  };

  const statusMsg: Record<SubmitState, string> = {
    idle: "Enter o presioná HODL →",
    loading: "Enviando...",
    success: "¡Tu razón fue recibida! Aparecerá pronto.",
    error: errorMsg || "Error al enviar.",
    ratelimit: errorMsg,
  };

  return (
    <main
      className="relative h-full overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: "#0D0D0B",
        boxShadow: "inset 0 0 0 2px #4B78D3, inset 0 0 60px rgba(75,120,211,0.12)",
      }}
    >
      {/* Watermark con Realtime — no recibe userPhrases del padre */}
      <WatermarkLayer />

      {/* Contenido central */}
      <div className="relative z-10 flex flex-col items-center gap-6 pointer-events-none select-none w-full px-4">

        {/* Fila 1 */}
        <div className="flex items-baseline gap-3 flex-wrap justify-center">
          <span style={{
            fontFamily: "var(--font-barlow), sans-serif",
            fontWeight: 800,
            color: "#FCFCFC",
            fontSize: "clamp(10px, 1.2vw, 16px)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            Costa Salguero – BSAS
          </span>
          <span style={{
            fontFamily: "var(--font-barlow), sans-serif",
            fontWeight: 900,
            color: "#E3551C",
            fontSize: "clamp(28px, 3.5vw, 52px)",
            lineHeight: 1,
            textTransform: "uppercase",
          }}>
            HODL
          </span>
          <span style={{
            fontFamily: "var(--font-barlow), sans-serif",
            fontWeight: 900,
            color: "#9ACE6A",
            fontSize: "clamp(13px, 1.4vw, 20px)",
            textTransform: "uppercase",
          }}>
            ¿POR QUÉ HODLEÁS?
          </span>
        </div>

        {/* Logo principal */}
        <div className="flex items-baseline gap-4 flex-wrap justify-center">
          <span style={{
            fontFamily: "var(--font-barlow), sans-serif",
            fontWeight: 900,
            color: "#E3551C",
            fontSize: "clamp(36px, 5vw, 72px)",
            lineHeight: 1,
            textTransform: "uppercase",
          }}>
            HODL
          </span>
          <span style={{
            fontFamily: "var(--font-barlow), sans-serif",
            fontWeight: 900,
            color: "#FCFCFC",
            fontSize: "clamp(48px, 9vw, 130px)",
            lineHeight: 0.92,
            textTransform: "uppercase",
          }}>
            LABITCONF
            <sup style={{ fontSize: "35%", verticalAlign: "super", lineHeight: 0 }}>26</sup>
          </span>
          <span style={{
            fontFamily: "var(--font-barlow), sans-serif",
            fontWeight: 900,
            color: "#E3551C",
            fontSize: "clamp(36px, 5vw, 72px)",
            lineHeight: 1,
            textTransform: "uppercase",
          }}>
            HODL
          </span>
        </div>

        {/* Fila 3 */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span style={{
            fontFamily: "var(--font-barlow), sans-serif",
            fontWeight: 900,
            color: "#9ACE6A",
            fontSize: "clamp(13px, 1.4vw, 20px)",
            textTransform: "uppercase",
          }}>
            ¿POR QUÉ HODLEÁS?
          </span>
          <span style={{
            fontFamily: "var(--font-barlow), sans-serif",
            fontWeight: 900,
            color: "#E3551C",
            fontSize: "clamp(28px, 3.5vw, 52px)",
            lineHeight: 1,
            textTransform: "uppercase",
          }}>
            HODL
          </span>
          <div style={{
            border: "2px solid #9ACE6A",
            borderRadius: "9999px",
            padding: "4px 20px",
            boxShadow: "0 0 12px rgba(154,206,106,0.25)",
          }}>
            <span style={{
              fontFamily: "var(--font-barlow), sans-serif",
              fontWeight: 900,
              color: "#9ACE6A",
              fontSize: "clamp(13px, 1.4vw, 20px)",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}>
              → OCT | 30 – 31
            </span>
          </div>
        </div>

        {/* Input central */}
        <div
          className="pointer-events-auto flex flex-col items-center gap-3 mt-2"
          style={{ width: "100%", maxWidth: "600px" }}
        >
          <label style={{
            fontFamily: "var(--font-barlow), sans-serif",
            fontWeight: 900,
            color: "#9ACE6A",
            fontSize: "clamp(16px, 1.8vw, 24px)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}>
            ¿POR QUÉ HODLEÁS?
          </label>

          <div
            className="flex items-center w-full"
            style={{
              border: `2px solid ${submitState === "success" ? "#9ACE6A" : submitState === "error" || submitState === "ratelimit" ? "#E3551C" : "#9ACE6A"}`,
              borderRadius: "9999px",
              padding: "12px 28px",
              boxShadow: "0 0 20px rgba(154,206,106,0.2)",
              gap: "8px",
              transition: "border-color 0.3s",
            }}
          >
            {/* Honeypot oculto — los bots lo completan, los humanos no */}
            <input type="text" name="website" style={{ display: "none" }} tabIndex={-1} readOnly />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={60}
              placeholder="escribí tu razón..."
              disabled={submitState === "loading"}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#FCFCFC",
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: "clamp(13px, 1.2vw, 16px)",
                flex: 1,
                minWidth: 0,
                opacity: submitState === "loading" ? 0.5 : 1,
              }}
            />
            <span style={{
              color: "#9ACE6A",
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: "clamp(13px, 1.2vw, 16px)",
              whiteSpace: "nowrap",
            }}>
              _//
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitState === "loading"}
              style={{
                background: submitState === "success" ? "#9ACE6A" : "#9ACE6A",
                border: "none",
                borderRadius: "9999px",
                color: "#0D0D0B",
                fontFamily: "var(--font-barlow), sans-serif",
                fontWeight: 900,
                fontSize: "clamp(11px, 1vw, 14px)",
                textTransform: "uppercase",
                padding: "6px 18px",
                cursor: submitState === "loading" ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                letterSpacing: "0.05em",
                opacity: submitState === "loading" ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {submitState === "loading" ? "..." : submitState === "success" ? "✓" : "HODL →"}
            </button>
          </div>

          <p style={{
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontSize: "11px",
            color: statusColor[submitState],
            letterSpacing: "0.05em",
            transition: "color 0.3s",
          }}>
            {statusMsg[submitState]}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <span style={{
          fontFamily: "var(--font-ibm-plex-mono), monospace",
          fontSize: "11px",
          color: "#A5A8B1",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}>
          LABITCONF.COM
        </span>
      </div>
    </main>
  );
}
