"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/home/Navbar";
import HeroVideo from "@/components/home/HeroVideo";
import QaChatWidget from "@/components/home/QaChatWidget";
import Footer from "@/components/home/Footer";
import Reveal from "@/components/home/Reveal";
import Floating from "@/components/home/Floating";
import { useHeadlineWidth } from "@/components/home/useHeadlineWidth";
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
// Distancia uniforme entre el título de sección y el contenido que sigue
const TITLE_GAP = "mt-10 sm:mt-14";
// Tamaño uniforme de cuerpo de texto (párrafos) entre secciones
const BODY_FS = "clamp(13px, 1.2vw, 16px)";
// Tamaño uniforme de los CTA secundarios (tickets, sé parte, ubicación —
// el botón hero es el único CTA primario y mantiene su tamaño mayor a propósito)
const BUTTON_FS = "clamp(12px, 1.1vw, 14px)";

// Banner del hero: video servido desde el bucket público de Supabase (no en git).
const HERO_VIDEO_URL =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/home/hero.mp4";
// Foto de Costa Salguero (sección Ubicación): mismo patrón, bucket público de Supabase.
const COSTA_SALGUERO_PHOTO_URL =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/home/costa-salguero.jpg";

const T = {
  es: {
    heroButton: "Comprar Ticket",
    heroTagline: "Latin American Bitcoin & Blockchain Conference",
    presentacionParagraphs: [
      "LABITCONF vuelve a Buenos Aires para celebrar su 14ª edición.",
      "El evento #1 de América Latina que reúne a las personas, ideas y proyectos que están redefiniendo el dinero, la tecnología y la economía a través de Bitcoin, Blockchain e Inteligencia Artificial.",
      "Más de 300 referentes internacionales, 200 charlas, experiencias inmersivas y dos días de networking con quienes están construyendo la próxima década.",
      "HODL no es esperar. Es tener la convicción de construir el futuro.",
    ],
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
    heroTagline: "Latin American Bitcoin & Blockchain Conference",
    presentacionParagraphs: [
      "LABITCONF returns to Buenos Aires to celebrate its 14th edition.",
      "Latin America's #1 event, bringing together the people, ideas and projects redefining money, technology and the economy through Bitcoin, Blockchain and Artificial Intelligence.",
      "300+ international speakers, 200 talks, immersive experiences and two days of networking with the people building the next decade.",
      "HODL isn't waiting. It's having the conviction to build the future.",
    ],
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


// Beneficios por tier (info del cliente, 21/7). Lista COMPLETA por card
// (acumulativa: Business incluye lo de General, Experience lo de ambos).
const TICKET_FEATURES = {
  es: {
    general: [
      "6 escenarios",
      "Sector Expositores",
      "Área de Descanso",
      "Área de Comidas",
      "Shows durante el evento",
      "Fiesta de Disfraces HODLWEEN (31 de Octubre)",
    ],
    businessExtra: [
      "Un Hardware Wallet de Regalo",
      "Escenario Exclusivo B2B",
      "Área Networking VIP",
      "Coffee Station",
      "Almuerzo Incluido",
    ],
    experienceExtra: [
      "Evento B2B Networking (29 de Octubre)",
      "Show Apertura (29 de Octubre)",
      "Speaker's Networking & Chill Out Full Day (1 de Noviembre)",
      "Exclusive HODL Merch",
    ],
  },
  en: {
    general: [
      "6 stages",
      "Exhibitors Area",
      "Rest Area",
      "Food Area",
      "Shows during the event",
      "HODLWEEN Costume Party (October 31)",
    ],
    businessExtra: [
      "Free Hardware Wallet",
      "Exclusive B2B Stage",
      "VIP Networking Area",
      "Coffee Station",
      "Lunch Included",
    ],
    experienceExtra: [
      "B2B Networking Event (October 29)",
      "Opening Show (October 29)",
      "Speaker's Networking & Chill Out Full Day (November 1)",
      "Exclusive HODL Merch",
    ],
  },
} as const;

function ticketFeatures(
  tier: string,
  lang: "es" | "en"
): readonly { text: string; extra: boolean }[] {
  const f = TICKET_FEATURES[lang];
  const base = f.general.map((text) => ({ text, extra: false }));
  const businessExtra = f.businessExtra.map((text) => ({ text, extra: true }));
  const experienceExtra = f.experienceExtra.map((text) => ({ text, extra: true }));
  if (tier === "General") return base;
  if (tier === "Business") return [...base, ...businessExtra];
  return [...base, ...businessExtra, ...experienceExtra];
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
    prices: [{ es: "Early Bird", en: "Early Bird", value: "AR$ 40.000" }],
  },
  {
    tier: "Business",
    tagline: "HODL the Network",
    accent: "#FF4E01",
    dark: false,
    background:
      "linear-gradient(155deg, #f2f2f2 0%, #cfcfcf 30%, #8a8a8a 55%, #d8d8d8 75%, #a0a0a0 100%)",
    prices: [{ es: "Early Bird", en: "Early Bird", value: "US$ 150" }],
  },
  {
    tier: "Experience",
    tagline: "HODL Full LABITCONF",
    accent: "#C7CBD1", // acero sobre grafito
    dark: true,
    background:
      "linear-gradient(155deg, #3A3D42 0%, #24272C 45%, #2E3137 70%, #131417 100%)",
    prices: [{ es: "Early Bird", en: "Early Bird", value: "US$ 450" }],
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
      href: "https://app-labitconf.github.io/LABITCONF-speakers/form/",
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
      href: "https://app-labitconf.github.io/LABITCONF-speakers/form/",
    },
  ],
} as const;

