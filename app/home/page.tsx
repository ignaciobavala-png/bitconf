"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/home/Navbar";
import QaChatWidget from "@/components/home/QaChatWidget";
import Footer from "@/components/home/Footer";
import Reveal from "@/components/home/Reveal";
import Floating from "@/components/home/Floating";
import { useLangStore } from "@/lib/store/lang";

// Versiones -trim (recortadas al texto): los originales tienen lienzo 1000x500
// con alturas de texto muy dispares, lo que hacía que cada título se viera de
// un tamaño distinto. Recortados + altura fija = misma altura de letra en todos.
const TITLE_IMAGES = {
  labitconf: "/assets/home/titulos/labitconf-trim.png",
  tickets: "/assets/home/titulos/tickets-trim.png",
  seParte: { es: "/assets/home/titulos/se-parte-es-trim.png", en: "/assets/home/titulos/se-parte-en-trim.png" },
  costaSalguero: "/assets/home/titulos/costa-salguero-trim.png",
} as const;

// Altura uniforme de los títulos de sección
const TITLE_H = "clamp(40px, 5.5vw, 68px)";

const T = {
  es: {
    heroButton: "Comprar Ticket",
    presentacionP1:
      "LABITCONF vuelve a Buenos Aires para su edición número 13, conectando a los líderes, constructores y comunidades que están dando forma al futuro de América Latina.",
    presentacionP2: "Porque las mejores historias son las que siguen construyéndose.",
    ubicacionP1:
      "Centro Costa Salguero es uno de los espacios más reconocidos para eventos en la Ciudad de Buenos Aires.",
    ubicacionP2:
      "Cada año recibe conferencias, ferias y exposiciones de gran escala, consolidándose como un punto clave en el mapa cultural y tecnológico de la ciudad. Será la sede oficial de LABITCONF 2026 los días 30 y 31 de octubre.",
    ubicacionBtn: "Abrir en Google Maps",
    mapTitle: "Ubicación Costa Salguero",
  },
  en: {
    heroButton: "Buy Ticket",
    presentacionP1:
      "LABITCONF returns to Buenos Aires for its 13th edition, connecting the leaders, builders and communities shaping the future of Latin America.",
    presentacionP2: "Because the best stories are the ones still being written.",
    ubicacionP1:
      "Centro Costa Salguero is one of the most recognized event spaces in the City of Buenos Aires.",
    ubicacionP2:
      "Every year it hosts large-scale conferences, fairs and exhibitions, cementing itself as a key point on the city's cultural and technological map. It will be the official venue of LABITCONF 2026 on October 30 and 31.",
    ubicacionBtn: "Open in Google Maps",
    mapTitle: "Costa Salguero Location",
  },
} as const;

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};


const TICKETS = [
  {
    tier: "General",
    code: "GEN",
    level: "01",
    pass: "General Pass",
    accent: "#A5A8B1",
    background:
      "linear-gradient(155deg, #3a3a3a 0%, #1c1c1c 45%, #2e2e2e 70%, #111 100%)",
  },
  {
    tier: "Business",
    code: "BIZ",
    level: "02",
    pass: "Business Pass",
    accent: "#F7931A",
    background:
      "linear-gradient(155deg, #f2f2f2 0%, #cfcfcf 30%, #8a8a8a 55%, #d8d8d8 75%, #a0a0a0 100%)",
    dark: false,
  },
  {
    tier: "Experience",
    code: "EXP",
    level: "03",
    pass: "Experience Pass",
    accent: "#F7931A",
    background:
      "linear-gradient(155deg, #3a1d6e 0%, #b02ee0 25%, #F7931A 50%, #2ee0c8 75%, #1c1c3a 100%)",
  },
] as const;

