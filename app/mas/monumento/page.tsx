"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import CheckoutModal from "@/components/home/CheckoutModal";
import Reveal from "@/components/home/Reveal";
import MasNav from "@/components/mas/MasNav";
import { useLangStore } from "@/lib/store/lang";
import { MasSection, labelStyle, lightStyle } from "@/components/mas/ui";

// MÁS → MONUMENTO: "El Génesis de Satoshi Nakamoto", el monumento que se
// inaugura en el Open Fest del 29/10. Maquetado a partir de 4 slides que la
// organización pasó por Descargas (monumento1-4.png, 09/10/2026).
//
// Assets en public/assets/home/monumento/ (comprimidos con `convert`):
// - cubo.jpg: render del cubo (fotodeslide2.png).
// - premiacion.jpg / ganadores.jpg: fotos de la premiación del PremioB.Arte.
// - logo-bitcoin-ar.png: isologo {(B)} color, recortado con -trim.
// FBI Iberoamérica reusa public/assets/home/sponsors/fbi.png.
//
// "Este click lleva a la entrada Experience" (slides 1 y 4): el checkout de
// Hallos es una sola URL sin link por tipo de entrada, así que el botón abre
// el mismo modal de checkout que la home.

// Video de fondo del hero (Descargas/LABITCONF_media_16x9_2x_30fps.mp4,
// 09/10/2026): 4K/27.8MB → 1920x1080 crf 20 (2MB), sin audio. El original
// viene en yuvj420p (rango full, transfer sRGB): se convirtió a rango tv +
// bt709 explícito para que el navegador no lo levante a gris (ver el caso de
// fondo1.mp4). Llegó también una versión 2:1 con la misma escena; no se usa.
// No hay versión vertical: en mobile se recorta con la figura (que está a
// ~70% del ancho) dentro del cuadro.
const HERO_VIDEO_SRC =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/mas/monumento/hero-v1.mp4";

const ORANGE = "#FF4E01";
const GREEN = "#ABF760";
const LIGHT = "#E6EEF2";

const CARD: React.CSSProperties = {
  border: `2px solid ${GREEN}`,
  background: "rgba(0,0,0,0.55)",
};

const bodyStyle: React.CSSProperties = {
  ...lightStyle,
  color: LIGHT,
  fontSize: "clamp(14px, 1.4vw, 17px)",
  lineHeight: 1.6,
};

const B = ({ children }: { children: React.ReactNode }) => (
  <strong style={{ fontWeight: 700, color: "#fff" }}>{children}</strong>
);