type SpeakerCard =
  | { kind: "photo"; src: string }
  | { kind: "stat"; value: string; label: { es: string; en: string } }
  | { kind: "label"; title: { es: string; en: string }; subtitle: string };

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
      { kind: "label", title: { es: "Asistentes", en: "Attendees" }, subtitle: "LABITCONF '24" },
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
      { kind: "stat", value: "+256", label: { es: "Charlas", en: "Talks" } },
      { kind: "stat", value: "+16", label: { es: "Países participantes", en: "Countries that attend" } },
      galleryPhoto(6),
    ],
  },
  {
    id: "s3",
    direction: "left",
    duration: 46,
    cards: [
      galleryPhoto(7),
      { kind: "stat", value: "+27", label: { es: "Medios Aliados", en: "Media Partners" } },
      galleryPhoto(8),
      { kind: "stat", value: "7", label: { es: "Escenarios", en: "Stages" } },
      { kind: "stat", value: "+58", label: { es: "Sponsors", en: "Sponsors" } },
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
      { kind: "stat", value: "5", label: { es: "Partners y Colaboradores", en: "Partners & Collaborators" } },
      { kind: "stat", value: "+420", label: { es: "Speakers Internacionales", en: "International Speakers" } },
    ],
  },
];

function SpeakerCardView({ card, lang }: { card: SpeakerCard; lang: "es" | "en" }) {
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
        style={{
          height: "clamp(100px, 24vw, 140px)",
          background: "#2B2B2B",
          border: "1px solid rgba(255,255,255,0.2)",
          whiteSpace: "nowrap",
        }}
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
          {card.label[lang]}
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-full shrink-0 flex flex-col items-start justify-center px-6 sm:px-9"
      style={{
        height: "clamp(100px, 24vw, 140px)",
        background: "#2B2B2B",
        border: "1px solid rgba(255,255,255,0.2)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-neue-machina), sans-serif",
          fontWeight: 300,
          fontSize: "12px",
          color: "#A5A8B1",
        }}
      >
        {card.title[lang]}
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
  const { width: headlineWidth, probe: headlineProbe } = useHeadlineWidth();

  // Ancho del párrafo de Ubicación anclado al ancho real renderizado del
  // título "Costa Salguero" (imagen), para justificar el texto hasta esa marca.
  const costaSalgueroRef = useRef<HTMLDivElement>(null);
  const costaSalgueroAspect = useRef<number | null>(null);
  const [costaSalgueroWidth, setCostaSalgueroWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    function measure() {
      if (!costaSalgueroRef.current || !costaSalgueroAspect.current) return;
      setCostaSalgueroWidth(costaSalgueroRef.current.getBoundingClientRect().height * costaSalgueroAspect.current);
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#171616" }}
    >
      {headlineProbe}

      {/* Navbar */}
      <Navbar />

      {/* Hero — video banner full-bleed (1:1 screen) sobre negro puro */}
      <section
        className="relative flex flex-col items-center justify-center sm:justify-end overflow-hidden px-6 gap-10 sm:gap-0 pt-28 pb-14 sm:pt-0 sm:pb-[10vh] sm:h-screen"
        style={{ zIndex: 4, background: "#000" }}
      >
        {/* Video: en mobile banner full-bleed que rompe el px-6 de la sección
            (bloque 4:5 al ancho completo de pantalla, sin negro sobrante ni
            achicarse por el padding); en desktop full-bleed que llena el
            hero, letterbox fundido con el negro */}
        <div
          className="relative -mx-6 w-[calc(100%+3rem)] aspect-[4/5] sm:absolute sm:inset-0 sm:mx-0 sm:w-full sm:aspect-auto"
          style={{ zIndex: 0 }}
        >
          <HeroVideo
            src={HERO_VIDEO_URL}
            poster="/assets/home/hero-poster.jpg"
          />
        </div>

        <Reveal delay={0.15} className="relative flex flex-col items-center gap-5" style={{ zIndex: 1 }}>
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

          <p
            style={{
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontWeight: 300,
              color: "#E6EEF2",
              fontSize: "clamp(13px, 1.3vw, 16px)",
            }}
          >
            {t.heroTagline}
          </p>
        </Reveal>
      </section>

      {/* Presentación */}
      <section
        id="presentacion"
        className="relative flex flex-col justify-center px-6 sm:px-10 py-20 sm:py-0 sm:min-h-screen overflow-hidden"
        style={{ zIndex: 3 }}
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
            // negro→gris a lo largo de más recorrido para que la unión con
            // el banner y con la sección siguiente sea gradual, no un corte.
            background:
              "linear-gradient(to bottom, #000 0%, rgba(13,13,11,0.35) 35%, rgba(13,13,11,0.35) 65%, #171616 100%)",
          }}
        />

        {/* Píldora BTC — contra el borde derecho de la sección, fuera del bloque de texto */}
        <div
          className="absolute pointer-events-none select-none hidden sm:block"
          style={{
            top: "50%",
            right: "2rem",
            transform: "translateY(-50%)",
            width: "min(19vw, 195px)",
            height: "min(19vw, 195px)",
            zIndex: 1,
          }}
        >
          <Floating duration={6} y={10} rotate={4}>
            <Image
              src="/assets/home/pildora-final.png"
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

          {t.presentacionParagraphs.map((paragraph, i) => (
            <Reveal key={i} delay={0.1 + i * 0.1}>
              <p
                className={i === 0 ? `relative ${TITLE_GAP}` : "relative mt-4"}
                style={{
                  fontFamily: "var(--font-neue-machina), sans-serif",
                  fontWeight: 300,
                  color: "#A5A8B1",
                  fontSize: BODY_FS,
                  lineHeight: 1.6,
                  zIndex: 2,
                  maxWidth: headlineWidth,
                  textAlign: "justify",
                }}
              >
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Speakers */}
      <section
        id="speakers"
        className="relative flex flex-col justify-center py-16 sm:py-0 sm:min-h-screen overflow-hidden"
        style={{ zIndex: 3, background: "#171616" }}
      >

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
                    <SpeakerCardView key={`${lane.id}-${i}`} card={card} lang={lang} />
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
        className="relative flex flex-col justify-center px-6 sm:px-10 py-16 sm:py-32 sm:min-h-screen overflow-hidden"
        style={{ zIndex: 3 }}
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
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.4) 30%, rgba(13,13,11,0.4) 70%, #171616 100%)",
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
            className={`${TITLE_GAP} mx-auto max-w-sm sm:max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 items-stretch`}
          >
            {TICKETS.map((ticket) => {
              const light = ticket.dark === false; // Business: fondo claro → texto oscuro
              const cText = light ? "#171616" : "#E6EEF2";
              // General (fondo naranja): "Incluye" pasa a oscuro para más contraste (pedido cliente 21/7)
              const cMuted =
                ticket.tier === "General" ? "#171616" : light ? "rgba(23,22,22,0.6)" : "#A5A8B1";
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
                        style={{ marginTop: pi === 0 ? 0 : "6px", whiteSpace: "nowrap" }}
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
                            fontSize: ticket.prices.length > 1 ? "clamp(16px, 1.7vw, 20px)" : "clamp(20px, 2.4vw, 28px)",
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
                        {feat.extra ? (
                          <span
                            className="shrink-0"
                            style={{
                              fontFamily: "var(--font-neue-machina), sans-serif",
                              fontWeight: 700,
                              fontSize: "12px",
                              lineHeight: 1,
                              color: ticket.accent,
                            }}
                          >
                            +
                          </span>
                        ) : (
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
                        )}
                        <span
                          style={{
                            fontFamily: "var(--font-neue-machina), sans-serif",
                            fontWeight: 500,
                            fontSize: "clamp(13px, 1.05vw, 15px)",
                            lineHeight: 1.4,
                            color: cText,
                          }}
                        >
                          {feat.text}
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
                        fontSize: BUTTON_FS,
                        padding: "12px 20px",
                        // Experience: botón pasa a naranja (pedido cliente 21/7)
                        background:
                          ticket.tier === "Experience" ? "#FF4E01" : light ? "#171616" : "#ABF760",
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

        {/* Honeybadger — anclado al borde de la sección para que no lo recorte el overflow.
            zIndex 1 (por debajo del contenido en zIndex 2): si el ancho de viewport achica
            el gutter y la card de tickets llega a superponerse, la card pinta encima y el
            honeybadger nunca tapa el botón de compra. */}
        <div
          className="absolute pointer-events-none select-none hidden sm:block"
          style={{
            bottom: "1.5rem",
            left: "2rem",
            width: "min(16vw, 170px)",
            height: "min(16vw, 170px)",
            zIndex: 1,
          }}
        >
          <Floating duration={5} y={7} rotate={3}>
            <Image
              src="/assets/home/honeybadger-final.png"
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
        className="relative flex flex-col justify-center px-6 sm:px-10 py-16 sm:py-32 sm:min-h-screen overflow-hidden"
        style={{ zIndex: 3 }}
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
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.4) 30%, rgba(13,13,11,0.4) 70%, #171616 100%)",
          }}
        />

        <div className="relative w-full" style={{ zIndex: 2 }}>
          <Reveal className="relative w-full max-w-6xl" style={{ height: TITLE_H }}>
            <Image
              src={TITLE_IMAGES.seParte[lang]}
              alt={lang === "es" ? "Sé parte" : "Be part"}
              fill
              style={{ objectFit: "contain", objectPosition: "left center" }}
            />
          </Reveal>

          {/* Mismo max-w/gap que el grid de Tickets, y mismo contenedor de referencia
              (sin max-w-6xl heredado) para que las cards arranquen en el mismo borde */}
          <div className={`${TITLE_GAP} mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-sm sm:max-w-5xl items-stretch`}>
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
                  className="mt-3"
                  style={{
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 300,
                    color: "rgba(13,13,11,0.75)",
                    fontSize: BODY_FS,
                    lineHeight: 1.45,
                  }}
                >
                  {card.description}
                </p>
                {/* CTA — mismo patrón de anclaje al piso de la card que los tickets (mt-auto + block w-full) */}
                <a
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="mt-auto pt-6 block"
                >
                  <span
                    className="block w-full text-center rounded-full transition-opacity duration-200 hover:opacity-80"
                    style={{
                      ...labelStyle,
                      color: "#FF4E01",
                      background: "#171616",
                      fontSize: BUTTON_FS,
                      padding: "12px 20px",
                    }}
                  >
                    {card.cta}
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Astronauta — anclado dentro de la sección para que no lo recorte el overflow.
            zIndex 1 (por debajo del contenido en zIndex 2): mismo criterio que el honeybadger
            de Tickets, así nunca tapa el CTA de la card cuando el viewport achica el gutter. */}
        <div
          className="absolute pointer-events-none select-none hidden sm:block"
          style={{
            bottom: "2rem",
            right: "2rem",
            width: "min(22vw, 260px)",
            height: "min(22vw, 260px)",
            zIndex: 1,
          }}
        >
          <Floating duration={7} y={14} rotate={6}>
            <Image
              src="/assets/home/astronauta-final.png"
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
        className="relative flex flex-col justify-center px-6 sm:px-10 py-20 sm:py-0 sm:min-h-screen overflow-hidden"
        style={{ zIndex: 3 }}
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
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.35) 30%, rgba(13,13,11,0.35) 70%, #171616 100%)",
          }}
        />

        <div className="relative w-full max-w-6xl" style={{ zIndex: 2 }}>
          <Reveal className="relative w-full" style={{ height: TITLE_H }}>
            <div ref={costaSalgueroRef} className="relative w-full h-full">
              <Image
                src={TITLE_IMAGES.costaSalguero}
                alt="Costa Salguero"
                fill
                onLoad={(e) => {
                  const img = e.currentTarget;
                  costaSalgueroAspect.current = img.naturalWidth / img.naturalHeight;
                  if (costaSalgueroRef.current) {
                    setCostaSalgueroWidth(
                      costaSalgueroRef.current.getBoundingClientRect().height * costaSalgueroAspect.current
                    );
                  }
                }}
                style={{ objectFit: "contain", objectPosition: "left center" }}
              />
            </div>
          </Reveal>

          <Reveal delay={0.1} className={TITLE_GAP}>
            <p
              className="max-w-2xl"
              style={{
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 300,
                color: "#A5A8B1",
                fontSize: BODY_FS,
                lineHeight: 1.5,
                textAlign: "justify",
                maxWidth: costaSalgueroWidth,
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
                fontSize: BODY_FS,
                lineHeight: 1.5,
                textAlign: "justify",
                maxWidth: costaSalgueroWidth,
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
                fontSize: BUTTON_FS,
                padding: "10px 28px",
              }}
            >
              {t.ubicacionBtn}
            </a>
          </Reveal>

          <Reveal delay={0.25} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ aspectRatio: "16 / 9", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Image
                src={COSTA_SALGUERO_PHOTO_URL}
                alt={t.mapTitle}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
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
            width: "min(43vw, 575px)",
            height: "min(43vw, 575px)",
            zIndex: 1,
            opacity: 0.9,
          }}
        >
          <Floating duration={6} y={10} rotate={2}>
            <Image
              src="/assets/home/ballena-final.png"
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