const SE_PARTE_CARDS = {
  es: [
    {
      title: "Sponsor Deck",
      description: "Conocé las propuestas para sponsors y sé parte del evento más relevante de Bitcoin y Blockchain en LATAM.",
      cta: "Descargá",
      href: "#",
    },
    {
      title: "Prensa",
      description: "Acreditate como periodista y accedé a las zonas exclusivas de cobertura. Completá el formulario en el link de abajo.",
      cta: "Acreditate",
      href: "#",
    },
    {
      title: "Speakers",
      description: "Completá el formulario y postulá tu charla para la edición 2026. Aplicá ahora y compartí tu mirada sobre el futuro de Bitcoin y la descentralización en LATAM.",
      cta: "Aplicá",
      href: "#",
    },
  ],
  en: [
    {
      title: "Sponsor Deck",
      description: "Check out the sponsor proposals and be part of the most relevant Bitcoin and Blockchain event in LATAM.",
      cta: "Download",
      href: "#",
    },
    {
      title: "Press",
      description: "Get accredited as a journalist and access exclusive coverage areas. Fill out the form below.",
      cta: "Get Accredited",
      href: "#",
    },
    {
      title: "Speakers",
      description: "Fill out the form and apply to speak at the 2026 edition. Apply now and share your take on the future of Bitcoin and decentralization in LATAM.",
      cta: "Apply",
      href: "#",
    },
  ],
} as const;

type SpeakerCard =
  | { kind: "photo" }
  | { kind: "stat"; value: string; label: string }
  | { kind: "label"; title: string; subtitle: string };

const PHOTO_GRADIENTS = [
  "linear-gradient(135deg, #4A6E2D 0%, #9ACE6A 100%)",
  "linear-gradient(135deg, #1c1c1c 0%, #F7931A 100%)",
  "linear-gradient(135deg, #2e2e2e 0%, #A5A8B1 100%)",
  "linear-gradient(135deg, #0D0D0B 0%, #4A6E2D 60%, #9ACE6A 100%)",
  "linear-gradient(135deg, #3a1d6e 0%, #F7931A 100%)",
];

const SPEAKER_LANES: {
  id: string;
  direction: "left" | "right";
  duration: number;
  cards: SpeakerCard[];
}[] = [
  {
    id: "s1",
    direction: "left",
    duration: 42,
    cards: [
      { kind: "label", title: "Attendees", subtitle: "LABITCONF '24" },
      { kind: "photo" },
      { kind: "photo" },
      { kind: "photo" },
    ],
  },
  {
    id: "s2",
    direction: "right",
    duration: 50,
    cards: [
      { kind: "photo" },
      { kind: "photo" },
      { kind: "stat", value: "+256", label: "Talks" },
      { kind: "stat", value: "+16", label: "Countries that attend" },
      { kind: "photo" },
    ],
  },
  {
    id: "s3",
    direction: "left",
    duration: 46,
    cards: [
      { kind: "photo" },
      { kind: "stat", value: "+27", label: "Media Partners" },
      { kind: "photo" },
      { kind: "stat", value: "7", label: "Stages" },
      { kind: "stat", value: "+58", label: "Sponsors" },
    ],
  },
  {
    id: "s4",
    direction: "right",
    duration: 55,
    cards: [
      { kind: "photo" },
      { kind: "photo" },
      { kind: "stat", value: "5", label: "Partners & Collaborators" },
      { kind: "stat", value: "+420", label: "International Speakers" },
    ],
  },
];

