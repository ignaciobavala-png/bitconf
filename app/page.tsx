"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/home/Navbar";
import HeroVideo from "@/components/home/HeroVideo";
import QaChatWidget, { openQubitChat } from "@/components/home/QaChatWidget";
import CheckoutModal from "@/components/home/CheckoutModal";
import Footer from "@/components/home/Footer";
import Reveal from "@/components/home/Reveal";
import Floating from "@/components/home/Floating";
import PhotoCarousel, { type CarouselSlide } from "@/components/home/PhotoCarousel";
import { useHeadlineWidth } from "@/components/home/useHeadlineWidth";
import { useLangStore } from "@/lib/store/lang";
import { mediaPartnerLanes } from "@/lib/media-partners";
import { SHOW_AGENDA, SHOW_SPEAKERS } from "@/lib/flags";

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
// `-v2` = master recomprimido (5.2MB → 2.05MB, h264 crf 36, mismo 1920x1080).
// El bucket es la fuente del egress facturado por Supabase y el video es autoplay,
// así que cada visita nueva se lo baja entero: es el asset que más pesa en la cuota.
// Nombre nuevo (no sobrescribir) porque el objeto viejo ya está cacheado un año.
const HERO_VIDEO_URL =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/home/hero-v2.mp4";
// Foto de Costa Salguero (sección Ubicación): mismo patrón, bucket público de Supabase.
const COSTA_SALGUERO_PHOTO_URL =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/home/costa-salguero-v2.jpg";
// Sponsor deck (PDF): mismo bucket. El `?download=` de Supabase Storage fuerza el
// Content-Disposition: attachment — sin ese query param el navegador abre el PDF
// en una pestaña en vez de descargarlo (el atributo `download` de <a> no aplica
// porque el archivo es cross-origin).
// `-v2` = mismo deck recomprimido a 150dpi (11.8MB → 2.1MB, visualmente idéntico).
const SPONSOR_DECK_URL =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/home/sponsor-deck-v2.pdf?download=LABITCONF-2026-Sponsor-Deck.pdf";

const T = {
  es: {
    heroButton: "Comprar Ticket",
    heroTagline: "Latin American Bitcoin & Blockchain Conference",
    presentacionParagraphs: [
      "Desde 2013, LABITCONF reúne en América Latina a quienes están construyendo el futuro de la tecnología y las finanzas. El viernes 30 y sábado 31 de octubre, Costa Salguero, Buenos Aires, será nuevamente el punto de encuentro de la comunidad.",
      "Esta edición pone a Bitcoin, Blockchain e Inteligencia Artificial en la misma conversación. Dos días de charlas, experiencias y encuentros con referentes de la industria y quienes están dando forma a lo que viene.",
      "HODL no es esperar: es tener la convicción de seguir construyendo. ¿Y vos, por qué hodleás?",
    ],
    presentacionTopics: ["Bitcoin", "Tecnología", "IA", "Finanzas", "Startups", "Comunidad"],
    accesosTitle: "¿Qué querés saber de LABITCONF?",
    accesosSubtitle: "No todo el mundo llega con la misma intención. Elegí por dónde empezar.",
    ubicacionP1:
      "Centro Costa Salguero es uno de los espacios más reconocidos para eventos en la Ciudad de Buenos Aires.",
    ubicacionP2:
      "Cada año recibe conferencias, ferias y exposiciones de gran escala, consolidándose como un punto clave en el mapa cultural y tecnológico de la ciudad. Será la sede oficial de LABITCONF 2026 los días 30 y 31 de octubre.",
    ubicacionBtn: "Abrir en Google Maps",
    mapTitle: "Ubicación Costa Salguero",
    ticketsIncludes: "Incluye",
    ticketsBuy: "Comprar",
    mediaTitle: "Media Partners",
    mediaSubtitle: "Los medios que cuentan LABITCONF.",
  },
  en: {
    heroButton: "Buy Ticket",
    heroTagline: "Latin American Bitcoin & Blockchain Conference",
    presentacionParagraphs: [
      "Since 2013, LABITCONF has brought together the people building the future of technology and finance across Latin America. On Friday October 30 and Saturday October 31, Costa Salguero, Buenos Aires, will once again be the community's meeting point.",
      "This edition puts Bitcoin, Blockchain and Artificial Intelligence in the same conversation. Two days of talks, experiences and encounters with industry leaders and the people shaping what comes next.",
      "HODL isn't waiting: it's having the conviction to keep building. So, why do you hodl?",
    ],
    presentacionTopics: ["Bitcoin", "Technology", "AI", "Finance", "Startups", "Community"],
    accesosTitle: "What do you want to know about LABITCONF?",
    accesosSubtitle: "Not everyone arrives with the same intent. Pick where to start.",
    ubicacionP1:
      "Centro Costa Salguero is one of the most recognized event spaces in the City of Buenos Aires.",
    ubicacionP2:
      "Every year it hosts large-scale conferences, fairs and exhibitions, cementing itself as a key point on the city's cultural and technological map. It will be the official venue of LABITCONF 2026 on October 30 and 31.",
    ubicacionBtn: "Open in Google Maps",
    mapTitle: "Costa Salguero Location",
    ticketsIncludes: "Includes",
    ticketsBuy: "Buy",
    mediaTitle: "Media Partners",
    mediaSubtitle: "The media covering LABITCONF.",
  },
} as const;

