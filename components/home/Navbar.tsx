"use client";

import { useState, useEffect } from "react";
import { useLangStore } from "@/lib/store/lang";
import LangToggle from "@/components/LangToggle";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

// Orden acordado (reunión 16/7): izquierda Tickets → Comunidad; derecha
// "¿Por qué hodleás?" (lleva al final de la página) + selector de idioma.
const LEFT_LINKS = {
  es: [
    { label: "Tickets", href: "/home#tickets" },
    { label: "Comunidad", href: "/home/comunidad" },
  ],
  en: [
    { label: "Tickets", href: "/home#tickets" },
    { label: "Community", href: "/home/comunidad" },
  ],
} as const;

const HODLEAS_LINK = {
  es: { label: "¿Por qué hodleás?", href: "/home#hodleas" },
  en: { label: "Why do you hodl?", href: "/home#hodleas" },
} as const;

export default function Navbar() {
  const lang = useLangStore((s) => s.lang);
  const toggleLang = useLangStore((s) => s.toggleLang);
  const [menuOpen, setMenuOpen] = useState(false);

  // Menú mobile: cerrar con Escape y bloquear el scroll del body mientras abierto.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Los 3 links juntos para el menú mobile (izquierda + hodleás).
  const mobileLinks = [...LEFT_LINKS[lang], HODLEAS_LINK[lang]];

  return (
    <header
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 sm:px-10 py-6"
      style={{
        zIndex: 50,
        background: menuOpen
          ? "#171616"
          : "linear-gradient(to bottom, rgba(23,22,22,0.85) 0%, rgba(23,22,22,0) 100%)",
      }}
    >
      <div className="flex items-center gap-8">
        <a
          href="/home"
          onClick={() => setMenuOpen(false)}
          style={{
            ...labelStyle,
            color: "#E6EEF2",
            fontSize: "clamp(14px, 1.4vw, 18px)",
          }}
        >
          LABITCONF.
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {LEFT_LINKS[lang].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors duration-200 hover:opacity-70"
              style={{
                ...labelStyle,
                color: "#ABF760",
                fontSize: "clamp(11px, 0.9vw, 13px)",
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <a
          href={HODLEAS_LINK[lang].href}
          className="hidden md:inline-block transition-colors duration-200 hover:opacity-70"
          style={{
            ...labelStyle,
            color: "#ABF760",
            fontSize: "clamp(11px, 0.9vw, 13px)",
          }}
        >
          {HODLEAS_LINK[lang].label}
        </a>

        <LangToggle lang={lang} onToggle={toggleLang} />

        {/* Botón hamburguesa — solo mobile */}
        <button
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden flex flex-col justify-center items-center"
          style={{ width: 28, height: 28, gap: 6 }}
        >
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "#E6EEF2",
              transition: "transform 0.25s, opacity 0.25s",
              transform: menuOpen ? "translateY(4px) rotate(45deg)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "#E6EEF2",
              transition: "transform 0.25s, opacity 0.25s",
              transform: menuOpen ? "translateY(-4px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </div>

      {/* Panel del menú mobile */}
      {menuOpen && (
        <nav
          className="md:hidden absolute left-0 right-0 top-full flex flex-col"
          style={{
            background: "#171616",
            borderTop: "1px solid rgba(230,238,242,0.08)",
            padding: "8px 24px 28px",
          }}
        >
          {mobileLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                ...labelStyle,
                color: "#ABF760",
                fontSize: "18px",
                padding: "18px 0",
                borderBottom: "1px solid rgba(230,238,242,0.06)",
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