function SpeakerCardView({ card, gradientIndex }: { card: SpeakerCard; gradientIndex: number }) {
  if (card.kind === "photo") {
    return (
      <div
        className="rounded-full shrink-0"
        style={{
          width: "220px",
          height: "140px",
          background: PHOTO_GRADIENTS[gradientIndex % PHOTO_GRADIENTS.length],
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
    );
  }

  if (card.kind === "stat") {
    return (
      <div
        className="rounded-full shrink-0 flex items-center gap-4 px-9"
        style={{ height: "140px", border: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}
      >
        <span style={{ ...labelStyle, fontSize: "clamp(32px, 3.5vw, 44px)", color: "#FCFCFC" }}>
          {card.value}
        </span>
        <span
          style={{
            fontFamily: "var(--font-neue-machina), sans-serif",
            fontWeight: 300,
            fontSize: "13px",
            color: "#A5A8B1",
            maxWidth: "100px",
            lineHeight: 1.3,
            whiteSpace: "normal",
          }}
        >
          {card.label}
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-full shrink-0 flex flex-col items-start justify-center px-9"
      style={{ height: "140px", border: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}
    >
      <span
        style={{
          fontFamily: "var(--font-neue-machina), sans-serif",
          fontWeight: 300,
          fontSize: "12px",
          color: "#A5A8B1",
        }}
      >
        {card.title}
      </span>
      <span style={{ ...labelStyle, fontSize: "14px", color: "#FCFCFC", marginTop: "4px" }}>
        {card.subtitle}
      </span>
    </div>
  );
}

export default function HomePage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];
  const seParteCards = SE_PARTE_CARDS[lang];

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#0D0D0B" }}
    >
      {/* Fondo: ballena estilizada */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{ zIndex: 0 }}
      >
        <Image
          src="/assets/home/ballena.png"
          alt=""
          fill
          priority
          style={{
            objectFit: "contain",
            objectPosition: "85% 40%",
            opacity: 0.45,
            filter: "grayscale(1) brightness(3) contrast(0.9)",
          }}
        />
      </div>

      {/* Degradé para legibilidad sobre la ballena */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(13,13,11,0.75) 0%, rgba(13,13,11,0.4) 55%, transparent 80%)",
        }}
      />

      {/* Navbar */}
      <Navbar />

      {/* Hero central */}
      <section
        className="relative flex flex-col items-center justify-center px-6"
        style={{ zIndex: 3, height: "100vh", paddingTop: "6rem" }}
      >
        <Reveal className="w-full flex justify-center">
          <Image
            src="/assets/home/hodl-main.png"
            alt="LABITCONF 26 — HODL, Costa Salguero, BsAs, OCT 30-31"
            width={1800}
            height={684}
            priority
            className="w-[92vw] sm:w-[70vw] md:w-[52vw]"
            style={{ objectFit: "contain", height: "auto" }}
          />
        </Reveal>

        <Reveal delay={0.15}>
          <a
            href="#tickets"
            className="mt-14 inline-block rounded-full transition-colors duration-200 border-2"
            style={{
              ...labelStyle,
              color: "#0D0D0B",
              background: "#9ACE6A",
              borderColor: "#9ACE6A",
              fontSize: "clamp(12px, 1.1vw, 15px)",
              padding: "12px 32px",
            }}
          >
            {t.heroButton}
          </a>
        </Reveal>
      </section>

      {/* Presentación */}
      <section
        id="presentacion"
        className="relative flex flex-col justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, height: "100vh" }}
      >
        {/* Fondo: hashes cripto (complementa la textura pixel del título) */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{ zIndex: 0, opacity: 0.3 }}
        >
          <Image
            src="/assets/home/hashes.jpg"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, #0D0D0B 0%, rgba(13,13,11,0.35) 15%, rgba(13,13,11,0.35) 80%, #0D0D0B 100%)",
          }}
        />

        {/* Píldora BTC — contra el borde derecho de la sección, fuera del bloque de texto */}
        <div
          className="absolute pointer-events-none select-none hidden sm:block"
          style={{
            top: "50%",
            right: "2rem",
            transform: "translateY(-50%)",
            width: "min(22vw, 220px)",
            height: "min(22vw, 220px)",
            zIndex: 1,
          }}
        >
          <Floating duration={6} y={10} rotate={4}>
            <Image
              src="/assets/home/pildora.png"
              alt=""
              fill
              style={{ objectFit: "contain" }}
            />
          </Floating>
        </div>

        <div className="relative w-full max-w-6xl" style={{ zIndex: 2 }}>
          <Reveal className="relative w-full" style={{ zIndex: 2, height: TITLE_H }}>
            <Image
              src={TITLE_IMAGES.labitconf}
              alt="LABITCONF"
              fill
              style={{ objectFit: "contain", objectPosition: "left center" }}
            />
          </Reveal>

          <Reveal delay={0.1}>
            <p
              className="relative mt-6"
              style={{
                ...labelStyle,
                color: "#FCFCFC",
                fontSize: "clamp(20px, 3.2vw, 34px)",
                zIndex: 2,
              }}
            >
              Latin American <span style={{ color: "#F7931A" }}>Bitcoin</span> &{" "}
              <span style={{ color: "#F7931A" }}>Blockchain</span> Conference
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <p
              className="relative mt-6 max-w-2xl"
              style={{
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 300,
                color: "#A5A8B1",
                fontSize: "clamp(14px, 1.4vw, 17px)",
                lineHeight: 1.6,
                zIndex: 2,
              }}
            >
              {t.presentacionP1}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <p
              className="relative mt-4 max-w-2xl"
              style={{
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 300,
                color: "#A5A8B1",
                fontSize: "clamp(14px, 1.4vw, 17px)",
                lineHeight: 1.6,
                zIndex: 2,
              }}
            >
              {t.presentacionP2}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Speakers */}
      <section
        id="speakers"
        className="relative flex flex-col justify-center overflow-hidden"
        style={{ zIndex: 3, height: "100vh" }}
      >
        {/* Fondo: grilla de puntos */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{ zIndex: 0, opacity: 0.12, filter: "invert(1)" }}
        >
          <Image
            src="/assets/home/pixel-grid.png"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, #0D0D0B 0%, rgba(13,13,11,0.5) 15%, rgba(13,13,11,0.5) 85%, #0D0D0B 100%)",
          }}
        />

        <div className="relative flex flex-col gap-6" style={{ zIndex: 2 }}>
          {SPEAKER_LANES.map((lane) => {
            // Un solo set de cards (4-5, ~900-1500px) es más angosto que el viewport,
            // así que duplicar una vez no alcanza para tapar la pantalla: hay que
            // repetir el set varias veces para que el loop -50% quede sin huecos.
            const REPEATS = 6;
            const repeated = Array.from({ length: REPEATS }, () => lane.cards).flat();
            return (
              <div key={lane.id} className="relative w-full overflow-hidden" style={{ height: "140px" }}>
                <motion.div
                  className="flex items-center absolute top-0 left-0"
                  style={{ gap: "24px", width: "max-content" }}
                  animate={{ x: lane.direction === "left" ? ["0%", `-${100 / REPEATS}%`] : [`-${100 / REPEATS}%`, "0%"] }}
                  transition={{ duration: lane.duration, repeat: Infinity, ease: "linear" }}
                >
                  {repeated.map((card, i) => (
                    <SpeakerCardView key={`${lane.id}-${i}`} card={card} gradientIndex={i % lane.cards.length} />
                  ))}
                </motion.div>
              </div>
            );
          })}
        </div>
      </section>
      {/* Tickets */}
      <section
        id="tickets"
        className="relative flex flex-col justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, height: "100vh" }}
      >
        {/* Fondo: lluvia de dígitos */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{ zIndex: 0, opacity: 0.5 }}
        >
          <Image
            src="/assets/home/lluvia.png"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, #0D0D0B 0%, rgba(13,13,11,0.4) 15%, rgba(13,13,11,0.4) 80%, #0D0D0B 100%)",
          }}
        />

        <div className="relative w-full" style={{ zIndex: 2 }}>
          <Reveal className="relative w-full" style={{ height: TITLE_H }}>
            <Image
              src={TITLE_IMAGES.tickets}
              alt="Tickets"
              fill
              style={{ objectFit: "contain", objectPosition: "left center" }}
            />
          </Reveal>

          <Reveal
            delay={0.15}
            className="mt-10 sm:mt-16 mx-auto max-w-4xl flex sm:grid sm:grid-cols-3 gap-6 sm:gap-10 justify-items-center overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none px-6 sm:px-0 -mx-6 sm:mx-auto"
          >
            {TICKETS.map((ticket) => (
              <div
                key={ticket.tier}
                className="relative rounded-2xl w-[180px] sm:w-full sm:max-w-[260px] shrink-0 snap-center"
                style={{
                  aspectRatio: "5 / 8",
                  background: ticket.background,
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    ...labelStyle,
                    color: ticket.tier === "Business" ? "#0D0D0B" : ticket.accent,
                    fontSize: "clamp(16px, 1.6vw, 20px)",
                  }}
                >
                  {ticket.tier}
                </div>
                <div
                  style={{
                    height: "2px",
                    width: "40%",
                    background:
                      ticket.tier === "Business"
                        ? "rgba(13,13,11,0.4)"
                        : "rgba(255,255,255,0.25)",
                    margin: "10px 0 16px",
                  }}
                />

                <div
                  style={{
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 300,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontSize: "9px",
                    color: ticket.tier === "Business" ? "rgba(13,13,11,0.6)" : "#A5A8B1",
                  }}
                >
                  Access Level
                </div>
                <div
                  style={{
                    ...labelStyle,
                    color: ticket.tier === "Business" ? "#0D0D0B" : "#FCFCFC",
                    fontSize: "clamp(22px, 3vw, 30px)",
                    marginTop: "2px",
                  }}
                >
                  HODL
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 300,
                    fontSize: "9px",
                    color: ticket.tier === "Business" ? "rgba(13,13,11,0.6)" : "#A5A8B1",
                    marginTop: "2px",
                  }}
                >
                  LABITCONF 2026
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 300,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontSize: "9px",
                    color: ticket.tier === "Business" ? "rgba(13,13,11,0.6)" : "#A5A8B1",
                    marginTop: "20px",
                  }}
                >
                  Access Type
                </div>
                <div
                  style={{
                    ...labelStyle,
                    color: ticket.tier === "Business" ? "#0D0D0B" : ticket.accent,
                    fontSize: "clamp(11px, 1.2vw, 13px)",
                    marginTop: "2px",
                  }}
                >
                  {ticket.pass}
                </div>

                <div
                  className="absolute"
                  style={{
                    bottom: "76px",
                    left: "20px",
                    ...labelStyle,
                    color: ticket.tier === "Business" ? "#0D0D0B" : "#F7931A",
                    fontSize: "clamp(30px, 4vw, 40px)",
                  }}
                >
                  {ticket.level}
                </div>

                <div
                  className="absolute rounded-full flex items-center justify-center"
                  style={{
                    bottom: "76px",
                    right: "20px",
                    width: "34px",
                    height: "34px",
                    border: `1px solid ${
                      ticket.tier === "Business" ? "rgba(13,13,11,0.4)" : "rgba(255,255,255,0.3)"
                    }`,
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 900,
                    fontSize: "8px",
                    color: ticket.tier === "Business" ? "#0D0D0B" : "#FCFCFC",
                  }}
                >
                  {ticket.code}
                </div>

                <div
                  className="absolute"
                  style={{
                    bottom: "20px",
                    left: "20px",
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 900,
                    fontSize: "10px",
                    color: ticket.tier === "Business" ? "#0D0D0B" : "#FCFCFC",
                  }}
                >
                  LABITCONF 2026
                  <div
                    style={{
                      fontWeight: 300,
                      fontSize: "8px",
                      color: ticket.tier === "Business" ? "rgba(13,13,11,0.6)" : "#A5A8B1",
                      marginTop: "2px",
                    }}
                  >
                    Hodl the future
                  </div>
                </div>
              </div>
            ))}
          </Reveal>

        </div>

        {/* Honeybadger — anclado al borde de la sección para que no lo recorte el overflow */}
        <div
          className="absolute pointer-events-none select-none hidden sm:block"
          style={{
            bottom: "1.5rem",
            left: "2rem",
            width: "min(16vw, 170px)",
            height: "min(16vw, 170px)",
            zIndex: 3,
          }}
        >
          <Floating duration={5} y={7} rotate={3}>
            <Image
              src="/assets/home/honeybadger.png"
              alt=""
              fill
              style={{ objectFit: "contain" }}
            />
          </Floating>
        </div>
      </section>

      {/* Sé parte */}
      <section
        id="se-parte"
        className="relative flex flex-col justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, height: "100vh" }}
      >
        {/* Fondo: grilla pixel con iconos */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{ zIndex: 0, opacity: 0.15, filter: "invert(1)" }}
        >
          <Image
            src="/assets/home/pixel-grid-2.png"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, #0D0D0B 0%, rgba(13,13,11,0.4) 15%, rgba(13,13,11,0.4) 80%, #0D0D0B 100%)",
          }}
        />

        <div className="relative w-full max-w-6xl" style={{ zIndex: 2 }}>
          <Reveal className="relative w-full" style={{ height: TITLE_H }}>
            <Image
              src={TITLE_IMAGES.seParte[lang]}
              alt={lang === "es" ? "Sé parte" : "Be part"}
              fill
              style={{ objectFit: "contain", objectPosition: "left center" }}
            />
          </Reveal>

          <div className="mt-10 mx-auto grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-8 max-w-4xl">
            {seParteCards.map((card, i) => (
              <Reveal
                key={card.title}
                delay={0.1 + i * 0.12}
                className="rounded-2xl flex flex-col"
                style={{
                  background: "#F7931A",
                  padding: "22px 22px",
                }}
              >
                <h3
                  style={{
                    ...labelStyle,
                    color: "#0D0D0B",
                    fontSize: "clamp(16px, 2vw, 24px)",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  className="mt-3 flex-1"
                  style={{
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 300,
                    color: "rgba(13,13,11,0.75)",
                    fontSize: "clamp(11px, 1.15vw, 15px)",
                    lineHeight: 1.45,
                  }}
                >
                  {card.description}
                </p>
                <a
                  href={card.href}
                  className="mt-5 rounded-full text-center transition-opacity duration-200 hover:opacity-80"
                  style={{
                    ...labelStyle,
                    color: "#F7931A",
                    background: "#0D0D0B",
                    fontSize: "clamp(12px, 1.1vw, 14px)",
                    padding: "10px 0",
                  }}
                >
                  {card.cta}
                </a>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Astronauta — anclado dentro de la sección para que no lo recorte el overflow */}
        <div
          className="absolute pointer-events-none select-none hidden sm:block"
          style={{
            bottom: "2rem",
            right: "2rem",
            width: "min(22vw, 260px)",
            height: "min(22vw, 260px)",
            zIndex: 3,
          }}
        >
          <Floating duration={7} y={14} rotate={6}>
            <Image
              src="/assets/home/astronauta.png"
              alt=""
              fill
              style={{ objectFit: "contain" }}
            />
          </Floating>
        </div>
      </section>

      {/* Ubicación */}
      <section
        id="ubicacion"
        className="relative flex flex-col justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, height: "100vh" }}
      >
        {/* Fondo: hexmap (puntos tipo mapa) */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{ zIndex: 0, opacity: 0.55 }}
        >
          <Image
            src="/assets/home/hexmap.jpg"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, #0D0D0B 0%, rgba(13,13,11,0.35) 15%, rgba(13,13,11,0.35) 80%, #0D0D0B 100%)",
          }}
        />

        <div className="relative w-full max-w-6xl" style={{ zIndex: 2 }}>
          <Reveal className="relative w-full" style={{ height: TITLE_H }}>
            <Image
              src={TITLE_IMAGES.costaSalguero}
              alt="Costa Salguero"
              fill
              style={{ objectFit: "contain", objectPosition: "left center" }}
            />
          </Reveal>

          <Reveal delay={0.1}>
            <p
              className="mt-3 max-w-2xl"
              style={{
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 300,
                color: "#A5A8B1",
                fontSize: "clamp(12px, 1.2vw, 15px)",
                lineHeight: 1.5,
              }}
            >
              {t.ubicacionP1}
            </p>

            <p
              className="mt-2 max-w-2xl"
              style={{
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 300,
                color: "#A5A8B1",
                fontSize: "clamp(12px, 1.2vw, 15px)",
                lineHeight: 1.5,
              }}
            >
              {t.ubicacionP2}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Costa+Salguero+Buenos+Aires+Argentina"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-full transition-colors duration-200 border-2 hover:bg-[#F7931A] hover:text-[#0D0D0B]"
              style={{
                ...labelStyle,
                color: "#F7931A",
                borderColor: "#F7931A",
                fontSize: "clamp(11px, 1vw, 13px)",
                padding: "10px 28px",
              }}
            >
              {t.ubicacionBtn}
            </a>
          </Reveal>

          <Reveal delay={0.25} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            <div
              className="rounded-2xl"
              style={{
                aspectRatio: "16 / 9",
                background: PHOTO_GRADIENTS[1],
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <div
              className="rounded-2xl overflow-hidden"
              style={{ aspectRatio: "16 / 9", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <iframe
                src="https://www.google.com/maps?q=Costa+Salguero,+Buenos+Aires,+Argentina&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(0.3) contrast(1.1)" }}
                loading="lazy"
                title={t.mapTitle}
              />
            </div>
          </Reveal>
        </div>

        {/* Ballena naranja — completa en pantalla (right negativo la dejaba por la mitad) */}
        <div
          className="absolute pointer-events-none select-none hidden sm:block"
          style={{
            top: "50%",
            right: "2rem",
            transform: "translateY(-50%)",
            width: "min(48vw, 640px)",
            height: "min(48vw, 640px)",
            zIndex: 1,
            opacity: 0.9,
          }}
        >
          <Floating duration={6} y={10} rotate={2}>
            <Image
              src="/assets/home/ballena-naranja.png"
              alt=""
              fill
              style={{ objectFit: "contain" }}
            />
          </Floating>
        </div>
      </section>

      {/* Footer compartido con /home/comunidad */}
      <Footer lang={lang} />

      <QaChatWidget />
    </main>
  );
}
