"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/home/Navbar";
import HeroVideo from "@/components/home/HeroVideo";
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

// Banner del hero: video servido desde el bucket público de Supabase (no en git).
const HERO_VIDEO_URL =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/home/hero.mp4";

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
    ticketsIncludes: "Incluye",
    ticketsBuy: "Comprar",
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
    ticketsIncludes: "Includes",
    ticketsBuy: "Buy",
  },
} as const;

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};


// Beneficios por tier (info del cliente, 16/7). Lista COMPLETA por card
// (acumulativa: Business incluye lo de General, Experience lo de ambos).
const TICKET_FEATURES = {
  es: {
    general: [
      "Acceso 1 o 2 días",
      "Escenarios",
      "Chill Area",
      "Dinner Points",
      "Hodleween Party (solo pase 2 días)",
    ],
    businessExtra: [
      "Área VIP",
      "Espacio preferencial Main Stage",
      "All inclusive",
      "Open bar",
      "Coffee Bar",
      "Merch bag",
      "Trezor Model T",
    ],
    experienceExtra: [
      "Open Executive · 29 oct",
      "Closing Day · 1 nov",
      "Trezor Model One",
    ],
  },
  en: {
    general: [
      "1 or 2-day access",
      "Stages",
      "Chill Area",
      "Dinner Points",
      "Hodleween Party (2-day pass only)",
    ],
    businessExtra: [
      "VIP Area",
      "Preferred Main Stage space",
      "All inclusive",
      "Open bar",
      "Coffee Bar",
      "Merch bag",
      "Trezor Model T",
    ],
    experienceExtra: [
      "Open Executive · Oct 29",
      "Closing Day · Nov 1",
      "Trezor Model One",
    ],
  },
} as const;

function ticketFeatures(tier: string, lang: "es" | "en"): readonly string[] {
  const f = TICKET_FEATURES[lang];
  if (tier === "General") return f.general;
  if (tier === "Business") return [...f.general, ...f.businessExtra];
  return [...f.general, ...f.businessExtra, ...f.experienceExtra];
}

// Paleta por tier según el manual (16/7): General naranja · Business plateado ·
// Experience grafito ("Batmóvil"). General va en pesos (AR$); los otros en USD.
const TICKETS = [
  {
    tier: "General",
    tagline: "HODL the Community",
    accent: "#171616", // sobre naranja, acento oscuro (identidad Bitcoin)
    dark: true,
    background:
      "linear-gradient(155deg, #FF7A38 0%, #FF4E01 42%, #C23A00 72%, #7A2400 100%)",
    prices: [
      { es: "1 día", en: "1 day", value: "AR$ 30.000" },
      { es: "2 días", en: "2 days", value: "AR$ 55.000" },
    ],
  },
  {
    tier: "Business",
    tagline: "HODL the Network",
    accent: "#FF4E01",
    dark: false,
    background:
      "linear-gradient(155deg, #f2f2f2 0%, #cfcfcf 30%, #8a8a8a 55%, #d8d8d8 75%, #a0a0a0 100%)",
    prices: [{ es: "", en: "", value: "US$ 250" }],
  },
  {
    tier: "Experience",
    tagline: "HODL Full LABITCONF",
    accent: "#C7CBD1", // acero sobre grafito
    dark: true,
    background:
      "linear-gradient(155deg, #3A3D42 0%, #24272C 45%, #2E3137 70%, #131417 100%)",
    prices: [{ es: "", en: "", value: "US$ 650" }],
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
  | { kind: "photo"; src: string }
  | { kind: "stat"; value: string; label: string }
  | { kind: "label"; title: string; subtitle: string };

// Fotos de galería servidas desde el bucket público de Supabase (no en git),
// mismo patrón que el video del hero. Sube el equipo por bucket hasta que
// exista el dashboard de carga.
const GALLERY_BASE =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/home/gallery";
const galleryPhoto = (n: number): { kind: "photo"; src: string } => ({
  kind: "photo",
  src: `${GALLERY_BASE}/gallery-${String(n).padStart(2, "0")}.jpg`,
});

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
      galleryPhoto(1),
      galleryPhoto(2),
      galleryPhoto(3),
    ],
  },
  {
    id: "s2",
    direction: "right",
    duration: 50,
    cards: [
      galleryPhoto(4),
      galleryPhoto(5),
      { kind: "stat", value: "+256", label: "Talks" },
      { kind: "stat", value: "+16", label: "Countries that attend" },
      galleryPhoto(6),
    ],
  },
  {
    id: "s3",
    direction: "left",
    duration: 46,
    cards: [
      galleryPhoto(7),
      { kind: "stat", value: "+27", label: "Media Partners" },
      galleryPhoto(8),
      { kind: "stat", value: "7", label: "Stages" },
      { kind: "stat", value: "+58", label: "Sponsors" },
    ],
  },
  {
    id: "s4",
    direction: "right",
    duration: 55,
    cards: [
      galleryPhoto(9),
      galleryPhoto(10),
      galleryPhoto(11),
      { kind: "stat", value: "5", label: "Partners & Collaborators" },
      { kind: "stat", value: "+420", label: "International Speakers" },
    ],
  },
];

