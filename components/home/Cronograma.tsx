"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/home/Reveal";
import type { Lang } from "@/lib/store/lang";

// Cronograma general del evento (Jue 29 → Dom 1), entre Tickets y Sponsors.
// Replica la pieza que mandó la organización (Cronograma_LABITCONF26_HODL):
// grilla de 4 días × 2 franjas, con los DAY 1/2 y el Closing ocupando más alto
// que su franja. Todo se dimensiona con `--u`, la unidad de la pieza original
// (1/1760 del ancho): en desktop vale `100cqw / 1760`, así la grilla escala entera
// y mantiene las proporciones de la imagen en cualquier ancho. Abajo de `xl` (1280px) no
// entran cuatro columnas: pasa a una lista por día con las mismas tarjetas.

const FONT = "var(--font-neue-machina), sans-serif";
const DAY_FONT = '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif';
const ORANGE = "#FF4E01";
const LIGHT = "#E6EEF2";
const MUTED = "#A5A8B1";

// Tamaño en unidades de la pieza original, con piso en px para que el texto
// chico no quede ilegible cuando la grilla se achica.
const s = (n: number, min = 0) => `max(${min}px, calc(${n} * var(--u)))`;

type Tone = "dark" | "darker" | "light" | "orange";
type Slot = "morning" | "afternoon";

interface Card {
  id: string;
  day: 0 | 1 | 2 | 3;
  slot: Slot;
  tone: Tone;
  pill: { es: string; en: string };
  pillColor: "orange" | "ink" | "muted";
  eyebrow?: { es: string; en: string };
  title: { es: string; en: string };
  /** Tamaño del título en unidades de la pieza. */
  titleSize: number;
  titleColor?: string;
  /** Empuja el bloque de texto al pie de la tarjeta (DAY 1/2, Closing). */
  bottom?: boolean;
  extra?: { es: string; en: string }[];
  link?: { es: string; en: string };
  /** Destino al clickear la tarjeta (pedido de la org, 19/10: burbujas interactivas como la agenda). */
  href?: string;
  /** Grilla desktop: filas (líneas: 1 cabecera, 2 mañana, 3 tarde arriba, 4 tarde abajo). */
  rows: [number, number];
}

const PILL_ALL = { es: "GENERAL · BUSINESS · FULL EXPERIENCE", en: "GENERAL · BUSINESS · FULL EXPERIENCE" };

const CARDS: Card[] = [
  {
    id: "xapo",
    day: 0,
    slot: "afternoon",
    tone: "dark",
    pill: { es: "FULL EXPERIENCE", en: "FULL EXPERIENCE" },
    pillColor: "orange",
    eyebrow: { es: "OPENING COCKTAIL BY", en: "OPENING COCKTAIL BY" },
    title: { es: "XAPO", en: "XAPO" },
    titleSize: 40,
    extra: [
      {
        es: "INAUGURACIÓN DEL MONUMENTO A SATOSHI NAKAMOTO",
        en: "INAUGURATION OF THE SATOSHI NAKAMOTO MONUMENT",
      },
    ],
    link: { es: "+ MANUMAYA SHOW", en: "+ MANUMAYA SHOW" },
    href: "/mas/monumento",
    rows: [3, 5],
  },
  {
    id: "day1",
    day: 1,
    slot: "morning",
    tone: "light",
    pill: PILL_ALL,
    pillColor: "ink",
    title: { es: "DAY 1", en: "DAY 1" },
    titleSize: 88,
    titleColor: ORANGE,
    bottom: true,
    href: "/agenda?day=oct30",
    rows: [2, 4],
  },
  {
    id: "ardua",
    day: 1,
    slot: "afternoon",
    tone: "darker",
    pill: { es: "SPEAKERS · BUSINESS · INVITADOS", en: "SPEAKERS · BUSINESS · GUESTS" },
    // Pedido de la org (19/10): burbuja y letras en gris, sin naranja.
    pillColor: "muted",
    eyebrow: { es: "SIDE EVENT: NETWORKING COCKTAIL BY", en: "SIDE EVENT: NETWORKING COCKTAIL BY" },
    title: { es: "ARDUA", en: "ARDUA" },
    titleSize: 50,
    rows: [4, 5],
  },
  {
    id: "day2",
    day: 2,
    slot: "morning",
    tone: "light",
    pill: PILL_ALL,
    pillColor: "ink",
    title: { es: "DAY 2", en: "DAY 2" },
    titleSize: 88,
    titleColor: ORANGE,
    bottom: true,
    href: "/agenda?day=oct31",
    rows: [2, 4],
  },
  {
    id: "hodlween",
    day: 2,
    slot: "afternoon",
    tone: "orange",
    pill: PILL_ALL,
    pillColor: "ink",
    eyebrow: { es: "FIESTA DE DISFRACES", en: "COSTUME PARTY" },
    title: { es: "HODLWEEN", en: "HODLWEEN" },
    titleSize: 50,
    titleColor: LIGHT,
    href: "/agenda?day=oct31",
    rows: [4, 5],
  },
  {
    id: "closing",
    day: 3,
    slot: "morning",
    tone: "dark",
    pill: { es: "FULL EXPERIENCE", en: "FULL EXPERIENCE" },
    pillColor: "orange",
    eyebrow: { es: "FULL DAY", en: "FULL DAY" },
    title: { es: "CLOSING CHILL OUT", en: "CLOSING CHILL OUT" },
    titleSize: 48,
    bottom: true,
    rows: [2, 4],
  },
];

