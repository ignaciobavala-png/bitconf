"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import Image from "next/image";
import WatermarkLayer from "@/components/WatermarkLayer";
import LangToggle from "@/components/LangToggle";
import type { Lang } from "@/lib/store/lang";

type SubmitState = "idle" | "loading" | "success" | "error" | "ratelimit";

const SPONSOR_EMAIL = "sponsors@labitconf.com";

// Para re-activar los botones CTA: cambiar a `true`
// Speaker URL: https://app-labitconf.github.io/LABITCONF-speakers/form/
// Sponsor: copia SPONSOR_EMAIL al portapapeles
const LINKS_ENABLED = true;

const T = {
  es: {
    label: "Y VOS… ¿POR QUÉ HODLEÁS?",
    placeholder: "tipealo acá",
    idle: "Enter o presioná HODL →",
    loading: "Enviando...",
    success: "¡Tu razón fue recibida! Aparecerá pronto.",
    ratelimit: "Demasiados envíos. Esperá unos minutos.",
    error: "Error al enviar. Intentá de nuevo.",
    connError: "Error de conexión. Intentá de nuevo.",
    speakerPre: "Postulate como ",
    sponsorBase: "Sé Sponsor",
    sponsorSuffix: " de LABITCONF 2026",
    sponsorCopied: "¡Copiado!",
    footer: "Latin American Bitcoin & Blockchain Conference",
  },
  en: {
    label: "AND YOU… WHY DO YOU HODL?",
    placeholder: "type it here",
    idle: "Press Enter or HODL →",
    loading: "Sending...",
    success: "Your reason was received! It'll appear soon.",
    ratelimit: "Too many submissions. Wait a few minutes.",
    error: "Error sending. Try again.",
    connError: "Connection error. Try again.",
    speakerPre: "Apply as ",
    sponsorBase: "Be a Sponsor",
    sponsorSuffix: " of LABITCONF 2026",
    sponsorCopied: "Copied!",
    footer: "Latin American Bitcoin & Blockchain Conference",
  },
} as const;

const pillStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  fontSize: "clamp(10px, 0.8vw, 12px)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  textDecoration: "none",
  padding: "8px 17px",
  whiteSpace: "nowrap",
  background: "rgba(13,13,11,0.72)",
  backdropFilter: "blur(6px)",
};

// CTAs de Speaker/Sponsor: mismo pill, 25% más grande
const pillStyleLarge: React.CSSProperties = {
  ...pillStyle,
  fontSize: "clamp(12.5px, 1vw, 15px)",
  padding: "10px 21px",
};

interface HodlReasonsSectionProps {
  /** Muestra el toggle ES/EN. Desactivar en contextos sin i18n (ej. footer embebido). */
  showLangToggle?: boolean;
  id?: string;
  /**
   * "full" = pre-landing completa (globo, HODL hero, CTAs, footer de texto).
   * "compact" = solo la cápsula de input con las frases pasando por detrás
   * (usado como footer embebido de la landing).
   */
  variant?: "full" | "compact";
  /**
   * Alineación vertical del form en variant="compact". "top" deja lugar
   * debajo para contenido extra (ej. logo/rrss del footer embebido).
   */
  compactAlign?: "center" | "top";
  /** Idioma controlado por el padre (ej. store global de /home). Si no se pasa, usa estado local. */
  lang?: Lang;
  onToggleLang?: () => void;
}

