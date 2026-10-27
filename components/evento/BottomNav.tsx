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

const TABS = [
  { href: "/evento", es: "Ahora", en: "Now" },
  { href: "/evento/agenda", es: "Agenda", en: "Agenda" },
  { href: "/evento/speakers", es: "Speakers", en: "Speakers" },
  { href: "/evento/mi-agenda", es: "Mi agenda", en: "Mine" },
];

/** Barra inferior de la app: reemplaza al navbar del sitio. */
export default function BottomNav() {
  const pathname = usePathname();
  const lang = useLangStore((s) => s.lang);
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex border-t border-white/10 bg-black"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((tab) => {
        const active = tab.href === "/evento" ? pathname === "/evento" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 py-4 text-center text-[11px] whitespace-nowrap"
            style={{ ...labelStyle, color: active ? "#ABF760" : "#A5A8B1" }}
            aria-current={active ? "page" : undefined}
          >
            {tab[lang]}
          </Link>
        );
      })}
    </nav>
  );
}
