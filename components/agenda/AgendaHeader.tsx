"use client";

import { useLangStore } from "@/lib/store/lang";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
};

const T = {
  es: {
    title: "Agenda",
    lede:
      "Los dos días de conferencia, viernes 30 y sábado 31 de octubre. Elegí el día y mirá qué pasa en cada escenario.",
    count: (n: number) => `${n} charlas confirmadas en los dos días de conferencia`,
  },
  en: {
    title: "Agenda",
    lede:
      "The two conference days, Friday the 30th and Saturday the 31st of October. Pick a day and see what happens on each stage.",
    count: (n: number) => `${n} confirmed talks across the two conference days`,
  },
} as const;

export default function AgendaHeader({ total }: { total: number }) {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  return (
    <>
      <h1 style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(38px, 7vw, 86px)", lineHeight: 1.02 }}>
        {t.title}
      </h1>
      <p
        className="mt-5"
        style={{
          fontFamily: "var(--font-neue-machina), sans-serif",
          fontWeight: 300,
          color: "#E6EEF2",
          fontSize: "clamp(15px, 1.5vw, 20px)",
          lineHeight: 1.6,
          maxWidth: "58ch",
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