const T = {
  es: {
    heroTitleTop: "El Génesis de",
    heroTitleName: "Satoshi Nakamoto",
    heroCredits: [
      <>
        Monumento a <B>Satoshi Nakamoto</B> de Buenos Aires
      </>,
      <>Ganador del Gran Premio PremioB.Arte 2025 · 5ª edición</>,
      <>Una obra de Ricardo Alonso &amp; Celeste Difabio Videla.</>,
    ],
    ctaTop: "No te pierdas la",
    ctaBottom: "Inauguración",
    heroDate: ["29 de octubre", "Open Fest LABITCONF 26"],
    origenTitle: "El origen de todo",
    origen: [
      <>Un monumento al momento en que comenzó una nueva era.</>,
      <>
        <B>El Génesis de Satoshi Nakamoto</B> es una instalación escultórica y arquitectónica inspirada en el{" "}
        <B>bloque génesis de Bitcoin, el primer bloque de la cadena.</B>
      </>,
      <>
        La obra toma la forma de un cubo monumental de acero inoxidable y vidrio, pensado para ser recorrido,
        observado y experimentado. Su arquitectura combina tecnología, reflejos y luz para convertir un concepto
        digital en una experiencia física única.
      </>,
    ],
    cuboAlt: "Render del monumento: cubo de acero y vidrio con una figura dorada adentro",
    proyectoTitle: "El proyecto",
    proyectoSub: "Del Premio B.Arte al monumento",
    proyecto: [
      <>
        El Génesis de <B>Satoshi Nakamoto</B> fue seleccionado como Gran Premio del PremioB.Arte 2025, en su quinta
        edición, dentro de la convocatoria que buscó el proyecto destinado a convertirse en el primer Monumento a
        Satoshi Nakamoto de Buenos Aires, Argentina.
      </>,
      <>
        <em style={{ fontWeight: 700, color: "#fff" }}>
          Ricardo Alonso | Ingeniero
          <br />
          Celeste Difabio Videla | Arquitecta
        </em>
      </>,
      <>
        El proyecto se encuentra actualmente en proceso de realización para su presentación en <B>LABITCONF 2026.</B>
      </>,
    ],
    fotos: [
      "Premiación del PremioB.Arte 2025",
      "El monumento de noche",
      "Ganadores del PremioB.Arte 2025",
      "El monumento de día",
      "Ganadores en el stand de Bitcoin.ar",
    ],
    comunidadTitle: "Nace de la comunidad",
    comunidad: [
      <>
        El Génesis de Satoshi Nakamoto nace dentro de Premio B Arte, el primer certamen Iberoamericano cuyos
        premios son en Bitcoin.
      </>,
      <>
        Con el apoyo de <B>Fundación Bitcoin Iberoamérica</B> y bajo la dirección de <B>Aída Pippo</B>,{" "}
        <em style={{ color: "#fff" }}>el monumento busca convertirse en un nuevo ícono de Bitcoin en LATAM</em>
      </>,
    ],
    quienes: "Quienes lo hacen posible",
  },
  en: {
    heroTitleTop: "The Genesis of",
    heroTitleName: "Satoshi Nakamoto",
    heroCredits: [
      <>
        Buenos Aires&apos; Monument to <B>Satoshi Nakamoto</B>
      </>,
      <>Grand Prize winner, PremioB.Arte 2025 · 5th edition</>,
      <>A work by Ricardo Alonso &amp; Celeste Difabio Videla.</>,
    ],
    ctaTop: "Don't miss the",
    ctaBottom: "Unveiling",
    heroDate: ["October 29", "Open Fest LABITCONF 26"],
    origenTitle: "Where it all began",
    origen: [
      <>A monument to the moment a new era began.</>,
      <>
        <B>The Genesis of Satoshi Nakamoto</B> is a sculptural and architectural installation inspired by{" "}
        <B>Bitcoin&apos;s genesis block, the first block of the chain.</B>
      </>,
      <>
        The work takes the shape of a monumental stainless steel and glass cube, designed to be walked around,
        observed and experienced. Its architecture combines technology, reflections and light to turn a digital
        concept into a unique physical experience.
      </>,
    ],
    cuboAlt: "Render of the monument: a steel and glass cube with a golden figure inside",
    proyectoTitle: "The project",
    proyectoSub: "From the B.Arte Prize to the monument",
    proyecto: [
      <>
        The Genesis of <B>Satoshi Nakamoto</B> was selected as Grand Prize of PremioB.Arte 2025, in its fifth
        edition, in the open call for the project meant to become the first Monument to Satoshi Nakamoto in Buenos
        Aires, Argentina.
      </>,
      <>
        <em style={{ fontWeight: 700, color: "#fff" }}>
          Ricardo Alonso | Engineer
          <br />
          Celeste Difabio Videla | Architect
        </em>
      </>,
      <>
        The project is currently being built for its unveiling at <B>LABITCONF 2026.</B>
      </>,
    ],
    fotos: [
      "PremioB.Arte 2025 awards",
      "The monument at night",
      "PremioB.Arte 2025 winners",
      "The monument by day",
      "Winners at the Bitcoin.ar stand",
    ],
    comunidadTitle: "Born from the community",
    comunidad: [
      <>
        The Genesis of Satoshi Nakamoto was born within Premio B Arte, the first Ibero-American contest whose prizes
        are paid in Bitcoin.
      </>,
      <>
        With the support of <B>Fundación Bitcoin Iberoamérica</B> and under the direction of <B>Aída Pippo</B>,{" "}
        <em style={{ color: "#fff" }}>the monument aims to become a new Bitcoin icon in LATAM</em>
      </>,
    ],
    quienes: "The people making it possible",
  },
} as const;

