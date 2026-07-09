"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { label: "¿Por qué hodleás?", href: "#hodleas" },
  { label: "Comunidad", href: "#comunidad" },
  { label: "Sé parte", href: "#se-parte" },
];

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

const SE_PARTE_CARDS = [
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
  {
    title: "Side Event",
    description: "¿Vas a organizar un evento durante la semana de LABITCONF? Completá el formulario y ayudanos a difundirlo entre quienes asisten a la conferencia.",
    cta: "Agendá",
    href: "#",
  },
] as const;

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
      <header
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 sm:px-10 py-6"
        style={{
          zIndex: 50,
          background:
            "linear-gradient(to bottom, rgba(13,13,11,0.85) 0%, rgba(13,13,11,0) 100%)",
        }}
      >
        <div className="flex items-center gap-8">
          <span
            style={{
              ...labelStyle,
              color: "#FCFCFC",
              fontSize: "clamp(14px, 1.4vw, 18px)",
            }}
          >
            LABITCONF.
          </span>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors duration-200 hover:opacity-70"
                style={{
                  ...labelStyle,
                  color: "#9ACE6A",
                  fontSize: "clamp(11px, 0.9vw, 13px)",
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <a
          href="#tickets"
          className="transition-colors duration-200 hover:opacity-70"
          style={{
            ...labelStyle,
            color: "#9ACE6A",
            fontSize: "clamp(12px, 1vw, 14px)",
          }}
        >
          Tickets
        </a>
      </header>

      {/* Hero central */}
      <section
        className="relative flex flex-col items-center justify-center px-6"
        style={{ zIndex: 3, minHeight: "100vh" }}
      >
        <div className="w-full flex justify-center">
          <Image
            src="/assets/home/hodl-3d.png"
            alt="LABITCONF 26 — HODL, Costa Salguero, BsAs, OCT 30-31"
            width={1600}
            height={528}
            priority
            className="w-[92vw] sm:w-[70vw] md:w-[52vw]"
            style={{ objectFit: "contain", height: "auto" }}
          />
        </div>

        <a
          href="#tickets"
          className="mt-8 rounded-full transition-colors duration-200 border-2"
          style={{
            ...labelStyle,
            color: "#0D0D0B",
            background: "#9ACE6A",
            borderColor: "#9ACE6A",
            fontSize: "clamp(12px, 1.1vw, 15px)",
            padding: "12px 32px",
          }}
        >
          Comprar Ticket
        </a>

        <span
          className="mt-10 animate-bounce"
          style={{
            fontFamily: "var(--font-neue-machina), sans-serif",
            fontWeight: 300,
            color: "#A5A8B1",
            fontSize: "clamp(11px, 0.9vw, 13px)",
            letterSpacing: "0.04em",
          }}
        >
          ↓ scroll para descubrir más
        </span>
      </section>

      {/* Presentación */}
      <section
        id="presentacion"
        className="relative flex flex-col justify-center px-6 sm:px-10"
        style={{ zIndex: 3, minHeight: "100vh" }}
      >
        <div className="relative w-full max-w-6xl">
          {/* Textura pixel detrás del título */}
          <div
            className="absolute pointer-events-none select-none"
            style={{
              top: "-4rem",
              left: "-2rem",
              right: "-2rem",
              height: "16rem",
              zIndex: 0,
            }}
          >
            <Image
              src="/assets/home/labitconf-pixel.png"
              alt=""
              fill
              style={{ objectFit: "contain", objectPosition: "left center", opacity: 0.5 }}
            />
          </div>

          {/* Píldora BTC */}
          <div
            className="absolute pointer-events-none select-none hidden sm:block"
            style={{ top: "-1rem", right: "0", width: "min(22vw, 220px)", height: "min(22vw, 220px)", zIndex: 1 }}
          >
            <Image
              src="/assets/home/pildora.png"
              alt=""
              fill
              style={{ objectFit: "contain" }}
            />
          </div>

          <h2
            className="relative"
            style={{
              ...labelStyle,
              color: "#FCFCFC",
              fontSize: "clamp(48px, 9vw, 104px)",
              lineHeight: 1,
              zIndex: 2,
            }}
          >
            LABITCONF
          </h2>

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
            LABITCONF vuelve a Buenos Aires para su edición número 13,
            conectando a los líderes, constructores y comunidades que están
            dando forma al futuro de América Latina.
          </p>

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
            Porque las mejores historias son las que siguen construyéndose.
          </p>
        </div>
      </section>

      {/* Tickets */}
      <section
        id="tickets"
        className="relative flex flex-col justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, minHeight: "100vh" }}
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
          <div className="w-full max-w-6xl">
            <h2
              style={{
                ...labelStyle,
                color: "#9ACE6A",
                fontSize: "clamp(48px, 9vw, 104px)",
                lineHeight: 1,
              }}
            >
              Tickets
            </h2>
          </div>

          <div className="mt-16 mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-10 justify-items-center">
            {TICKETS.map((ticket) => (
              <div
                key={ticket.tier}
                className="relative rounded-2xl w-full max-w-[260px]"
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
          </div>

          {/* Honeybadger */}
          <div
            className="absolute pointer-events-none select-none hidden sm:block"
            style={{
              bottom: "-2rem",
              left: "-1rem",
              width: "min(16vw, 170px)",
              height: "min(16vw, 170px)",
              zIndex: 3,
            }}
          >
            <Image
              src="/assets/home/honeybadger.png"
              alt=""
              fill
              style={{ objectFit: "contain" }}
            />
          </div>

          <span
            className="relative mt-16 sm:mt-24 block text-center"
            style={{
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontWeight: 300,
              color: "#A5A8B1",
              fontSize: "clamp(11px, 0.9vw, 13px)",
              letterSpacing: "0.04em",
            }}
          >
            ↓ scroll para descubrir más
          </span>
        </div>
      </section>

      {/* Speakers */}
      <section
        id="speakers"
        className="relative flex flex-col justify-center overflow-hidden"
        style={{ zIndex: 3, minHeight: "100vh" }}
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
            const doubled = [...lane.cards, ...lane.cards];
            return (
              <div key={lane.id} className="relative w-full overflow-hidden" style={{ height: "140px" }}>
                <motion.div
                  className="flex items-center absolute top-0 left-0"
                  style={{ gap: "24px", width: "max-content" }}
                  animate={{ x: lane.direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
                  transition={{ duration: lane.duration, repeat: Infinity, ease: "linear" }}
                >
                  {doubled.map((card, i) => (
                    <SpeakerCardView key={`${lane.id}-${i}`} card={card} gradientIndex={i} />
                  ))}
                </motion.div>
              </div>
            );
          })}
        </div>

        <span
          className="relative mt-16 block text-center px-6"
          style={{
            fontFamily: "var(--font-neue-machina), sans-serif",
            fontWeight: 300,
            color: "#A5A8B1",
            fontSize: "clamp(11px, 0.9vw, 13px)",
            letterSpacing: "0.04em",
            zIndex: 2,
          }}
        >
          ↓ scroll para descubrir más
        </span>
      </section>

      {/* Sé parte */}
      <section
        id="se-parte"
        className="relative flex flex-col justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, minHeight: "100vh" }}
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
          <h2
            style={{
              ...labelStyle,
              color: "#F7931A",
              fontSize: "clamp(48px, 9vw, 104px)",
              lineHeight: 1,
            }}
          >
            Sé parte
          </h2>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
            {SE_PARTE_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl flex flex-col"
                style={{
                  background: "#F7931A",
                  padding: "24px",
                }}
              >
                <h3
                  style={{
                    ...labelStyle,
                    color: "#0D0D0B",
                    fontSize: "clamp(16px, 1.8vw, 22px)",
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
                    fontSize: "clamp(12px, 1.1vw, 14px)",
                    lineHeight: 1.5,
                  }}
                >
                  {card.description}
                </p>
                <a
                  href={card.href}
                  className="mt-6 rounded-full text-center transition-opacity duration-200 hover:opacity-80"
                  style={{
                    ...labelStyle,
                    color: "#F7931A",
                    background: "#0D0D0B",
                    fontSize: "clamp(11px, 1vw, 13px)",
                    padding: "10px 0",
                  }}
                >
                  {card.cta}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Astronauta */}
        <div
          className="absolute pointer-events-none select-none hidden sm:block"
          style={{
            bottom: "-2rem",
            right: "-1rem",
            width: "min(22vw, 260px)",
            height: "min(22vw, 260px)",
            zIndex: 3,
          }}
        >
          <Image
            src="/assets/home/astronauta.png"
            alt=""
            fill
            style={{ objectFit: "contain" }}
          />
        </div>

        <span
          className="relative mt-16 block text-center"
          style={{
            fontFamily: "var(--font-neue-machina), sans-serif",
            fontWeight: 300,
            color: "#A5A8B1",
            fontSize: "clamp(11px, 0.9vw, 13px)",
            letterSpacing: "0.04em",
            zIndex: 2,
          }}
        >
          ↓ scroll para descubrir más
        </span>
      </section>

      {/* Ubicación */}
      <section
        id="ubicacion"
        className="relative flex flex-col justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, minHeight: "100vh" }}
      >
        <div className="relative w-full max-w-6xl" style={{ zIndex: 2 }}>
          <h2
            style={{
              ...labelStyle,
              color: "#F7931A",
              fontSize: "clamp(40px, 7vw, 84px)",
              lineHeight: 1,
            }}
          >
            Costa Salguero
          </h2>

          <p
            className="mt-6 max-w-2xl"
            style={{
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontWeight: 300,
              color: "#A5A8B1",
              fontSize: "clamp(14px, 1.4vw, 17px)",
              lineHeight: 1.6,
            }}
          >
            Centro Costa Salguero es uno de los espacios más reconocidos para
            eventos en la Ciudad de Buenos Aires.
          </p>

          <p
            className="mt-4 max-w-2xl"
            style={{
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontWeight: 300,
              color: "#A5A8B1",
              fontSize: "clamp(14px, 1.4vw, 17px)",
              lineHeight: 1.6,
            }}
          >
            Cada año recibe conferencias, ferias y exposiciones de gran
            escala, consolidándose como un punto clave en el mapa cultural y
            tecnológico de la ciudad. Será la sede oficial de LABITCONF 2026
            los días 30 y 31 de octubre.
          </p>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Costa+Salguero+Buenos+Aires+Argentina"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full transition-colors duration-200 border-2 hover:bg-[#F7931A] hover:text-[#0D0D0B]"
            style={{
              ...labelStyle,
              color: "#F7931A",
              borderColor: "#F7931A",
              fontSize: "clamp(12px, 1.1vw, 14px)",
              padding: "12px 32px",
            }}
          >
            Abrir en Google Maps
          </a>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div
              className="rounded-2xl"
              style={{
                aspectRatio: "4 / 3",
                background: PHOTO_GRADIENTS[1],
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <div
              className="rounded-2xl overflow-hidden"
              style={{ aspectRatio: "4 / 3", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <iframe
                src="https://www.google.com/maps?q=Costa+Salguero,+Buenos+Aires,+Argentina&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(0.3) contrast(1.1)" }}
                loading="lazy"
                title="Ubicación Costa Salguero"
              />
            </div>
          </div>
        </div>

        {/* Ballena naranja */}
        <div
          className="absolute pointer-events-none select-none hidden sm:block"
          style={{
            top: "50%",
            right: "-4rem",
            transform: "translateY(-50%)",
            width: "min(24vw, 320px)",
            height: "min(24vw, 320px)",
            zIndex: 1,
            opacity: 0.9,
          }}
        >
          <Image
            src="/assets/home/ballena-naranja.png"
            alt=""
            fill
            style={{ objectFit: "contain" }}
          />
        </div>

        <span
          className="relative mt-16 block text-center"
          style={{
            fontFamily: "var(--font-neue-machina), sans-serif",
            fontWeight: 300,
            color: "#A5A8B1",
            fontSize: "clamp(11px, 0.9vw, 13px)",
            letterSpacing: "0.04em",
            zIndex: 2,
          }}
        >
          ↓ scroll para descubrir más
        </span>
      </section>

      {/* Footer */}
      <footer
        id="contacto"
        className="relative overflow-hidden"
        style={{ zIndex: 3, minHeight: "100vh" }}
      >
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            zIndex: 0,
            opacity: 0.35,
            filter: "sepia(1) saturate(4) hue-rotate(-20deg) brightness(0.8)",
          }}
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
              "linear-gradient(to bottom, #0D0D0B 0%, rgba(13,13,11,0.3) 20%, rgba(13,13,11,0.3) 70%, #0D0D0B 100%)",
          }}
        />

        <div
          className="relative flex items-center justify-center"
          style={{ zIndex: 2, minHeight: "56vh" }}
        >
          <div style={{ position: "relative", width: "min(60vw, 560px)", aspectRatio: "1 / 1" }}>
            <Image
              src="/assets/home/ballena-naranja.png"
              alt=""
              fill
              style={{ objectFit: "contain" }}
            />
            <span
              className="absolute left-1/2 top-1/2"
              style={{
                ...labelStyle,
                transform: "translate(-50%, -50%)",
                color: "rgba(252,252,252,0.85)",
                fontSize: "clamp(20px, 2.4vw, 30px)",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              LABITCONF.
            </span>
          </div>
        </div>

        <div
          className="relative px-6 sm:px-10 pb-10"
          style={{ zIndex: 2 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-10 max-w-6xl">
            <div>
              <div style={{ ...labelStyle, color: "#FCFCFC", fontSize: "clamp(14px, 1.4vw, 18px)" }}>
                LABITCONF.
              </div>
              <div
                style={{
                  ...labelStyle,
                  fontSize: "clamp(40px, 6vw, 64px)",
                  lineHeight: 1,
                  marginTop: "6px",
                  background:
                    "linear-gradient(90deg, #F7931A 0%, #F2A17A 40%, #E07AA0 70%, #B06BE0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                HODL
              </div>
              <p
                className="mt-4 max-w-xs"
                style={{
                  fontFamily: "var(--font-neue-machina), sans-serif",
                  fontWeight: 300,
                  color: "#A5A8B1",
                  fontSize: "clamp(12px, 1.1vw, 14px)",
                  lineHeight: 1.5,
                }}
              >
                Desde 2013 la conferencia de Bitcoin más antigua del mundo y
                el evento número uno de la industria blockchain en América
                Latina.
              </p>

              <div className="flex items-center gap-3 mt-6">
                {[
                  {
                    label: "Instagram",
                    href: "#",
                    path: "M12 2.2c2.7 0 3 .01 4.1.06 1 .05 1.6.2 1.9.34.5.2.8.4 1.2.8.4.4.6.7.8 1.2.14.4.3 1 .34 1.9.05 1.1.06 1.4.06 4.1s-.01 3-.06 4.1c-.05 1-.2 1.6-.34 1.9-.2.5-.4.8-.8 1.2-.4.4-.7.6-1.2.8-.4.14-1 .3-1.9.34-1.1.05-1.4.06-4.1.06s-3-.01-4.1-.06c-1-.05-1.6-.2-1.9-.34-.5-.2-.8-.4-1.2-.8-.4-.4-.6-.7-.8-1.2-.14-.4-.3-1-.34-1.9C2.21 15 2.2 14.7 2.2 12s.01-3 .06-4.1c.05-1 .2-1.6.34-1.9.2-.5.4-.8.8-1.2.4-.4.7-.6 1.2-.8.4-.14 1-.3 1.9-.34C7.5 2.21 7.8 2.2 12 2.2zM12 0C9.28 0 8.94.01 7.87.06c-1.07.05-1.8.22-2.44.47-.66.26-1.22.6-1.78 1.16C3.09 2.25 2.75 2.8 2.5 3.46c-.25.64-.42 1.37-.47 2.44C1.98 6.94 1.97 7.28 1.97 10v4c0 2.72.01 3.06.06 4.13.05 1.07.22 1.8.47 2.44.26.66.6 1.22 1.16 1.78.56.56 1.12.9 1.78 1.16.64.25 1.37.42 2.44.47C8.94 23.99 9.28 24 12 24s3.06-.01 4.13-.06c1.07-.05 1.8-.22 2.44-.47.66-.26 1.22-.6 1.78-1.16.56-.56.9-1.12 1.16-1.78.25-.64.42-1.37.47-2.44.05-1.07.06-1.41.06-4.13v-4c0-2.72-.01-3.06-.06-4.13-.05-1.07-.22-1.8-.47-2.44-.26-.66-.6-1.22-1.16-1.78C21.75 1.09 21.2.75 20.54.5c-.64-.25-1.37-.42-2.44-.47C17.06.01 16.72 0 14 0z M12 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 12 8a4 4 0 0 1 0 8zM19.85 4.15a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z",
                  },
                  {
                    label: "X",
                    href: "#",
                    path: "M18.9 1.9h3.7l-8 9.2 9.4 12.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.9h7.6l5.2 7 6.1-7zm-1.3 19.3h2L6.5 4.1H4.4l13.2 17.1z",
                  },
                  {
                    label: "LinkedIn",
                    href: "#",
                    path: "M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.24 8.24h4.48V24H.24V8.24zM8.4 8.24h4.3v2.15h.06c.6-1.13 2.05-2.32 4.22-2.32 4.52 0 5.35 2.97 5.35 6.84V24h-4.48v-7.29c0-1.74-.03-3.98-2.43-3.98-2.43 0-2.8 1.9-2.8 3.86V24H8.4V8.24z",
                  },
                  {
                    label: "Email",
                    href: "#",
                    path: "M1.5 4.5h21a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-21A1.5 1.5 0 0 1 0 18V6a1.5 1.5 0 0 1 1.5-1.5zm.7 1.9 9.3 6.7a1 1 0 0 0 1 0l9.3-6.7H2.2zM2 8.4V17h20V8.4l-9.2 6.6a2.5 2.5 0 0 1-2.6 0L2 8.4z",
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex items-center justify-center rounded-lg transition-opacity duration-200 hover:opacity-80"
                    style={{ width: "38px", height: "38px", background: "#F7931A" }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#0D0D0B">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div className="flex gap-16">
              <div>
                <div style={{ ...labelStyle, color: "#FCFCFC", fontSize: "clamp(12px, 1.1vw, 14px)" }}>
                  Eventos 2026
                </div>
                <div
                  className="mt-3"
                  style={{
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 300,
                    color: "#A5A8B1",
                    fontSize: "clamp(12px, 1.1vw, 14px)",
                    lineHeight: 2,
                  }}
                >
                  Buenos Aires, Argentina
                </div>
              </div>

              <div>
                <div style={{ ...labelStyle, color: "#FCFCFC", fontSize: "clamp(12px, 1.1vw, 14px)" }}>
                  Enlaces Rápidos
                </div>
                <div
                  className="mt-3 flex flex-col gap-2"
                  style={{
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 300,
                    color: "#A5A8B1",
                    fontSize: "clamp(12px, 1.1vw, 14px)",
                  }}
                >
                  <a href="#presentacion" className="hover:opacity-70 transition-opacity">
                    Sobre LABITCONF
                  </a>
                  <a href="#tickets" className="hover:opacity-70 transition-opacity">
                    Tickets
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div
            className="mt-12 pt-6 max-w-6xl flex flex-col sm:flex-row justify-between gap-2"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontWeight: 300,
              color: "#6b6e73",
              fontSize: "11px",
            }}
          >
            <span>© 2026 LABITCONF — Latin America Bitcoin & Blockchain Conference</span>
            <span>Buenos Aires, Argentina</span>
          </div>
        </div>
      </footer>

      {/* Botón flotante Q&A */}
      <a
        href="#qa"
        className="fixed flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-105"
        style={{
          zIndex: 5,
          bottom: "28px",
          right: "28px",
          width: "56px",
          height: "56px",
          background: "#9ACE6A",
          color: "#0D0D0B",
          fontFamily: "var(--font-neue-machina), sans-serif",
          fontWeight: 900,
          fontSize: "12px",
        }}
      >
        Q&A
      </a>
    </main>
  );
}
