"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLangStore } from "@/lib/store/lang";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const ICON = { viewBox: "0 0 24 24", width: 26, height: 26, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const TABS = [
  {
    href: "/evento",
    es: "Ahora",
    en: "Now",
    icon: (
      <svg {...ICON} aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15.5 14" />
      </svg>
    ),
  },
  {
    href: "/evento/agenda",
    es: "Agenda",
    en: "Agenda",
    icon: (
      <svg {...ICON} aria-hidden>
        <line x1="8" y1="6" x2="20" y2="6" />
        <line x1="8" y1="12" x2="20" y2="12" />
        <line x1="8" y1="18" x2="20" y2="18" />
        <circle cx="4" cy="6" r="1" />
        <circle cx="4" cy="12" r="1" />
        <circle cx="4" cy="18" r="1" />
      </svg>
    ),
  },
  {
    href: "/evento/speakers",
    es: "Speakers",
    en: "Speakers",
    icon: (
      <svg {...ICON} aria-hidden>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      </svg>
    ),
  },
  {
    href: "/evento/mi-agenda",
    es: "Mi agenda",
    en: "Mine",
    // La misma agendita de los botones de cada charla.
    icon: (
      <svg {...ICON} aria-hidden>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <line x1="8" y1="3" x2="8" y2="7" />
        <line x1="16" y1="3" x2="16" y2="7" />
        <line x1="3.5" y1="10" x2="20.5" y2="10" />
        <polyline points="8.5 15 11 17.5 15.5 13" />
      </svg>
    ),
  },
];

/** Alto de la barra sin el área segura: el layout reserva lo mismo abajo. */
export const BOTTOM_NAV_H = 76;

/** Barra inferior de la app: reemplaza al navbar del sitio. */
export default function BottomNav() {
  const pathname = usePathname();
  const lang = useLangStore((s) => s.lang);
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "rgba(16,16,16,0.94)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(230,238,242,0.2)",
        boxShadow: "0 -10px 30px rgba(0,0,0,0.6)",
      }}
    >
      {TABS.map((tab) => {
        const active = tab.href === "/evento" ? pathname === "/evento" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className="relative flex flex-1 flex-col items-center justify-center gap-1.5 whitespace-nowrap"
            style={{ height: BOTTOM_NAV_H, color: active ? "#ABF760" : "#E6EEF2", opacity: active ? 1 : 0.7 }}
          >
            {/* Raya superior: marca la pestaña activa sin depender solo del color. */}
            <span
              className="absolute left-1/2 top-0 h-[3px] -translate-x-1/2 rounded-b-full transition-all duration-200"
              style={{ width: active ? "56%" : 0, background: "#ABF760" }}
            />
            {tab.icon}
            <span className="text-[12px] leading-none" style={labelStyle}>
              {tab[lang]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