// Media partners — alto de la caja de cada logo. Lo único que se repite entre
// todos es esta caja; lo que cambia por logo es cuánto de esa caja ocupa
// (`scale` en lib/media-partners.ts), nunca la caja.
const MEDIA_LOGO_H = "clamp(36px, 4.65vw, 57px)";

// El reparto en filas no depende de nada del render: se calcula una vez.
const mediaRows = mediaPartnerLanes();
// Ancho de celda = el de la fila MÁS llena. Así la fila incompleta no estira
// sus celdas: queda centrada con medio hueco de cada lado, que se nota mucho
// menos que un hueco entero contra el margen derecho.
const MEDIA_COLS = Math.max(...mediaRows.map((row) => row.length));

// Burbujas de intención de `#accesos`. Agenda y Speakers viajan apagadas
// (`lib/flags.ts`): la organización pidió no mostrarlas hasta confirmar el
// programa, y en esta rama las páginas todavía no existen.
const QUICK_ACCESS = [
  { key: "ticket", action: "checkout" as const, href: undefined, show: true },
  { key: "agenda", action: "link" as const, href: "/agenda", show: SHOW_AGENDA },
  { key: "speakers", action: "link" as const, href: "/speakers", show: SHOW_SPEAKERS },
  { key: "embajadores", action: "link" as const, href: "/comunidad#embajadores", show: true },
  { key: "hub", action: "link" as const, href: "/comunidad#student-hub", show: true },
  { key: "comunidades", action: "link" as const, href: "/comunidad#comunidades", show: true },
  { key: "separte", action: "link" as const, href: "/#se-parte", show: true },
  { key: "qubit", action: "qubit" as const, href: undefined, show: true },
] as const;

const QUICK_ACCESS_LABELS = {
  es: {
    ticket: "Quiero comprar mi ticket",
    agenda: "Quiero ver la agenda",
    speakers: "Quiero conocer los speakers",
    embajadores: "¿Quiénes son los embajadores?",
    hub: "Quiero saber qué es el Hub",
    comunidades: "Quiero participar con mi comunidad",
    separte: "Quiero ser parte",
    qubit: "No sé por dónde empezar",
  },
  en: {
    ticket: "I want to buy my ticket",
    agenda: "I want to see the agenda",
    speakers: "I want to meet the speakers",
    embajadores: "Who are the ambassadors?",
    hub: "I want to know what the Hub is",
    comunidades: "I want to join with my community",
    separte: "I want to take part",
    qubit: "I don't know where to start",
  },
} as const;

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};


// Beneficios por tier (info del cliente, 21/7). Business/Experience NO repiten
// la lista completa: muestran una línea-resumen ("Todo lo de Ticket General")
// más solo lo que suman, para no comprimir la card con ítems duplicados.
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
    businessSummary: "Todo lo de Ticket General",
    businessExtra: [
      "Un Hardware Wallet de Regalo",
      "Escenario Exclusivo B2B",
      "Área Networking VIP",
      "Coffee Station",
      "Almuerzo Incluido",
    ],
    experienceSummary: "Todo lo del Ticket Business",
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
    businessSummary: "Everything in the General Ticket",
    businessExtra: [
      "Free Hardware Wallet",
      "Exclusive B2B Stage",
      "VIP Networking Area",
      "Coffee Station",
      "Lunch Included",
    ],
    experienceSummary: "Everything in the Business Ticket",
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
): readonly { text: string; extra: boolean; summary?: boolean }[] {
  const f = TICKET_FEATURES[lang];
  const base = f.general.map((text) => ({ text, extra: false }));
  if (tier === "General") return base;
  const businessExtra = f.businessExtra.map((text) => ({ text, extra: true }));
  if (tier === "Business") {
    return [{ text: f.businessSummary, extra: false, summary: true }, ...businessExtra];
  }
  const experienceExtra = f.experienceExtra.map((text) => ({ text, extra: true }));
  return [{ text: f.experienceSummary, extra: false, summary: true }, ...experienceExtra];
}