export default function HodlReasonsSection({
  showLangToggle = true,
  id,
  variant = "full",
  compactAlign = "center",
  lang: langProp,
  onToggleLang,
}: HodlReasonsSectionProps) {
  const [localLang, setLocalLang] = useState<Lang>("es");
  const lang = langProp ?? localLang;
  const toggleLang = onToggleLang ?? (() => setLocalLang((l) => (l === "es" ? "en" : "es")));
  const [input, setInput] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [sponsorState, setSponsorState] = useState<"idle" | "copied" | "show">("idle");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const FULL = T[lang].placeholder;
    setPlaceholder("");
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setPlaceholder(FULL.slice(0, i));
        if (i >= FULL.length) clearInterval(interval);
      }, 90);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, [lang]);

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
        setErrorMsg(T[lang].ratelimit);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitState("error");
        setErrorMsg(data.error ?? T[lang].error);
        return;
      }

      setInput("");
      setSubmitState("success");
      setTimeout(() => setSubmitState("idle"), 3000);
    } catch {
      setSubmitState("error");
      setErrorMsg(T[lang].connError);
    }
  };

  const handleSponsorClick = async () => {
    try {
      await navigator.clipboard.writeText(SPONSOR_EMAIL);
      setSponsorState("copied");
      setTimeout(() => setSponsorState("idle"), 2500);
    } catch {
      setSponsorState("show");
      setTimeout(() => setSponsorState("idle"), 3000);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  const statusColor: Record<SubmitState, string> = {
    idle: "#4A6E2D",
    loading: "#A5A8B1",
    success: "#ABF760",
    error: "#E3551C",
    ratelimit: "#E3551C",
  };

  const statusMsg: Record<SubmitState, string> = {
    idle: T[lang].idle,
    loading: T[lang].loading,
    success: T[lang].success,
    error: errorMsg || T[lang].error,
    ratelimit: errorMsg || T[lang].ratelimit,
  };

  const borderColor =
    submitState === "error" || submitState === "ratelimit"
      ? "#E3551C"
      : "#E6EEF2";

  return (
    <div
      id={id}
      className="relative w-full h-full overflow-hidden"
      style={{ background: "#171616" }}
    >
      {/* Capa 1: Globo terráqueo */}
      {variant === "full" && (
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
      )}

      {/* Toggle idioma — top-left */}
      {showLangToggle && (
        <div className="absolute top-0 left-0 p-6" style={{ zIndex: 5 }}>
          <LangToggle lang={lang} onToggle={toggleLang} />
        </div>
      )}

      {/* Capa 2: Watermark con frases en Realtime */}
      <WatermarkLayer />

      {/* Vignette central: tapa las frases detrás del HODL (o del form, en compact) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            variant === "compact"
              ? "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(13,13,11,0.85) 0%, rgba(13,13,11,0.55) 45%, transparent 75%)"
              : isMobile
              ? "radial-gradient(ellipse 88% 26% at 50% 35%, rgba(13,13,11,0.92) 0%, rgba(13,13,11,0.6) 45%, transparent 72%)"
              : "radial-gradient(ellipse 36% 28% at 50% 33%, rgba(13,13,11,0.92) 0%, rgba(13,13,11,0.6) 45%, transparent 72%)",
        }}
      />

      {variant === "full" && (
        <>
          {/* Capa 3: HODL hero image — tamaño original, anclado arriba (badge OCT 30-31 incluido en el asset) */}
          <div
            className="absolute left-0 right-0 flex justify-center pointer-events-none select-none"
            style={{ zIndex: 2, top: isMobile ? "27vh" : "18vh" }}
          >
            <Image
              src="/assets/diseños/HODL (11).png"
              alt="HODL"
              width={1416}
              height={576}
              priority
              className="w-[90vw] sm:w-[60vw] md:w-[40vw]"
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
        </>
      )}

      {/* Capa 5: UI overlay — form centrado (bottom en "full", medio de pantalla en "compact") */}
      <div
        className={
          variant === "compact"
            ? `absolute inset-0 pointer-events-none flex flex-col items-center ${
                compactAlign === "top" ? "justify-start pt-28 sm:pt-32" : "justify-center"
              }`
            : "absolute bottom-0 left-0 right-0 pointer-events-none flex flex-col"
        }
        style={{ zIndex: 4 }}
      >
        {/* Form — centrado */}
        <div className="flex justify-center px-6">
          <div
            className="flex flex-col items-center gap-3 pointer-events-auto w-full"
            style={{ maxWidth: "420px" }}
          >
            <label
              style={{
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 900,
                color: "#ABF760",
                fontSize: "clamp(13px, 1.3vw, 18px)",
                letterSpacing: "0.06em",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {T[lang].label}
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
                background: "rgba(13,13,11,0.72)",
                backdropFilter: "blur(6px)",
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
                  color: "#E6EEF2",
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
                  color: "#ABF760",
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
                  background: "#ABF760",
                  border: "none",
                  borderRadius: "9999px",
                  color: "#171616",
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

        {variant === "full" && (
          <>
            {/* CTAs: Speaker y Sponsor — fila centrada entre el form y el footer */}
            <div className="flex justify-center flex-wrap gap-2 sm:gap-4 px-6 pt-2 pointer-events-auto">
              <a
                href={LINKS_ENABLED ? "https://app-labitconf.github.io/LABITCONF-speakers/form/" : undefined}
                target={LINKS_ENABLED ? "_blank" : undefined}
                rel={LINKS_ENABLED ? "noopener noreferrer" : undefined}
                className="flex items-center border-2 rounded-full transition-colors duration-200 border-[#4A6E2D] text-[#A5A8B1] hover:border-[#ABF760] hover:text-[#ABF760]"
                style={pillStyleLarge}
              >
                <span className="hidden sm:inline">{T[lang].speakerPre}</span>&nbsp;Speaker &#x2197;
              </a>

              <button
                onClick={LINKS_ENABLED ? handleSponsorClick : undefined}
                className="flex items-center border-2 rounded-full transition-colors duration-200 border-[#4A6E2D] hover:border-[#ABF760]"
                style={{
                  ...pillStyleLarge,
                  color: sponsorState !== "idle" ? "#ABF760" : "#A5A8B1",
                  transition: "color 0.2s, border-color 0.2s",
                }}
              >
                {sponsorState === "copied"
                  ? `${T[lang].sponsorCopied} ✓`
                  : sponsorState === "show"
                  ? SPONSOR_EMAIL
                  : <>{T[lang].sponsorBase}<span className="hidden sm:inline">&nbsp;{T[lang].sponsorSuffix.trimStart()}</span> &#x2197;</>
                }
              </button>
            </div>

            {/* Footer */}
            <div className="flex justify-center py-3 px-4">
              <span
                style={{
                  fontFamily: "var(--font-neue-machina), sans-serif",
                  fontSize: "10px",
                  color: "#A5A8B1",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {T[lang].footer}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
