"use client";

import { usePathname } from "next/navigation";
import Reveal from "@/components/home/Reveal";
import { useLangStore } from "@/lib/store/lang";
import { labelStyle, lightStyle } from "@/components/mas/ui";

// Los cuatro items de MÁS. Mismo orden que el dropdown del navbar.
export const MAS_ITEMS = [
  {
    href: "/mas/hub",
    label: { es: "The University Hub", en: "The University Hub" },
    blurb: {
      es: "Estudiás y querés entrar al ecosistema.",
      en: "You're studying and want into the ecosystem.",
    },
  },
  {
    href: "/mas/embajadores",
    label: { es: "Embajadores", en: "Ambassadors" },
    blurb: {
      es: "Seis voces que representan LABITCONF.",
      en: "Six voices representing LABITCONF.",
    },
  },
  {
    href: "/mas/comunidades",
    label: { es: "Comunidades", en: "Communities" },
    blurb: {
      es: "Tu comunidad puede ser parte de la red.",
      en: "Your community can join the network.",
    },
  },
  {
    href: "/mas/voluntarios",
    label: { es: "Voluntarios", en: "Volunteers" },
    blurb: {
      es: "Vivir el evento desde adentro.",
      en: "Experience the event from the inside.",
    },
  },
] as const;

const T = {
  es: { title: "Seguí explorando" },
  en: { title: "Keep exploring" },
} as const;

/**
 * Tira de cross-links al pie de cada página de MÁS con los otros tres items.
 * Va al final y no como tabs pegadas arriba: el navbar ya es fixed y una
 * segunda barra fija le come media pantalla al mobile.
 */
export default function MasNav() {
  const pathname = usePathname();
  const lang = useLangStore((s) => s.lang);
  const others = MAS_ITEMS.filter((item) => item.href !== pathname);

  // En el índice (/mas) ya están los cuatro listados: no hace falta repetirlos.
  if (others.length === MAS_ITEMS.length) return null;

  return (
    <section
      className="relative px-6 sm:px-10"
      style={{ zIndex: 3, paddingBottom: "clamp(56px, 8vh, 90px)" }}
    >
      <div className="w-full max-w-6xl">
        <Reveal>
          <h2 style={{ ...labelStyle, color: "#A5A8B1", fontSize: "clamp(12px, 1.1vw, 14px)" }}>
            {T[lang].title}
          </h2>
        </Reveal>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {others.map((item, i) => (
            <Reveal key={item.href} delay={i * 0.08}>
              <a
                href={item.href}
                className="block h-full rounded-2xl transition-colors duration-200 hover:bg-[rgba(171,247,96,0.08)]"
                style={{
                  border: "1px solid rgba(171,247,96,0.35)",
                  background: "rgba(13,13,11,0.45)",
                  padding: "clamp(18px, 2.2vw, 26px)",
                }}
              >
                <span
                  className="block"
                  style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(13px, 1.3vw, 16px)" }}
                >
                  {item.label[lang]}
                </span>
                <span
                  className="block mt-2"
                  style={{
                    ...lightStyle,
                    color: "#A5A8B1",
                    fontSize: "clamp(12px, 1.1vw, 14px)",
                    lineHeight: 1.5,
                  }}
                >
                  {item.blurb[lang]}
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
