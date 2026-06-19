"use client";

import { useState, KeyboardEvent } from "react";
import Image from "next/image";
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

  const borderColor =
    submitState === "error" || submitState === "ratelimit"
      ? "#E3551C"
      : "#9ACE6A";

  return (
    <main
      className="relative h-full overflow-hidden"
      style={{ background: "#0D0D0B" }}
    >
      {/* Capa 1: Globo terráqueo — solo la parte superior (glow) visible en el footer */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none select-none overflow-hidden"
        style={{ zIndex: 0, height: "58vh" }}
      >
        <Image
          src="/assets/diseños/Fondo.png"
          alt=""
          fill
          style={{
            objectFit: "cover",
            objectPosition: "top center",
            opacity: 0.5,
          }}
        />
      </div>

      {/* Capa 2: Watermark con frases en Realtime */}
      <WatermarkLayer />

      {/* Capa 3: HODL hero image — el asset ya incluye el branding LABITCONF */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ zIndex: 2 }}
      >
        <Image
          src="/assets/diseños/HODL (4).png"
          alt="HODL"
          width={1600}
          height={800}
          priority
          className="w-3/5"
          style={{
            objectFit: "contain",
            maxHeight: "55vh",
          }}
        />
      </div>

      {/* Capa 4: UI overlay */}
      <div
        className="absolute inset-0 flex flex-col"
        style={{ zIndex: 3 }}
      >
        {/* Spacer — el HODL ocupa el centro */}
        <div className="flex-1" />

        {/* Form — bottom centrado */}
        <div
          className="flex flex-col items-center gap-3 px-4 pb-10 pointer-events-auto"
        >
          <label
            style={{
              fontFamily: "var(--font-barlow), sans-serif",
              fontWeight: 900,
              color: "#9ACE6A",
              fontSize: "clamp(15px, 1.6vw, 22px)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            ¿POR QUÉ HODLEÁS?
          </label>

          <div
            className="flex items-center w-full"
            style={{
              maxWidth: "580px",
              border: `2px solid ${borderColor}`,
              borderRadius: "9999px",
              padding: "11px 24px",
              boxShadow: `0 0 20px rgba(154,206,106,0.18)`,
              gap: "8px",
              transition: "border-color 0.3s",
            }}
          >
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              style={{ display: "none" }}
              tabIndex={-1}
              readOnly
            />

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
            <span
              style={{
                color: "#9ACE6A",
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: "clamp(13px, 1.2vw, 16px)",
                whiteSpace: "nowrap",
              }}
            >
              _//
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitState === "loading"}
              style={{
                background: "#9ACE6A",
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
              {submitState === "loading"
                ? "..."
                : submitState === "success"
                ? "✓"
                : "HODL →"}
            </button>
          </div>

          <p
            style={{
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: "11px",
              color: statusColor[submitState],
              letterSpacing: "0.05em",
              transition: "color 0.3s",
            }}
          >
            {statusMsg[submitState]}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
        style={{ zIndex: 4 }}
      >
        <span
          style={{
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontSize: "10px",
            color: "#A5A8B1",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          LABITCONF.COM
        </span>
      </div>
    </main>
  );
}