const sectionTitleStyle: React.CSSProperties = {
  ...labelStyle,
  fontSize: "clamp(34px, 5vw, 64px)",
  lineHeight: 1.05,
  textWrap: "balance",
};

/** Tarjeta de copy con borde Brote (como CopyCard de /mas, pero con negritas). */
function RichCard({
  paragraphs,
  delay = 0.15,
  className = "",
}: {
  paragraphs: readonly React.ReactNode[];
  delay?: number;
  className?: string;
}) {
  return (
    <Reveal
      delay={delay}
      className={`rounded-[2rem] w-full ${className}`}
      style={{ ...CARD, padding: "clamp(24px, 3.5vw, 44px)" }}
    >
      {paragraphs.map((p, i) => (
        <p key={i} className={i === 0 ? undefined : "mt-5"} style={bodyStyle}>
          {p}
        </p>
      ))}
    </Reveal>
  );
}

/**
 * Botón "No te pierdas la INAUGURACIÓN". Abre el checkout de Hallos (la
 * inauguración es exclusiva del ticket Experience). Las dos líneas son a
 * propósito del diseño: cada una va con nowrap, no se parte sola (regla 5).
 * En las slides venía verde (1) y naranja (4); Ignacio pidió unificarlos con
 * el del hero (09/10/2026): verde siempre. El 10/10 la organización lo pidió
 * un 25% más chico (padding, letra, borde y radio escalados a 0.75).
 */