// Paleta por tier (12/8, pedido de diseño): se invirtió el orden respecto del manual
// del 16/7 — el naranja (identidad Bitcoin) pasó de General a Experience para que el
// tier más caro sea el que resalta y el de entrada quede sobrio. Queda la rampa
// grafito → plateado → naranja. `warm` marca la card naranja: las reglas de contraste
// van atadas a esa flag, no al nombre del tier.
// `cta` es el color del botón de compra de cada card, definido a mano por tier
// (negro · naranja · verde) en vez de derivarlo del fondo.
// General va en pesos (AR$); los otros en USD.
const TICKETS = [
  {
    tier: "General",
    tagline: "HODL the Community",
    accent: "#C7CBD1", // acero sobre grafito
    dark: true,
    warm: false,
    // Negro sobre la card grafito: sin el borde acero el botón se pierde contra el fondo.
    cta: { bg: "#171616", fg: "#E6EEF2", border: "1px solid rgba(199,203,209,0.45)" },
    background:
      "linear-gradient(155deg, #3A3D42 0%, #24272C 45%, #2E3137 70%, #131417 100%)",
    prices: [{ es: "Second Chance", en: "Second Chance", value: "AR$ 65.000" }],
    note: {
      es: "*precio final reflejado en dólares",
      en: "*final price charged in dollars",
    },
  },
  {
    tier: "Business",
    tagline: "HODL the Network",
    accent: "#FF4E01",
    dark: false,
    warm: false,
    cta: { bg: "#FF4E01", fg: "#E6EEF2", border: "none" },
    background:
      "linear-gradient(155deg, #f2f2f2 0%, #cfcfcf 30%, #8a8a8a 55%, #d8d8d8 75%, #a0a0a0 100%)",
    prices: [{ es: "Early Bird", en: "Early Bird", value: "US$ 150" }],
    note: { es: "+ service charge", en: "+ service charge" },
  },
  {
    tier: "Experience",
    tagline: "HODL Full LABITCONF",
    accent: "#171616", // sobre naranja, acento oscuro
    dark: true,
    warm: true,
    cta: { bg: "#ABF760", fg: "#171616", border: "none" },
    background:
      "linear-gradient(155deg, #FF7A38 0%, #FF4E01 42%, #C23A00 72%, #7A2400 100%)",
    prices: [{ es: "Early Bird", en: "Early Bird", value: "US$ 450" }],
    note: { es: "+ service charge", en: "+ service charge" },
  },
] as const;

const SE_PARTE_CARDS = {
  es: [
    {
      title: "Sponsor Deck",
      description: "Conocé las propuestas para sponsors y sé parte del evento más relevante de Bitcoin y Blockchain en LATAM.",
      cta: "Descargá",
      href: SPONSOR_DECK_URL,
    },
    {
      title: "Media Partners",
      description: "¿Querés ser parte de la cobertura oficial de LABITCONF? Postulate como Media Partner y accedé a beneficios exclusivos para medios aliados.",
      cta: "Postulate",
      href: "https://forms.gle/fuLpfnE6puDcv1tx7",
    },
    {
      title: "Acreditación de prensa",
      description: "¿Sos periodista, medio o agencia? ¿Querés contar lo que pasa en LABITCONF 26? Acreditate como prensa y sé parte de la cobertura.",
      cta: "Acreditate",
      href: "https://forms.gle/2mWY9C8kBRyjwt5u9",
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
      href: SPONSOR_DECK_URL,
    },
    {
      title: "Media Partners",
      description: "Want to be part of LABITCONF's official coverage? Apply as a Media Partner and get exclusive benefits for allied media.",
      cta: "Apply",
      href: "https://forms.gle/fuLpfnE6puDcv1tx7",
    },
    {
      title: "Press Accreditation",
      description: "Are you a journalist, outlet or agency? Do you want to cover what happens at LABITCONF 26? Get accredited as press and be part of the coverage.",
      cta: "Get accredited",
      href: "https://forms.gle/2mWY9C8kBRyjwt5u9",
    },
    {
      title: "Speakers",
      description: "Fill out the form and apply to speak at the 2026 edition. Apply now and share your take on the future of Bitcoin and decentralization in LATAM.",
      cta: "Apply",
      href: "https://app-labitconf.github.io/LABITCONF-speakers/form/",
    },
  ],
} as const;

