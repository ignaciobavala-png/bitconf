"use client";

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

  return (
    <header
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 sm:px-10 py-6"
      style={{
        zIndex: 50,
        background:
          "linear-gradient(to bottom, rgba(13,13,11,0.85) 0%, rgba(13,13,11,0) 100%)",
      }}
    >
      <div className="flex items-center gap-8">
        <a
          href="/home"
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
      </div>
    </header>
  );
}
