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
      "Cuatro jornadas, del jueves 29 al domingo 1. Elegí el día y mirá qué pasa en cada escenario.",
    count: (n: number) => `${n} charlas confirmadas en los dos días de conferencia`,
    // Se dice una vez acá arriba y no en cada tarjeta: repetir "horario a
    // confirmar" 31 veces convierte el dato en ruido y ensucia la lectura.
    noticeTitle: "Los horarios todavía no están confirmados",
    noticeBody:
      "La organización ya definió día y escenario de cada charla, pero no la hora de inicio. Apenas la confirmen, esta página pasa a mostrar el cronograma completo.",
  },
  en: {
    title: "Agenda",
    lede:
      "Four days, from Thursday the 29th to Sunday the 1st. Pick a day and see what happens on each stage.",
    count: (n: number) => `${n} confirmed talks across the two conference days`,
    noticeTitle: "Start times are not confirmed yet",
    noticeBody:
      "The organizers have set the day and stage for each talk, but not the start time. As soon as they confirm it, this page will show the full schedule.",
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

      <div
        className="mt-8 rounded-2xl"
        style={{
          border: "1px solid rgba(255,171,11,0.35)",
          background: "rgba(255,171,11,0.06)",
          padding: "18px 22px",
          maxWidth: "62ch",
        }}
      >
        <p style={{ ...labelStyle, color: "#FFAB0B", fontSize: "clamp(10px, 1vw, 12px)" }}>
          {t.noticeTitle}
        </p>
        <p
          className="mt-2"
          style={{
            fontFamily: "var(--font-neue-machina), sans-serif",
            fontWeight: 300,
            color: "#A5A8B1",
            fontSize: "clamp(12px, 1.15vw, 14px)",
            lineHeight: 1.6,
          }}
        >
          {t.noticeBody}
        </p>
      </div>
    </>
  );
}