function InaugurationButton({
  top,
  bottom,
  onClick,
}: {
  top: string;
  bottom: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="inline-flex flex-col items-center rounded-[1.9rem]"
      style={{
        ...labelStyle,
        color: GREEN,
        border: `2px solid ${ORANGE}`,
        background: "rgba(0,0,0,0.7)",
        padding: "clamp(12px, 1.5vw, 18px) clamp(21px, 2.6vw, 33px)",
        lineHeight: 1.15,
        cursor: "pointer",
      }}
      whileHover={{ scale: 1.04, boxShadow: `0 0 32px -6px ${ORANGE}` }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <span style={{ whiteSpace: "nowrap", fontSize: "clamp(14px, 1.65vw, 22px)", textTransform: "none" }}>
        {top}
      </span>
      <span style={{ whiteSpace: "nowrap", fontSize: "clamp(15px, 1.9vw, 26px)" }}>{bottom}</span>
    </motion.button>
  );
}

/**
 * Tira de fotos que pasa sola (la organización preguntó en la slide 3 si
 * "pueden ir pasando"). Mismo loop que LogoMarquee: el set se repite
 * REPEATS veces y se recorre 100/REPEATS % para que el reinicio no salte.
 */
// "Quienes lo hacen posible", en el orden de la slide 4. `scale` compensa
// ópticamente: el {(B)} es apaisado y a la misma altura se ve enorme.
// ABC y Premio B.Arte salen recortados de la propia slide (monumento4.png):
// los archivos que mandaron (uuu.png / yyy.png) eran logos blancos aplanados
// sobre fondo blanco. Reemplazar por los originales cuando lleguen.
const LOGO_H = "clamp(72px, 8vw, 112px)";
const LOGOS = [
  { src: "/assets/home/monumento/logo-abc.png", alt: "ABC", aspect: 420 / 324, scale: 1 },
  { src: "/assets/home/monumento/logo-bitcoin-ar.png", alt: "Bitcoin Argentina", aspect: 600 / 249, scale: 0.6 },
  { src: "/assets/home/sponsors/fbi.png", alt: "Fundación Bitcoin Iberoamérica", aspect: 1, scale: 1 },
  { src: "/assets/home/monumento/logo-barte.png", alt: "Premio B.Arte", aspect: 285 / 393, scale: 1.15 },
] as const;

// Orden de la slide 3 (premiación → cubo de noche → ganadores), más las
// dos que llegaron después en Descargas/asd (09/10/2026).
const PHOTOS: readonly { src: string; aspect: number }[] = [
  { src: "/assets/home/monumento/premiacion.jpg", aspect: 1400 / 933 },
  { src: "/assets/home/monumento/bloque-noche.jpg", aspect: 1536 / 1024 },
  { src: "/assets/home/monumento/ganadores.jpg", aspect: 1600 / 753 },
  { src: "/assets/home/monumento/bloque-dia.jpg", aspect: 1536 / 1024 },
  { src: "/assets/home/monumento/ganadores-stand.jpg", aspect: 992 / 663 },
];
const PHOTO_REPEATS = 6;

function PhotoStrip({ alts }: { alts: readonly string[] }) {
  const reduced = useReducedMotion();
  const repeated = Array.from({ length: PHOTO_REPEATS }, () => PHOTOS).flat();
  const h = "clamp(160px, 17vw, 240px)";

  return (
    <div
      className="relative w-full overflow-hidden mt-12"
      style={{
        maskImage: "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
      }}
    >
      <motion.div
        className="flex w-max gap-4"
        animate={reduced ? undefined : { x: ["0%", `-${100 / PHOTO_REPEATS}%`] }}
        transition={{ duration: 45, ease: "linear", repeat: Infinity }}
      >
        {repeated.map((photo, i) => {
          const idx = i % PHOTOS.length;
          return (
            <div
              key={i}
              className="relative shrink-0 overflow-hidden rounded-xl"
              style={{ height: h, aspectRatio: String(photo.aspect) }}
            >
              <Image
                src={photo.src}
                alt={i < PHOTOS.length ? alts[idx] : ""}
                aria-hidden={i >= PHOTOS.length}
                fill
                sizes="(max-width: 640px) 60vw, 520px"
                style={{ objectFit: "cover" }}
              />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default function MonumentoPage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const openCheckout = () => setCheckoutOpen(true);

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#000" }}>
      <Navbar />

      {/* 1 — Hero con video. Opacidad más alta que otros heros de /mas: el
          video está compuesto para ir de fondo, con aire a la izquierda.
          Todo centrado contra la pantalla (`centered`), pedido de la
          organización del 10/10: antes el bloque iba alineado al navbar y el
          botón y la fecha quedaban centrados en una caja corrida. */}
      <MasSection bgVideo={HERO_VIDEO_SRC} bgOpacity={0.6} bgPosition="70% center" first tall centered>
        <Reveal>
          <h1 className="text-center" style={{ ...sectionTitleStyle, color: LIGHT, fontSize: "clamp(32px, 4.6vw, 62px)" }}>
            {t.heroTitleTop}
            <br />
            {t.heroTitleName}
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-8 text-center" style={{ ...bodyStyle, fontSize: "clamp(13px, 1.2vw, 17px)", lineHeight: 1.6 }}>
            {/* Una línea por bloque, cada una balanceada: con <br> el balance
                no actúa y en mobile quedaban "edición" y "Videla" solas. */}
            {t.heroCredits.map((line, i) => (
              <span key={i} className="block" style={{ textWrap: "balance" }}>
                {line}
              </span>
            ))}
          </p>
        </Reveal>

        <Reveal delay={0.2} className="mt-12 flex justify-center">
          <InaugurationButton top={t.ctaTop} bottom={t.ctaBottom} onClick={openCheckout} />
        </Reveal>

        <Reveal delay={0.28}>
          <p
            className="mt-12 text-center"
            style={{
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontWeight: 400,
              textTransform: "uppercase",
              color: LIGHT,
              fontSize: "clamp(16px, 2vw, 28px)",
              textWrap: "balance",
            }}
          >
            {/* En mobile, una línea por parte en vez de partir "Open / Fest". */}
            {t.heroDate[0]}
            <span className="hidden sm:inline"> — </span>
            <br className="sm:hidden" />
            {t.heroDate[1]}
          </p>
        </Reveal>
      </MasSection>

      {/* 2 — El origen de todo: copy a la izquierda, render del cubo a la derecha. */}
      <MasSection id="origen" bg="/assets/home/hashes.jpg" bgOpacity={0.15}>
        <Reveal>
          <h2 style={{ ...sectionTitleStyle, color: "#fff" }}>
            {t.origenTitle}
          </h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
          <RichCard paragraphs={t.origen} />
          <Reveal delay={0.2} className="relative w-full max-w-[560px] mx-auto" style={{ aspectRatio: "1200 / 1177" }}>
            <Image
              src="/assets/home/monumento/cubo.jpg"
              alt={t.cuboAlt}
              fill
              sizes="(max-width: 1024px) 90vw, 560px"
              style={{ objectFit: "contain" }}
            />
          </Reveal>
        </div>
      </MasSection>

      {/* 3 — El proyecto: card ancha + tira de fotos en movimiento. */}
      <MasSection id="proyecto" bg="/assets/home/hexmap.jpg" bgOpacity={0.15}>
        <Reveal>
          <h2 style={{ ...sectionTitleStyle, color: LIGHT }}>{t.proyectoTitle}</h2>
          <p style={{ ...sectionTitleStyle, color: ORANGE, fontSize: "clamp(20px, 3vw, 40px)", marginTop: 4 }}>
            {t.proyectoSub}
          </p>
        </Reveal>
        <RichCard paragraphs={t.proyecto} className="mt-6" />
        <PhotoStrip alts={t.fotos} />
      </MasSection>

      {/* 4 — Nace de la comunidad: card + CTA a la derecha, logos abajo. */}
      <MasSection id="comunidad" bg="/assets/home/hashes.jpg" bgOpacity={0.15}>
        <Reveal>
          <h2 style={{ ...sectionTitleStyle, color: GREEN }}>{t.comunidadTitle}</h2>
        </Reveal>
        <div className="mt-8 flex flex-col lg:flex-row lg:items-center gap-8">
          <RichCard paragraphs={t.comunidad} className="lg:flex-1" />
          <Reveal delay={0.25} className="flex justify-center lg:shrink-0">
            <InaugurationButton top={t.ctaTop} bottom={t.ctaBottom} onClick={openCheckout} />
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <h3
            className="mt-16 text-center"
            style={{
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontWeight: 400,
              color: ORANGE,
              fontSize: "clamp(26px, 3.6vw, 48px)",
              textWrap: "balance",
            }}
          >
            {t.quienes}
          </h3>
        </Reveal>
        {/* Fila fija, sin marquee: pedido de Ignacio (09/10/2026) para esta
            sección, aunque el resto del sitio usa LogoMarquee. */}
        <div className="mt-10 grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center items-center gap-x-10 gap-y-8 sm:gap-x-16">
          {LOGOS.map((logo, i) => (
            <Reveal
              key={logo.src}
              delay={0.15 + i * 0.08}
              className="relative mx-auto sm:mx-0"
              style={{ height: `calc(${LOGO_H} * ${logo.scale})`, aspectRatio: String(logo.aspect) }}
            >
              <Image src={logo.src} alt={logo.alt} fill sizes="220px" style={{ objectFit: "contain" }} />
            </Reveal>
          ))}
        </div>
      </MasSection>

      <MasNav />
      <Footer lang={lang} />
      <QaChatWidget />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </main>
  );
}
