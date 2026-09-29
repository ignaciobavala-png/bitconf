"use client";

import Image from "next/image";
import { useLangStore } from "@/lib/store/lang";

// Misma altura de letra que el resto de los títulos PNG del sitio.
const TITLE_H = "clamp(40px, 5.5vw, 68px)";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
};

const T = {
  es: {
    title: "Speakers",
    lede: "Conocé a las personas que están construyendo el futuro en la edición HODL LABITCONF 26.",
    // El total sale de la base y no de un número escrito a mano: la planilla se
    // sigue cargando, así que cualquier cifra fija quedaría vieja en días.
    count: (n: number) => `${n} confirmados hasta ahora`,
  },
  en: {
    title: "Speakers",
    lede: "Meet the people building the future at the HODL edition of LABITCONF 26.",
    count: (n: number) => `${n} confirmed so far`,
  },
} as const;

export default function SpeakersHeader({ total }: { total: number }) {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  return (
    <>
      <h1 className="relative w-full" style={{ height: TITLE_H }}>
        <Image
          src="/assets/home/titulos/speakers-trim.png"
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
          maxWidth: "58ch",
        }}
      >
        {t.lede}
      </p>
      <p
        className="mt-3"
        style={{ ...labelStyle, color: "#FF4E01", fontSize: "clamp(11px, 1.05vw, 13px)" }}
      >
        {t.count(total)}
      </p>
    </>
  );
}
