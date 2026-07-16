"use client";

import { useLangStore } from "@/lib/store/lang";
import LangToggle from "@/components/LangToggle";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const NAV_LINKS = {
  es: [
    { label: "¿Por qué hodleás?", href: "/home#hodleas" },
    { label: "Comunidad", href: "/home/comunidad" },
    { label: "Sé parte", href: "/home#se-parte" },
  ],
  en: [
    { label: "Why do you hodl?", href: "/home#hodleas" },
    { label: "Community", href: "/home/comunidad" },
    { label: "Be part", href: "/home#se-parte" },
  ],
} as const;

const TICKETS_LABEL = { es: "Tickets", en: "Tickets" } as const;

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
            color: "#FCFCFC",
            fontSize: "clamp(14px, 1.4vw, 18px)",
          }}
        >
          LABITCONF.
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS[lang].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors duration-200 hover:opacity-70"
              style={{
                ...labelStyle,
                color: "#9ACE6A",
                fontSize: "clamp(11px, 0.9vw, 13px)",
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <LangToggle lang={lang} onToggle={toggleLang} />

        <a
          href="/home#tickets"
          className="transition-colors duration-200 hover:opacity-70"
          style={{
            ...labelStyle,
            color: "#9ACE6A",
            fontSize: "clamp(12px, 1vw, 14px)",
          }}
        >
          {TICKETS_LABEL[lang]}
        </a>
      </div>
    </header>
  );
}