/* Un acento por card — pedido de la organización: que las cuatro no tengan
   todas lo mismo. El color se asigna por significado, siguiendo los roles que
   la paleta oficial le da a cada uno: Orange = fuerza/BTC (el pitch comercial),
   Almico = calidez/hogar (los aliados), Electric Ekko = seguridad (la
   credencial de prensa), Brote = futuro (el contenido). Lactica no entra como
   relleno: la paleta ya le asigna el rol de texto.
   El orden es el mismo que `SE_PARTE_CARDS` en los dos idiomas.
   `dark` marca el único relleno oscuro, que invierte el color del texto. */
const SE_PARTE_ACCENTS = [
  { color: "#FF4E01", dark: false },
  { color: "#FFAB0B", dark: false },
  { color: "#1311FC", dark: true },
  { color: "#ABF760", dark: false },
] as const;

/* Las placas del carrusel de la home. Viven en el bucket público de Supabase,
   igual que las fotos de galería y el video del hero: son material del evento
   que la organización repone sola, no assets de build, y no tienen por qué
   inflar el clone del repo para siempre.
   Vienen con el texto horneado en el render, así que el componente respeta esa
   relación (2,7:1) y no recorta: el `alt` transcribe lo que dice cada una.
   Orden = orden de reproducción.

   `-v2` = las placas a 2659x984 que mandó la organización el 17/09, contra las
   851x315 originales. Eran el motivo de que se vieran blandas: la pieza es
   full-bleed, así que las viejas se estiraban entre 2x y 4x y el optimizador no
   puede inventar píxeles (servía 851px de ancho pidiera lo que pidiera).
   Nombre nuevo y no sobrescritura, como el hero y el deck: el objeto viejo ya
   está cacheado un año. Se suben en JPEG q92 y no en el PNG original de 3MB —
   son fotos sin alfa, y la diferencia en la zona del texto es de 42dB PSNR
   (imperceptible) por un quinto del peso. */