function SpeakerCardView({ card }: { card: SpeakerCard }) {
  if (card.kind === "photo") {
    return (
      <div
        className="relative rounded-full shrink-0 overflow-hidden"
        style={{
          height: "clamp(100px, 24vw, 140px)",
          aspectRatio: "11 / 7",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Image
          src={card.src}
          alt=""
          fill
          sizes="(max-width: 640px) 160px, 220px"
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }

  if (card.kind === "stat") {
    return (
      <div
        className="rounded-full shrink-0 flex items-center gap-4 px-6 sm:px-9"
        style={{ height: "clamp(100px, 24vw, 140px)", border: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}
      >
        <span style={{ ...labelStyle, fontSize: "clamp(32px, 3.5vw, 44px)", color: "#E6EEF2" }}>
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
      className="rounded-full shrink-0 flex flex-col items-start justify-center px-6 sm:px-9"
      style={{ height: "clamp(100px, 24vw, 140px)", border: "1px solid rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}
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
      <span style={{ ...labelStyle, fontSize: "14px", color: "#E6EEF2", marginTop: "4px" }}>
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
      style={{ background: "#171616" }}
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

      {/* Hero — video banner full-bleed (1:1 screen) sobre negro puro */}
      <section
        className="relative flex flex-col items-center justify-center sm:justify-end overflow-hidden px-6 gap-10 sm:gap-0 pt-28 pb-14 sm:pt-0 sm:pb-[10vh] sm:h-screen"
        style={{ zIndex: 4, background: "#000" }}
      >
        {/* Video: en mobile bloque 16:9 al ancho (sin negro sobrante); en
            desktop full-bleed que llena el hero, letterbox fundido con el negro */}
        <div
          className="relative w-full aspect-video sm:absolute sm:inset-0 sm:aspect-auto"
          style={{ zIndex: 0 }}
        >
          <HeroVideo
            src={HERO_VIDEO_URL}
            poster="/assets/home/hero-poster.jpg"
          />
        </div>

        <Reveal delay={0.15} className="relative" style={{ zIndex: 1 }}>
          {/* Botón más grande (~10%) y animado con pulso idle sutil (reunión 16/7) */}
          <motion.a
            href="#tickets"
            className="inline-block rounded-full border-2"
            style={{
              ...labelStyle,
              color: "#171616",
              background: "#ABF760",
              borderColor: "#ABF760",
              fontSize: "clamp(13px, 1.2vw, 17px)",
              padding: "13px 35px",
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
          >
            {t.heroButton}
          </motion.a>
        </Reveal>
      </section>

      {/* Presentación */}
      <section
        id="presentacion"
        className="relative flex flex-col justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, minHeight: "100vh" }}
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
            // Arranca en #000 (mismo negro del hero) y estira la transición
            // negro→gris al 30% para que la unión con el banner no sea brusca.
            background:
              "linear-gradient(to bottom, #000 0%, rgba(13,13,11,0.35) 30%, rgba(13,13,11,0.35) 80%, #171616 100%)",
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
                color: "#E6EEF2",
                fontSize: "clamp(20px, 3.2vw, 34px)",
                zIndex: 2,
              }}
            >
              Latin American <span style={{ color: "#FF4E01" }}>Bitcoin</span> &{" "}
              <span style={{ color: "#FF4E01" }}>Blockchain</span> Conference
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
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.5) 15%, rgba(13,13,11,0.5) 85%, #171616 100%)",
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
              <div key={lane.id} className="relative w-full overflow-hidden" style={{ height: "clamp(100px, 24vw, 140px)" }}>
                <motion.div
                  className="flex items-center absolute top-0 left-0"
                  style={{ gap: "24px", width: "max-content" }}
                  animate={{ x: lane.direction === "left" ? ["0%", `-${100 / REPEATS}%`] : [`-${100 / REPEATS}%`, "0%"] }}
                  transition={{ duration: lane.duration, repeat: Infinity, ease: "linear" }}
                >
                  {repeated.map((card, i) => (
                    <SpeakerCardView key={`${lane.id}-${i}`} card={card} />
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
        className="relative flex flex-col justify-center px-6 sm:px-10 py-28 sm:py-32 overflow-hidden"
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
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.4) 15%, rgba(13,13,11,0.4) 80%, #171616 100%)",
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
            className="mt-10 sm:mt-16 mx-auto max-w-sm sm:max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 items-stretch"
          >
            {TICKETS.map((ticket) => {
              const light = ticket.dark === false; // Business: fondo claro → texto oscuro
              const cText = light ? "#171616" : "#E6EEF2";
              const cMuted = light ? "rgba(23,22,22,0.6)" : "#A5A8B1";
              const cDivider = light ? "rgba(23,22,22,0.15)" : "rgba(255,255,255,0.15)";
              const features = ticketFeatures(ticket.tier, lang);
              return (
                <div
                  key={ticket.tier}
                  className="relative rounded-2xl w-full flex flex-col transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.035] hover:z-10"
                  style={{
                    background: ticket.background,
                    border: "1px solid rgba(255,255,255,0.15)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                    padding: "24px",
                    willChange: "transform",
                  }}
                >
                  {/* Tier + tagline */}
                  <div
                    style={{
                      ...labelStyle,
                      color: cText,
                      fontSize: "clamp(18px, 1.8vw, 22px)",
                    }}
                  >
                    {ticket.tier}
                  </div>
                  <div
                    style={{
                      ...labelStyle,
                      color: ticket.accent,
                      fontSize: "clamp(10px, 1vw, 12px)",
                      marginTop: "4px",
                    }}
                  >
                    {ticket.tagline}
                  </div>

                  {/* Precio(s) */}
                  <div style={{ marginTop: "18px" }}>
                    {ticket.prices.map((p, pi) => (
                      <div
                        key={pi}
                        className="flex items-baseline gap-2"
                        style={{ marginTop: pi === 0 ? 0 : "6px" }}
                      >
                        {p[lang] && (
                          <span
                            style={{
                              fontFamily: "var(--font-neue-machina), sans-serif",
                              fontWeight: 500,
                              fontSize: "13px",
                              color: cText,
                              opacity: 0.85,
                              minWidth: "52px",
                            }}
                          >
                            {p[lang]}
                          </span>
                        )}
                        <span
                          style={{
                            ...labelStyle,
                            color: cText,
                            fontSize: ticket.prices.length > 1 ? "clamp(18px, 2vw, 24px)" : "clamp(26px, 3.2vw, 36px)",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {p.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ height: "1px", background: cDivider, margin: "20px 0 16px" }} />

                  {/* Beneficios (lista completa) */}
                  <div
                    style={{
                      ...labelStyle,
                      color: cMuted,
                      fontSize: "9px",
                      letterSpacing: "0.1em",
                      marginBottom: "12px",
                    }}
                  >
                    {t.ticketsIncludes}
                  </div>
                  <ul className="flex flex-col gap-3">
                    {features.map((feat, fi) => (
                      <li key={fi} className="flex items-start gap-2.5">
                        <span
                          className="shrink-0"
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "9999px",
                            background: ticket.accent,
                            marginTop: "7px",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "var(--font-neue-machina), sans-serif",
                            fontWeight: 500,
                            fontSize: "clamp(13px, 1.05vw, 15px)",
                            lineHeight: 1.4,
                            color: cText,
                          }}
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA — link de compra pendiente (apunta a #) */}
                  <a
                    href="#"
                    className="mt-auto pt-6 block"
                  >
                    <span
                      className="block w-full text-center rounded-full transition-opacity duration-200 hover:opacity-80"
                      style={{
                        ...labelStyle,
                        fontSize: "clamp(12px, 1.1vw, 14px)",
                        padding: "12px 20px",
                        background: light ? "#171616" : "#ABF760",
                        color: light ? "#E6EEF2" : "#171616",
                      }}
                    >
                      {t.ticketsBuy}
                    </span>
                  </a>
                </div>
              );
            })}
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
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.4) 15%, rgba(13,13,11,0.4) 80%, #171616 100%)",
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

          <div className="mt-10 mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 max-w-sm sm:max-w-4xl">
            {seParteCards.map((card, i) => (
              <Reveal
                key={card.title}
                delay={0.1 + i * 0.12}
                className="rounded-2xl flex flex-col"
                style={{
                  background: "#FF4E01",
                  padding: "22px 22px",
                }}
              >
                <h3
                  style={{
                    ...labelStyle,
                    color: "#171616",
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
                    color: "#FF4E01",
                    background: "#171616",
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
        style={{ zIndex: 3, minHeight: "100vh" }}
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
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.35) 15%, rgba(13,13,11,0.35) 80%, #171616 100%)",
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
              className="mt-4 inline-block rounded-full transition-colors duration-200 border-2 hover:bg-[#ABF760] hover:text-[#171616]"
              style={{
                ...labelStyle,
                color: "#ABF760",
                borderColor: "#ABF760",
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
                background: "linear-gradient(135deg, #1c1c1c 0%, #FF4E01 100%)",
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
