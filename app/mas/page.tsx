"use client";

import Image from "next/image";
import Reveal from "@/components/home/Reveal";
import Floating from "@/components/home/Floating";
import { useLangStore } from "@/lib/store/lang";
import { MAS_ITEMS } from "@/components/mas/MasNav";
import { MasSection, TitleText, Lead, CopyCard, labelStyle, lightStyle } from "@/components/mas/ui";

// Índice de MÁS: la puerta a las cuatro formas de participar. El PDF de fase 2
// las lista como un dropdown; esta página existe para que "MÁS" también sea un
// destino compartible y para la sección Comunidad de la home.

const T = {
  es: {
    title: "Más",
    lead: "Encontrá tu lugar dentro de LABITCONF.",
    copy: [
      "LABITCONF no es solamente dos días de charlas: es la red que las sostiene. Estudiantes, embajadores, comunidades y voluntarios son las cuatro formas de estar adentro, no solo de venir.",
      "Elegí por dónde entrás.",
    ],
  },
  en: {
    title: "More",
    lead: "Find your place inside LABITCONF.",
    copy: [
      "LABITCONF isn't just two days of talks: it's the network behind them. Students, ambassadors, communities and volunteers are the four ways to be part of it, not just to attend.",
      "Pick where you come in.",
    ],
  },
} as const;

// Figuras 3D ya usadas en el resto del sitio, una por item.
const ITEM_ART = [
  "/assets/home/ballena-final.png",
  "/assets/home/honeybadger-final.png",
  "/assets/home/pildora-final.png",
  "/assets/home/astronauta-final.png",
] as const;

export default function MasIndexPage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  return (
    <MasSection bg="/assets/home/labitconf-pixel.png" bgOpacity={0.4} first tall>
      <TitleText>{t.title}</TitleText>
      <Lead>{t.lead}</Lead>
      <CopyCard paragraphs={t.copy} justify />

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {MAS_ITEMS.map((item, i) => (
          <Reveal key={item.href} delay={0.1 + i * 0.1} className="h-full">
            <a
              href={item.href}
              className="relative flex flex-col justify-end h-full rounded-3xl overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
              style={{
                aspectRatio: "1 / 1.25",
                border: "1px solid #ABF760",
                background: "rgba(13,13,11,0.45)",
                padding: "clamp(18px, 2.2vw, 26px)",
              }}
            >
              <div
                className="absolute pointer-events-none select-none"
                style={{ top: "6%", left: "14%", right: "14%", height: "48%", opacity: 0.9 }}
              >
                <Floating duration={5 + i * 0.5} y={9} rotate={3}>
                  <Image src={ITEM_ART[i]} alt="" fill style={{ objectFit: "contain" }} />
                </Floating>
              </div>

              <span
                className="relative block"
                style={{
                  ...labelStyle,
                  color: "#E6EEF2",
                  fontSize: "clamp(14px, 1.5vw, 18px)",
                  lineHeight: 1.15,
                  // Dos líneas fijas: "The University Hub" ocupa dos y sin esto
                  // las bajadas de las cuatro cards quedan a alturas distintas.
                  minHeight: "2.3em",
                }}
              >
                {item.label[lang]}
              </span>
              <span
                className="relative block mt-2"
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
    </MasSection>
  );
}
