"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import Image from "next/image";
import WatermarkLayer from "@/components/WatermarkLayer";

type SubmitState = "idle" | "loading" | "success" | "error" | "ratelimit";

export default function Page() {
  const [input, setInput] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const FULL = "tipealo acá";
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setPlaceholder(FULL.slice(0, i));
        if (i >= FULL.length) clearInterval(interval);
      }, 90);
      return () => clearInterval(interval);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

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
      : "#FCFCFC";

  return (
    <main
      className="relative h-full overflow-hidden"
      style={{ background: "#0D0D0B" }}
    >
      {/* Capa 1: Globo terráqueo — solo la parte superior (glow) visible en el footer */}
      {/* El contenedor se fuerza a ser siempre más ancho que alto para que objectFit:cover
          escale por ancho en cualquier dispositivo, mostrando solo el horizonte del planeta */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none overflow-hidden"
        style={{ zIndex: 0, height: "58vh", width: "max(100vw, calc(58vh * 3))" }}
      >
        <Image
          src="/assets/diseños/Fondo.png"
          alt=""
          fill
          priority
          loading="eager"
          style={{
            objectFit: "cover",
            objectPosition: "top center",
            opacity: 0.5,
          }}
        />
      </div>

      {/* Capa 2: Watermark con frases en Realtime */}
      <WatermarkLayer />

      {/* Vignette central: tapa las frases detrás del HODL */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: isMobile
            ? "radial-gradient(ellipse 88% 34% at 50% 45%, rgba(13,13,11,0.92) 0%, rgba(13,13,11,0.6) 45%, transparent 72%)"
            : "radial-gradient(ellipse 48% 40% at 50% 48%, rgba(13,13,11,0.92) 0%, rgba(13,13,11,0.6) 45%, transparent 72%)",
        }}
      />

      {/* Capa 3: HODL hero image — el asset ya incluye el branding LABITCONF */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ zIndex: 2, paddingBottom: "14vh" }}
      >
        <Image
          src="/assets/diseños/HODL (4).png"
          alt="HODL"
          width={1600}
          height={800}
          priority
          className="w-[90vw] sm:w-4/5 md:w-3/5"
          style={{
            objectFit: "contain",
            maxHeight: "55vh",
          }}
        />
      </div>

      {/* Capa 4: degradé negro inferior */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          zIndex: 3,
          height: "35%",
          background: "linear-gradient(to top, rgba(13,13,11,0.92) 0%, rgba(13,13,11,0.5) 50%, transparent 100%)",
        }}
      />

      {/* Capa 5: UI overlay + footer — bloque único anclado al bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none flex flex-col"
        style={{ zIndex: 4 }}
      >
        {/* Form — centrado en mobile, esquina izquierda en desktop */}
        <div className="flex justify-center md:justify-start px-6">
          <div
            className="flex flex-col items-center md:items-start gap-3 pointer-events-auto w-full"
            style={{ maxWidth: "420px" }}
          >
            <label
              style={{
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 900,
                color: "#9ACE6A",
                fontSize: "clamp(13px, 1.3vw, 18px)",
                letterSpacing: "0.06em",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              Y VOS… ¿POR QUÉ HODLEÁS?
            </label>

            <div
              className="flex items-center w-full"
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "9999px",
                padding: "9px 20px",
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
                placeholder={placeholder}
                disabled={submitState === "loading"}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#FCFCFC",
                  fontFamily: "var(--font-neue-machina), sans-serif",
                  fontWeight: 300,
                  fontSize: "clamp(12px, 1.0vw, 14px)",
                  flex: 1,
                  minWidth: 0,
                  opacity: submitState === "loading" ? 0.5 : 1,
                }}
              />
              <span
                style={{
                  color: "#9ACE6A",
                  fontFamily: "var(--font-neue-machina), sans-serif",
                  fontSize: "clamp(12px, 1.0vw, 14px)",
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
                  fontFamily: "var(--font-neue-machina), sans-serif",
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
                fontFamily: "var(--font-neue-machina), sans-serif",
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

        {/* Footer — siempre debajo del form, nunca superpuesto */}
        <div className="flex justify-center py-3 px-4">
          <span
            style={{
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontSize: "10px",
              color: "#A5A8B1",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            Conferencia Latinoamericana de Bitcoin y Blockchain
          </span>
        </div>
      </div>
    </main>
  );
}