const CAROUSEL_BASE =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/home/carrusel";

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    src: `${CAROUSEL_BASE}/slide-01-v2.jpg`,
    alt: { es: "Todo esto sucede en LABITCONF", en: "All of this happens at LABITCONF" },
  },
  {
    src: `${CAROUSEL_BASE}/slide-02-v2.jpg`,
    alt: { es: "+5 escenarios", en: "+5 stages" },
  },
  {
    src: `${CAROUSEL_BASE}/slide-03-v2.jpg`,
    alt: { es: "Workshops: aprendé, probá, construí", en: "Workshops: learn, try, build" },
  },
  {
    src: `${CAROUSEL_BASE}/slide-04-v2.jpg`,
    alt: { es: "Closing party: fiesta de disfraces Hodlween", en: "Closing party: Hodlween costume party" },
  },
  {
    src: `${CAROUSEL_BASE}/slide-05-v2.jpg`,
    alt: { es: "Experiencias: todo lo que pasa, todo lo que vivís", en: "Experiences: everything that happens, everything you live" },
  },
  {
    src: `${CAROUSEL_BASE}/slide-06-v2.jpg`,
    alt: {
      es: "Speakers internacionales: las voces que están construyendo el futuro",
      en: "International speakers: the voices building the future",
    },
  },
];

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
  // Checkout de Hallos embebido en modal (todos los CTA de compra lo abren)
  const [checkoutOpen, setCheckoutOpen] = useState(false);

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
          <motion.button
            type="button"
            onClick={() => setCheckoutOpen(true)}
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
          </motion.button>

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

      {/* Accesos rápidos — primera bifurcación después del hero (mapa web fase 2).
          Va antes de "¿Qué es LABITCONF?" a propósito: el usuario que ya sabe a
          qué vino no tiene que scrollear la presentación entera para llegar. */}
      <section
        id="accesos"
        className="relative px-6 sm:px-10 py-16 sm:py-24 overflow-hidden"
        style={{ zIndex: 3, background: "#000" }}
      >
        <div className="relative w-full max-w-6xl mx-auto text-center" style={{ zIndex: 2 }}>
          <Reveal>
            <h2
              style={{
                ...labelStyle,
                color: "#E6EEF2",
                fontSize: "clamp(20px, 2.6vw, 34px)",
              }}
            >
              {t.accesosTitle}
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p
              className="mt-3"
              style={{
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 300,
                color: "#A5A8B1",
                fontSize: BODY_FS,
              }}
            >
              {t.accesosSubtitle}
            </p>
          </Reveal>

          <div className={`${TITLE_GAP} flex flex-wrap justify-center gap-3 sm:gap-4`}>
            {QUICK_ACCESS.filter((item) => item.show).map((item, i) => {
              const label = QUICK_ACCESS_LABELS[lang][item.key];
              // El borde alterna Orange 021 C / Brote burbuja por burbuja: con un
              // solo color las pastillas se leen como una lista gris; alternando
              // se ven como opciones distintas sin agregar más peso tipográfico.
              const accent = i % 2 === 0 ? "#FF4E01" : "#ABF760";
              // El CTA de compra y el de Qubit son acciones, no navegación, así
              // que el elemento cambia de <a> a <button> según el caso.
              const bubbleStyle: React.CSSProperties = {
                ...labelStyle,
                background: "rgba(230,238,242,0.04)",
                border: `1px solid ${accent}`,
                fontSize: BUTTON_FS,
                padding: "14px 26px",
                ["--accent" as string]: accent,
              };
              const className =
                "rounded-full transition-colors duration-200 text-[#E6EEF2] hover:bg-[var(--accent)] hover:text-[#171616]";

              if (item.action === "link") {
                return (
                  <Reveal key={item.key} delay={0.15 + i * 0.06}>
                    <a href={item.href} className={`inline-block ${className}`} style={bubbleStyle}>
                      {label}
                    </a>
                  </Reveal>
                );
              }

              return (
                <Reveal key={item.key} delay={0.15 + i * 0.06}>
                  <button
                    type="button"
                    onClick={item.action === "checkout" ? () => setCheckoutOpen(true) : openQubitChat}
                    className={className}
                    style={bubbleStyle}
                  >
                    {label}
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
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

        {/* Píldora BTC — contra el borde derecho de la sección, fuera del bloque de texto.

            El ancho no es libre: lo limita el gutter que sobra a la derecha del bloque de
            contenido (`max-w-6xl` = 1152px + 2.5rem de padding izquierdo), con 16px de aire.
            Antes era `min(19vw, 195px)` y por debajo de 1440px se metía sobre los párrafos.
            De 1440px para arriba mide los mismos ~195px de siempre; por debajo no hay gutter
            que alcance para una figura legible, así que no se muestra. */}
        <div
          className="absolute pointer-events-none select-none hidden min-[1440px]:block"
          style={{
            top: "50%",
            right: "2rem",
            transform: "translateY(-50%)",
            width: "min(195px, max(0px, calc(100% - 1240px)))",
            aspectRatio: "1 / 1",
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
                  color: "#E6EEF2",
                  fontSize: "clamp(15px, 1.5vw, 20px)",
                  lineHeight: 1.7,
                  zIndex: 2,
                  maxWidth: headlineWidth,
                  textAlign: "justify",
                }}
              >
                {paragraph}
              </p>
            </Reveal>
          ))}

          {/* Temas destacados — "globos" pedidos en el mapa web, debajo del copy */}
          <div className="mt-8 flex flex-wrap gap-2 sm:gap-3">
            {t.presentacionTopics.map((topic, i) => (
              <Reveal key={topic} delay={0.4 + i * 0.06}>
                <span
                  className="inline-block rounded-full"
                  style={{
                    ...labelStyle,
                    color: "#FF4E01",
                    border: "1px solid rgba(255,78,1,0.5)",
                    fontSize: "clamp(11px, 1vw, 13px)",
                    padding: "8px 18px",
                  }}
                >
                  {topic}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Carrusel de placas — reemplaza los carriles de píldoras de 2025.

          Sin padding vertical propio (antes `py-16 sm:py-24`): la pieza es full-bleed y el
          aire de más la dejaba flotando como un bloque suelto en vez de leerse como parte
          de la home (reporte de la organización del 17/09). El aire de arriba ya lo pone el
          centrado vertical de Presentación, y el de abajo el `py` de Tickets; lo único
          propio es el colchón de los indicadores. */}
      <section
        id="speakers"
        className="relative flex flex-col justify-center pb-10 sm:pb-12 overflow-hidden"
        style={{ zIndex: 3, background: "#171616" }}
      >
        <Reveal>
          <PhotoCarousel slides={CAROUSEL_SLIDES} lang={lang} />
        </Reveal>
      </section>
      {/* Tickets */}
      <section
        id="tickets"
        // `sm:justify-start` y no `justify-center`: la sección sigue ocupando la pantalla
        // (patrón 1:1), pero el contenido mide 660px fijos, así que centrarlo repartía el
        // sobrante mitad arriba — y ese medio sobrante caía justo entre el carrusel y el
        // título, creciendo con la altura de pantalla (82px en 1080, 262px en 1440). La
        // organización lo marcó como un hueco. Con el contenido arriba, la distancia al
        // carrusel es constante (el `pt`) en cualquier alto de pantalla.
        //
        // Y sin `sm:min-h-screen` (decisión tomada el 17/09, sale del patrón "1:1 screen"
        // que rige para Hero y Presentación): forzar la pantalla completa con un contenido
        // de 660px fijos solo mueve el sobrante de arriba a abajo — 556px de negro entre
        // las tarjetas y Media Partners en un monitor de 1440 de alto. Midiendo lo que
        // necesita, el aire es el mismo en toda pantalla y arriba del pliegue asoma la
        // sección siguiente, que invita a seguir bajando.
        className="relative flex flex-col justify-start px-6 sm:px-10 py-16 sm:pt-24 sm:pb-32 overflow-hidden"
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
              // Card naranja: "Incluye" pasa a oscuro para más contraste (pedido cliente 21/7)
              const cMuted = ticket.warm
                ? "#171616"
                : light
                  ? "rgba(23,22,22,0.6)"
                  : "#A5A8B1";
              const cDivider = light ? "rgba(23,22,22,0.15)" : "rgba(255,255,255,0.15)";
              // Línea-resumen ("Todo lo del Ticket X"): usa el acento del tier — naranja
              // sobre la card plateada, oscuro sobre la naranja (ahí el naranja no se vería).
              const cSummary = ticket.accent;
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
                    {/* Nombre de tanda ARRIBA del precio, no al lado.
                        En una línea no entra: la fila mide 270px y "Second
                        Chance" (103) + gap (8) + "AR$ 65.000" (189) necesitan
                        300. Como la fila es flex con `nowrap`, el label se
                        encogía a 73px y el texto se desbordaba encima del
                        número (lo reportó la organización el 10/09). Con
                        "Early Bird" entraba justo y no se veía.
                        Va en las tres cards y no solo en General: si una
                        quedara en dos líneas y las otras en una, los precios
                        dejarían de alinearse entre tarjetas. Además así
                        cualquier tanda futura entra sin volver a romperse. */}
                    {ticket.prices.map((p, pi) => (
                      <div
                        key={pi}
                        style={{ marginTop: pi === 0 ? 0 : "10px", whiteSpace: "nowrap" }}
                      >
                        {p[lang] && (
                          <div
                            style={{
                              fontFamily: "var(--font-neue-machina), sans-serif",
                              fontWeight: 500,
                              fontSize: "13px",
                              color: cText,
                              opacity: 0.85,
                              marginBottom: "2px",
                            }}
                          >
                            {p[lang]}
                          </div>
                        )}
                        <div
                          style={{
                            ...labelStyle,
                            color: cText,
                            fontSize: ticket.prices.length > 1 ? "clamp(16px, 1.7vw, 20px)" : "clamp(20px, 2.4vw, 28px)",
                            letterSpacing: "0.02em",
                            lineHeight: 1.1,
                          }}
                        >
                          {p.value}
                        </div>
                      </div>
                    ))}
                    {/* Aclaración de precio (12/8, diseño): moneda de cobro en General,
                        service charge en los tiers en USD. */}
                    <div
                      style={{
                        fontFamily: "var(--font-neue-machina), sans-serif",
                        fontWeight: 300,
                        fontStyle: "italic",
                        fontSize: "11px",
                        lineHeight: 1.3,
                        color: cMuted,
                        marginTop: "6px",
                      }}
                    >
                      {ticket.note[lang]}
                    </div>
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
                              background: feat.summary ? cSummary : ticket.accent,
                              marginTop: "7px",
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontFamily: "var(--font-neue-machina), sans-serif",
                            fontWeight: feat.summary ? 700 : 500,
                            fontSize: "clamp(13px, 1.05vw, 15px)",
                            lineHeight: 1.4,
                            fontStyle: feat.summary ? "italic" : "normal",
                            color: feat.summary ? cSummary : cText,
                          }}
                        >
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA — mismo checkout embebido que el botón del hero (Hallos) */}
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(true)}
                    className="mt-auto pt-6 block w-full"
                  >
                    <span
                      className="block w-full text-center rounded-full transition-opacity duration-200 hover:opacity-80"
                      style={{
                        ...labelStyle,
                        fontSize: BUTTON_FS,
                        padding: "12px 20px",
                        background: ticket.cta.bg,
                        color: ticket.cta.fg,
                        border: ticket.cta.border,
                      }}
                    >
                      {t.ticketsBuy}
                    </span>
                  </button>
                </div>
              );
            })}
          </Reveal>

        </div>

        {/* Honeybadger — anclado al borde de la sección para que no lo recorte el overflow.
            zIndex 1 (por debajo del contenido en zIndex 2): si el ancho de viewport achica
            el gutter y la card de tickets llega a superponerse, la card pinta encima y el
            honeybadger nunca tapa el botón de compra.

            No puede pisar las cards en ningún ancho (pedido de la organización): sigue
            anclado a la esquina (`left: 2rem`, misma composición de siempre), pero su ancho
            ya no es libre — lo limita el gutter que realmente sobra entre esa esquina y el
            borde izquierdo del grid (`max-w-5xl` = 1024px → 512px desde el centro), con 16px
            de aire. Así el solapamiento es imposible por geometría, no por z-index: en
            pantallas anchas mide sus 170px de siempre y en las angostas se achica solo.
            Desde `xl` (1280px) para arriba el gutter alcanza; por debajo no hay lugar para
            una figura legible y directamente no se muestra. */}
        <div
          className="absolute pointer-events-none select-none hidden xl:block"
          style={{
            bottom: "1.5rem",
            left: "2rem",
            width: "min(170px, max(0px, calc(50% - 512px - 2rem - 16px)))",
            aspectRatio: "1 / 1",
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

      {/* Media partners — entre Tickets y Sé parte: los medios acompañan al
          evento, y la sección siguiente es justamente la de postularse como uno.

          Grilla FIJA y no `LogoMarquee`, que es lo que se usa en /mas: con 14
          marcas entran todas en una pantalla, que era el argumento del marquee
          (muchos logos en poco espacio). Pedido de la organización del 08/09. */}
      <section
        id="media-partners"
        // Sin `sm:min-h-screen`: el patrón "1:1 screen" del resto de la home
        // no aplica a un bloque corto. Con tres filas el contenido mide ~460px
        // y el `justify-center` repartía el sobrante de la pantalla arriba y
        // abajo, dejando un hueco muerto contra "Sé parte".
        className="relative flex flex-col justify-center px-6 sm:px-10 py-16 sm:pt-32 sm:pb-20 overflow-hidden"
        style={{ zIndex: 3 }}
      >
        {/* Fondo: iconos (el único del banco que no está usado en la home) */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{ zIndex: 0, opacity: 0.18 }}
        >
          <Image
            src="/assets/home/fondo-iconos.jpg"
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

        {/* Sin `max-w-6xl` (feedback 10/09: "insisto con la alineación de todo
            hasta la margen derecha"): el bloque ocupa el ancho completo de la
            sección, así el borde derecho de los carriles coincide con el del
            navbar en vez de cortarse antes. */}
        <div className="relative w-full" style={{ zIndex: 2 }}>
          {/* Título como texto: no hay PNG "Media Partners" en la tanda de
              títulos. Se reemplaza por <Image> cuando diseño lo mande. */}
          <Reveal>
            <h2 style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(28px, 4.6vw, 56px)", lineHeight: 1.05 }}>
              {t.mediaTitle}
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p
              className="mt-3"
              style={{
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 300,
                color: "#A5A8B1",
                fontSize: BODY_FS,
              }}
            >
              {t.mediaSubtitle}
            </p>
          </Reveal>

          {/* Tres filas FIJAS, sin movimiento.
              El 08/09 ya se había decidido grilla y no `LogoMarquee` (con esta
              cantidad de marcas entran todas en una pantalla, que era el
              argumento del marquee), y la nota del 10/09 pide explícitamente
              que la sección no quede en "scroll infinito". Así que el pedido
              de la organización (15/09) de "3 filas de 5" se resuelve quieto.
              Con 14 logos la última fila queda en 4: todas las celdas miden lo
              mismo (el ancho de la fila llena) y la fila incompleta se centra,
              así el hueco se parte en dos mitades en vez de caer entero contra
              el margen derecho. */}
          <div className={`${TITLE_GAP} flex flex-col gap-8 sm:gap-10`}>
            {mediaRows.map((row, i) => (
              <Reveal key={`media-row-${i}`} delay={0.15 + i * 0.08}>
                <div className="flex items-center justify-center">
                  {row.map((logo) => (
                    <div
                      key={logo.src}
                      className="flex items-center justify-center px-2"
                      style={{
                        height: MEDIA_LOGO_H,
                        flex: `0 0 ${100 / MEDIA_COLS}%`,
                      }}
                    >
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={440}
                        height={152}
                        className="h-full w-auto object-contain"
                        // La escala topea el ALTO (compensación óptica por
                        // logo). El ancho NO puede depender de la celda: una
                        // fila con menos logos tiene celdas más anchas y un
                        // wordmark largo crecería hasta el doble que el mismo
                        // logo en una fila llena. Se topea contra el alto de
                        // la caja, que es igual en todas las filas.
                        style={{
                          maxHeight: `${logo.scale * 100}%`,
                          maxWidth: `min(100%, calc(${MEDIA_LOGO_H} * 4.5))`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
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

          {/* 4 cards: 2x2 en tablet y fila de 4 en desktop. Con `sm:grid-cols-3`
              la cuarta quedaba sola en una segunda fila. El contenedor sube a
              `max-w-6xl` en lg —el mismo del título "Sé parte"— porque a 4
              columnas dentro de 5xl cada card no llega a ancho legible. */}
          <div className={`${TITLE_GAP} mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-sm sm:max-w-3xl lg:max-w-6xl items-stretch`}>
            {seParteCards.map((card, i) => {
              const accent = SE_PARTE_ACCENTS[i] ?? SE_PARTE_ACCENTS[0];
              const ink = accent.dark ? "#E6EEF2" : "#171616";
              return (
              <Reveal
                key={card.title}
                delay={0.1 + i * 0.12}
                /* La card entera es el área de hover (`group`): sube, gana sombra
                   y prende el CTA. El degradé mezcla el acento con el fondo Alamo
                   para dar volumen sin sumar un color fuera de paleta.
                   La mezcla es 90% y no 78%: con 78% el pie de la card naranja
                   queda en #CC4206, donde el texto Alamo da 3.7:1 — debajo del
                   mínimo legible aun a opacidad plena. Con 90% son 4.6:1.
                   El borde transparente está en las cuatro para que la única con
                   borde visible (la oscura) no mida 2px menos que sus hermanas. */
                className="group relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_22px_45px_-20px_rgba(0,0,0,0.9)]"
                style={{
                  background: `linear-gradient(155deg, ${accent.color} 0%, color-mix(in srgb, ${accent.color} 90%, #171616) 100%)`,
                  border: `1px solid ${accent.dark ? "rgba(230,238,242,0.45)" : "transparent"}`,
                  padding: "22px 22px",
                }}
              >
                <h3
                  style={{
                    ...labelStyle,
                    color: ink,
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
                    /* Opacidad plena: al 0.75 sobre el naranja el copy daba
                       3.2:1. La jerarquía con el título la sostienen el peso
                       900 y el cuerpo, no un gris. */
                    color: ink,
                    fontSize: BODY_FS,
                    lineHeight: 1.45,
                  }}
                >
                  {card.description}
                </p>
                {/* CTA — mismo patrón de anclaje al piso de la card que los tickets (mt-auto + block w-full).
                    El botón es idéntico en las cuatro cards, la oscura incluida: es el
                    elemento que las alinea como familia ahora que el relleno cambia.
                    Al hover pasa a Lactica y no a Brote —como era cuando las cuatro eran
                    naranjas— porque sobre la card Brote el verde sobre verde desaparecía. */}
                <a
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="mt-auto pt-6 block"
                >
                  <span
                    className="flex w-full items-center justify-center gap-2 rounded-full transition-colors duration-300 bg-[#171616] text-[#E6EEF2] group-hover:bg-[#E6EEF2] group-hover:text-[#171616]"
                    style={{
                      ...labelStyle,
                      fontSize: BUTTON_FS,
                      padding: "12px 20px",
                    }}
                  >
                    {card.cta}
                    <span
                      aria-hidden
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </a>
              </Reveal>
              );
            })}
          </div>
        </div>

        {/* Astronauta — pasa de abajo a la derecha al hueco de arriba a la derecha:
            con 4 cards en una fila, la grilla ocupa todo el ancho y abajo quedaba
            tapado. Ese hueco existe solo en lg (el título es corto y está a la
            izquierda), por eso `hidden lg:block`. zIndex 1 (bajo el contenido). */}
        <div
          className="absolute pointer-events-none select-none hidden lg:block"
          style={{
            top: "2.5rem",
            right: "2rem",
            width: "min(15vw, 180px)",
            height: "min(15vw, 180px)",
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

        {/* Ballena naranja — completa en pantalla (right negativo la dejaba por la mitad).

            Es la que reportó la organización: con `min(43vw, 575px)` se montaba sobre el
            iframe del mapa (hasta 81% tapado en 1024px, 25% todavía en 1440px). Ahora el
            ancho lo limita el gutter real a la derecha del grid foto+mapa (`max-w-4xl` =
            896px + 2.5rem de padding izquierdo), con 16px de aire, así que cruzarlo es
            imposible. De 1600px para arriba mide sus 575px de siempre; por debajo de 1280px
            el gutter no da para una figura de este porte y no se muestra. */}
        <div
          className="absolute pointer-events-none select-none hidden min-[1280px]:block"
          style={{
            top: "50%",
            right: "2rem",
            transform: "translateY(-50%)",
            width: "min(575px, max(0px, calc(100% - 984px)))",
            aspectRatio: "1 / 1",
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

      {/* Footer compartido con /comunidad */}
      <Footer lang={lang} />

      <QaChatWidget />

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </main>
  );
}