const DAYS = {
  es: ["JUE 29", "VIE 30", "SÁB 31", "DOM 1"],
  en: ["THU 29", "FRI 30", "SAT 31", "SUN 1"],
};
const SLOTS = {
  es: { morning: "MAÑANA", afternoon: "TARDE" },
  en: { morning: "MORNING", afternoon: "AFTERNOON" },
};

const TONE_BG: Record<Tone, string> = {
  dark: "#3A3939",
  darker: "#2C2B2B",
  light: LIGHT,
  orange: ORANGE,
};

function CardView({ card, lang, minHeight }: { card: Card; lang: Lang; minHeight?: number }) {
  const view = <CardBody card={card} lang={lang} minHeight={minHeight} />;
  if (!card.href) return view;
  return (
    <Link
      href={card.href}
      className="block h-full transition duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ABF760]"
      style={{ borderRadius: s(26, 14) }}
      aria-label={`${card.title[lang]}`}
    >
      {view}
    </Link>
  );
}

function CardBody({ card, lang, minHeight }: { card: Card; lang: Lang; minHeight?: number }) {
  const onLight = card.tone === "light";
  const onOrange = card.tone === "orange";
  const ink = "#171616";
  const pillColor = card.pillColor === "orange" ? ORANGE : card.pillColor === "muted" ? MUTED : ink;

  return (
    <div
      className="flex h-full flex-col"
      style={{
        background: TONE_BG[card.tone],
        minHeight,
        borderRadius: s(26, 14),
        padding: s(22, 16),
        border: card.tone === "darker" ? "1px solid #3A3939" : undefined,
      }}
    >
      <span
        className="self-start"
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: s(10.5, 8),
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          color: pillColor,
          border: `${s(1.8, 1)} solid ${pillColor}`,
          borderRadius: 999,
          padding: `${s(5, 3)} ${s(11, 6)}`,
        }}
      >
        {card.pill[lang]}
      </span>

      <div className={card.bottom ? "mt-auto" : ""} style={{ paddingTop: s(card.bottom ? 24 : 14, card.bottom ? 20 : 8) }}>
        {card.eyebrow && (
          <p
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: s(13, 9),
              letterSpacing: "0.1em",
              color: onOrange ? ink : MUTED,
              marginBottom: s(4, 2),
            }}
          >
            {card.eyebrow[lang]}
          </p>
        )}
        <h3
          style={{
            // DAY 1 / DAY 2 van en grotesca bold, como la pieza: en Neue Machina la
            // Y tiene un corte en el tronco y la organización la quiere continua.
            fontFamily: card.titleSize > 60 ? DAY_FONT : FONT,
            fontWeight: card.titleSize > 60 ? 700 : 900,
            fontSize: s(card.titleSize, card.titleSize > 60 ? 44 : 24),
            lineHeight: card.titleSize > 60 ? 0.95 : 1.02,
            color: card.titleColor ?? (onLight ? ink : LIGHT),
            textWrap: "balance",
          }}
        >
          {card.title[lang]}
        </h3>
      </div>

      {card.extra && (
        <div
          style={{
            marginTop: s(14, 10),
            paddingTop: s(14, 10),
            borderTop: "1px solid rgba(230,238,242,0.14)",
          }}
        >
          {card.extra.map((x) => (
            <p
              key={x.es}
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: s(16, 12),
                lineHeight: 1.25,
                color: LIGHT,
              }}
            >
              {x[lang]}
            </p>
          ))}
          {card.link && (
            <p
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: s(16, 12),
                color: LIGHT,
                marginTop: s(10, 6),
              }}
            >
              {card.link[lang]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Cronograma({ lang }: { lang: Lang }) {
  const aria = lang === "es" ? "Cronograma del evento" : "Event schedule";
  const label = (txt: string) => (
    <span
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: s(24, 13),
        letterSpacing: "0.04em",
        color: LIGHT,
      }}
    >
      {txt}
    </span>
  );

  return (
    <section
      id="cronograma"
      aria-label={aria}
      className="relative px-6 sm:px-10 py-16 sm:py-20"
      style={{ zIndex: 3 }}
    >
      <Reveal className="relative w-full" style={{ height: "clamp(40px, 5.5vw, 68px)" }}>
        <Image
          src={`/assets/home/titulos/${lang === "es" ? "cronograma-es" : "schedule-en"}-trim.png`}
          alt={aria}
          fill
          style={{ objectFit: "contain", objectPosition: "left center" }}
        />
      </Reveal>
      <Reveal className="mt-10 sm:mt-14 w-full xl:mx-auto xl:w-[80%]" style={{ containerType: "inline-size" } as React.CSSProperties}>
        {/* Desktop: grilla fiel a la pieza. */}
        <div
          className="hidden xl:grid"
          style={
            {
              "--u": "calc(100cqw / 1760)",
              gridTemplateColumns: "12.2% repeat(4, minmax(0, 1fr))",
              // header · mañana · tarde (arriba) · tarde (abajo)
              gridTemplateRows: `${s(66)} ${s(266)} ${s(120)} ${s(200)}`,
              columnGap: s(8),
              rowGap: s(8),
            } as React.CSSProperties
          }
        >
          {/* Cabecera de días */}
          <div
            style={{
              gridColumn: "1 / 6",
              gridRow: 1,
              background: "#1D1C1C",
              borderRadius: s(20),
            }}
          />
          {DAYS[lang].map((d, i) => (
            <div key={d} className="flex items-center justify-center" style={{ gridColumn: i + 2, gridRow: 1, zIndex: 1 }}>
              {label(d)}
            </div>
          ))}

          {/* Bandas de franja */}
          <div style={{ gridColumn: "1 / 6", gridRow: 2, background: "#232222", borderRadius: s(20) }} />
          <div style={{ gridColumn: "1 / 6", gridRow: "3 / 5", background: "#171616", borderRadius: s(20) }} />
          <div className="flex items-center pl-[3.2%]" style={{ gridColumn: 1, gridRow: 2, zIndex: 1 }}>
            {label(SLOTS[lang].morning)}
          </div>
          <div className="flex items-center pl-[3.2%]" style={{ gridColumn: 1, gridRow: "3 / 5", zIndex: 1 }}>
            {label(SLOTS[lang].afternoon)}
          </div>

          {/* Jueves sin mañana, domingo sin tarde: raya, como en la pieza. */}
          <div className="flex items-center justify-center" style={{ gridColumn: 2, gridRow: 2, zIndex: 1, color: MUTED }}>
            <span style={{ width: s(26), height: 2, background: MUTED, display: "block" }} />
          </div>
          <div className="flex items-center justify-center" style={{ gridColumn: 5, gridRow: "3 / 5", zIndex: 1 }}>
            <span style={{ width: s(26), height: 2, background: MUTED, display: "block" }} />
          </div>

          {CARDS.map((c) => (
            <div
              key={c.id}
              style={{
                gridColumn: c.day + 2,
                gridRow: `${c.rows[0]} / ${c.rows[1]}`,
                zIndex: 1,
                // Margen de la pieza: las tarjetas no tocan el borde de la banda.
                margin: `${s(8)} 0`,
              }}
            >
              <CardView card={c} lang={lang} />
            </div>
          ))}
        </div>

        {/* Mobile / tablet: un bloque por día. */}
        <div className="xl:hidden flex flex-col gap-8" style={{ "--u": "0.6px" } as React.CSSProperties}>
          {DAYS[lang].map((d, i) => {
            const cards = CARDS.filter((c) => c.day === i);
            return (
              <div key={d}>
                <div className="mb-3">{label(d)}</div>
                <div className="flex flex-col gap-3">
                  {cards.map((c) => (
                    <CardView key={c.id} card={c} lang={lang} minHeight={c.bottom ? 200 : undefined} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
