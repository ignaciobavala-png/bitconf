"use client";

import { useState, useEffect, useRef } from "react";
import { useLangStore } from "@/lib/store/lang";
import LangToggle from "@/components/LangToggle";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

// Orden acordado (reunión 16/7) + mapa de fase 2 (PDF "FASE 2 - WEB 15.08"):
// izquierda Speakers → Agenda → Tickets → MÁS ▾; derecha
// "¿Por qué hodleás?" (lleva al final de la página) + selector de idioma.
// Mi Agenda NO está acá a propósito (feedback 03/09 de la organización): es un
// CTA que acompaña toda la experiencia, no una pestaña más. Vive en el botón
// lateral `components/home/MyAgendaButton.tsx`.
const LEFT_LINKS = {
  es: [
    { label: "Speakers", href: "/speakers" },
    { label: "Agenda", href: "/agenda" },
    { label: "Tickets", href: "/#tickets" },
  ],
  en: [
    { label: "Speakers", href: "/speakers" },
    { label: "Agenda", href: "/agenda" },
    { label: "Tickets", href: "/#tickets" },
  ],
} as const;

// MÁS = participar. Los cuatro items son páginas propias bajo /mas; el menú es
// el único acceso desde el navbar (antes había un link suelto a /comunidad).
const MAS_MENU = {
  es: {
    label: "Más",
    items: [
      { label: "The University Hub", href: "/mas/hub" },
      { label: "Embajadores", href: "/mas/embajadores" },
      { label: "Comunidades", href: "/mas/comunidades" },
      { label: "Voluntarios", href: "/mas/voluntarios" },
    ],
  },
  en: {
    label: "More",
    items: [
      { label: "The University Hub", href: "/mas/hub" },
      { label: "Ambassadors", href: "/mas/embajadores" },
      { label: "Communities", href: "/mas/comunidades" },
      { label: "Volunteers", href: "/mas/voluntarios" },
    ],
  },
} as const;

const HODLEAS_LINK = {
  es: { label: "¿Por qué hodleás?", href: "/#contacto" },
  en: { label: "Why do you hodl?", href: "/#contacto" },
} as const;

export default function Navbar() {
  const lang = useLangStore((s) => s.lang);
  const toggleLang = useLangStore((s) => s.toggleLang);
  const [menuOpen, setMenuOpen] = useState(false);
  const [masOpen, setMasOpen] = useState(false);
  const masRef = useRef<HTMLDivElement>(null);

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

  // Dropdown de MÁS: cerrar con Escape o al clickear afuera. El hover solo no
  // alcanza — en touch no hay hover y el panel quedaría inalcanzable.
  useEffect(() => {
    if (!masOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMasOpen(false);
    const onDown = (e: MouseEvent) => {
      if (!masRef.current?.contains(e.target as Node)) setMasOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [masOpen]);

  const mas = MAS_MENU[lang];

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
          href="/"
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

          {/* MÁS ▾ — el panel arranca pegado al botón (padding, no margin): un
              hueco entre ambos cierra el menú antes de llegar a clickearlo. */}
          <div
            ref={masRef}
            className="relative"
            onMouseEnter={() => setMasOpen(true)}
            onMouseLeave={() => setMasOpen(false)}
          >
            <button
              type="button"
              aria-expanded={masOpen}
              aria-haspopup="true"
              onClick={() => setMasOpen((v) => !v)}
              className="flex items-center gap-1 transition-colors duration-200 hover:opacity-70"
              style={{
                ...labelStyle,
                color: "#ABF760",
                fontSize: "clamp(11px, 0.9vw, 13px)",
              }}
            >
              {mas.label}
              <span
                style={{
                  fontSize: "0.8em",
                  transition: "transform 0.2s",
                  transform: masOpen ? "rotate(180deg)" : "none",
                }}
              >
                ▾
              </span>
            </button>

            {masOpen && (
              <div className="absolute left-0 top-full" style={{ paddingTop: 14 }}>
                <div
                  className="flex flex-col rounded-2xl overflow-hidden"
                  style={{
                    minWidth: 210,
                    background: "#171616",
                    border: "1px solid #ABF760",
                    boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
                  }}
                >
                  {mas.items.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMasOpen(false)}
                      className="transition-colors duration-200 hover:bg-[#ABF760] hover:text-[#171616]"
                      style={{
                        ...labelStyle,
                        color: "#E6EEF2",
                        fontSize: "12px",
                        padding: "13px 18px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
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

      {/* Panel del menú mobile — MÁS va desplegado como grupo, no como submenú:
          son cuatro items y esconderlos detrás de otro tap no gana nada. */}
      {menuOpen && (
        <nav
          className="md:hidden absolute left-0 right-0 top-full flex flex-col overflow-y-auto"
          style={{
            background: "#171616",
            borderTop: "1px solid rgba(230,238,242,0.08)",
            padding: "8px 24px 28px",
            maxHeight: "calc(100vh - 100%)",
          }}
        >
          {[...LEFT_LINKS[lang], HODLEAS_LINK[lang]].map((link) => (
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

          <span
            style={{
              ...labelStyle,
              color: "#FF4E01",
              fontSize: "13px",
              padding: "22px 0 6px",
            }}
          >
            {mas.label}
          </span>
          {mas.items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                ...labelStyle,
                color: "#E6EEF2",
                fontSize: "16px",
                padding: "14px 0",
                borderBottom: "1px solid rgba(230,238,242,0.06)",
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
