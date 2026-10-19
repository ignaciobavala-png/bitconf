"use client";

import Image from "next/image";
import { useLangStore } from "@/lib/store/lang";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
};

// Altura uniforme de los títulos PNG de la org (igual que SpeakersHeader y la home).
const TITLE_H = "clamp(40px, 5.5vw, 68px)";

const T = {
  es: {
    title: "Agenda",
    lede:
      "Los dos días de conferencia, viernes 30 y sábado 31 de octubre.\nElegí el día y mirá qué pasa en cada escenario.",
    count: (n: number) => `${n} sesiones en los dos días de conferencia`,
  },
  en: {
    title: "Agenda",
    lede:
      "The two conference days, Friday the 30th and Saturday the 31st of October.\nPick a day and see what happens on each stage.",
    count: (n: number) => `${n} sessions across the two conference days`,
  },
} as const;

export default function AgendaHeader({ total }: { total: number }) {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  return (
    <>
      <h1 className="relative w-full" style={{ height: TITLE_H }}>
        <Image
          src={`/assets/home/titulos/agenda-${lang}-trim.png`}
          alt={t.title}
          fill
          priority
          style={{ objectFit: "contain", objectPosition: "left center" }}
        />
      </h1>
      <p
        className="mt-5"
        style={{
          fontFamily: "var(--font-neue-machina), sans-serif",
          fontWeight: 300,
          color: "#E6EEF2",
          fontSize: "clamp(15px, 1.5vw, 20px)",
          lineHeight: 1.6,
          maxWidth: "72ch",
          // La segunda oración arranca en renglón propio (pedido de la org, 15/10).
          whiteSpace: "pre-line",
        }}
      >
        {t.lede}
      </p>
      <p className="mt-3" style={{ ...labelStyle, color: "#FF4E01", fontSize: "clamp(11px, 1.05vw, 13px)" }}>
        {t.count(total)}
      </p>
    </>
  );
}
