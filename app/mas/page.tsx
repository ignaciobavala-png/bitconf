"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/home/Navbar";
import QaChatWidget from "@/components/home/QaChatWidget";
import Footer from "@/components/home/Footer";
import Reveal from "@/components/home/Reveal";
import ParallaxBg from "@/components/home/ParallaxBg";
import { useLangStore } from "@/lib/store/lang";
import { getSupabaseClient } from "@/lib/supabase/client";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const lightStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 300,
};

// Estilo compartido de las cards con borde de sección (todas las de
// "Beneficios", los 2 pasos de "¿Querés estar dentro?" y el buscador de
// universidades) — el machete las dibuja todas con el mismo borde
// redondeado en Brote #ABF760 sobre fondo oscuro semitransparente.
function cardStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    border: "2px solid #ABF760",
    borderRadius: 24,
    background: "rgba(23,22,22,0.55)",
    ...extra,
  };
}

// Pill de acción (participá / más info / UNITE) — fondo Brote, texto oscuro.
function PillLink({
  href,
  children,
  disabled,
}: {
  href?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const style: React.CSSProperties = {
    ...labelStyle,
    display: "inline-block",
    color: "#171616",
    background: disabled ? "rgba(171,247,96,0.35)" : "#ABF760",
    borderRadius: 999,
    fontSize: "clamp(12px, 1vw, 14px)",
    padding: "10px 24px",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.7 : 1,
  };
  if (disabled || !href) {
    return (
      <span style={style} title="Próximamente">
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-transform duration-200 hover:scale-105"
      style={style}
    >
      {children}
    </a>
  );
}

// Video de fondo del hero: pieza literal que mandaron los diseñadores
// (`~/Descargas/MAS-BITCONF/DISEÑO WEB.mp4`), un reel de 16s con 4 escenas de
// campaña OOH/print de EDUHUB en loop. Recomprimido (h264 crf 34, sin audio —
// el original no traía pista de audio y el <video> va muted igual — 3,18MB →
// 1,55MB, mismo 1920x1080) y servido desde el bucket público de Supabase
// (media/mas/hero-bg.mp4), mismo patrón que HERO_VIDEO_URL en app/page.tsx:
// no se trackea en git.
const HERO_VIDEO_SRC =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/mas/hero-bg.mp4";

const T = {
  es: {
    headline: "LA PRÓXIMA GENERACIÓN YA ESTÁ DENTRO.",
    soyAlumnoL1: "Soy",
    soyAlumnoL2: "Alumno",
    soyUniversidadL1: "Soy",
    soyUniversidadL2: "Universidad",

    queEsTitle: "¿Qué es EDU HUB?",
    queEsBody1:
      "EDU Hub es la comunidad de LABITCONF que conecta a estudiantes, profesores, alumni y universidades con el ecosistema de Bitcoin, tecnología e innovación.",
    queEsBody2:
      "Una experiencia diseñada para aprender, conectar y construir, con acceso a contenidos exclusivos, workshops, networking, Hackathon, LABITCONF Bitcoin College y experiencias especiales durante LABITCONF.",
    queEsAudiencia: "ESTUDIANTES • PROFESORES • ALUMNI • UNIVERSIDADES",

    beneficiosTitle: "Beneficios y experiencias",
    cardEspacioTitle: "Espacio físico exclusivo en el evento",
    cardHackathonTitle: "Hackathon EDU HUB",
    cardHackathonPremio: "+ USD 1500 en premios",
    cardHackathonBody:
      "Un hackathon de innovación donde la comunidad EDU HUB trabaja durante los dos días del evento, para crear soluciones a desafíos reales y presentar sus proyectos ante un jurado.",
    cardHackathonParticipa: "participá",
    cardHackathonMasInfo: "más info",
    cardBootcampTitle: "Bootcamp - Workshops y charlas",
    cardBootcampMasInfo: "más info",
    cardWhatsappTitle: "Comunidad de WhatsApp",
    cardCollegeTitle: "LABITCONF Bitcoin College",
    cardCollegeBody:
      "LABITCONF Bitcoin College es una experiencia formativa inmersiva en el ecosistema Bitcoin, que se desarrolla en el marco de LABITCONF 2026.",
    cardCollegeUnite: "UNITE",
    cardCertificadoTitle: "Certificado oficial",
    cardNetworkingTitle: "Networking",

    queresTitle: "¿Querés estar dentro?",
    step1Title: "Soy Universidad",
    step1Body:
      "Acredita a tu universidad en el EDU HUB por medio de este form. Tus alumnos acceden a entradas con descuento 100%, eventos exclusivos para universidades acreditadas y certificados.",
    step2Title: "Soy Alumno",
    step2Body:
      "Si tu uni está acreditada, recibirás un código para sacar tu entrada. Si no está acreditada, pídeles que se acrediten.",
    step2Cta: "Ver si mi uni está acreditada →",
    closingLine: "Tu universidad → tu código → tu entrada → EDU Hub → la comunidad.",
    scrollHint: "↓ scroll para descubrir",

    acreditadasTitle: "Universidades acreditadas",
    searchLabel: "¿Tu universidad forma parte del EDU HUB?",
    searchPlaceholder: "Buscá el nombre de tu universidad",
    searchIdle: "Escribí el nombre de tu universidad para verificar.",
    searchYes: "✓ Está acreditada.",
    searchNo: "Todavía no está acreditada — pedile que complete el formulario de arriba.",
    searchLoading: "Buscando…",
  },
  en: {
    headline: "THE NEXT GENERATION IS ALREADY IN.",
    soyAlumnoL1: "I'm a",
    soyAlumnoL2: "Student",
    soyUniversidadL1: "I'm a",
    soyUniversidadL2: "University",

    queEsTitle: "What is EDU HUB?",
    queEsBody1:
      "EDU Hub is LABITCONF's community that connects students, professors, alumni and universities with the Bitcoin, technology and innovation ecosystem.",
    queEsBody2:
      "An experience designed to learn, connect and build, with access to exclusive content, workshops, networking, Hackathon, LABITCONF Bitcoin College and special experiences during LABITCONF.",
    queEsAudiencia: "STUDENTS • PROFESSORS • ALUMNI • UNIVERSITIES",

    beneficiosTitle: "Benefits and experiences",
    cardEspacioTitle: "Exclusive physical space at the event",
    cardHackathonTitle: "Hackathon EDU HUB",
    cardHackathonPremio: "+ USD 1500 in prizes",
    cardHackathonBody:
      "An innovation hackathon where the EDU HUB community works during the two days of the event, to build solutions to real challenges and present their projects to a jury.",
    cardHackathonParticipa: "join in",
    cardHackathonMasInfo: "more info",
    cardBootcampTitle: "Bootcamp - Workshops and talks",
    cardBootcampMasInfo: "more info",
    cardWhatsappTitle: "WhatsApp community",
    cardCollegeTitle: "LABITCONF Bitcoin College",
    cardCollegeBody:
      "LABITCONF Bitcoin College is an immersive learning experience in the Bitcoin ecosystem, held within LABITCONF 2026.",
    cardCollegeUnite: "JOIN IN",
    cardCertificadoTitle: "Official certificate",
    cardNetworkingTitle: "Networking",

    queresTitle: "Want to be part of it?",
    step1Title: "I'm a University",
    step1Body:
      "Accredit your university in the EDU HUB through this form. Your students get 100% discounted tickets, exclusive events for accredited universities, and certificates.",
    step2Title: "I'm a Student",
    step2Body:
      "If your university is accredited, you'll get a code to claim your ticket. If it isn't, ask it to get accredited.",
    step2Cta: "Check if my university is accredited →",
    closingLine: "Your university → your code → your ticket → EDU Hub → the community.",
    scrollHint: "↓ scroll to discover",

    acreditadasTitle: "Accredited universities",
    searchLabel: "Is your university part of the EDU HUB?",
    searchPlaceholder: "Search your university's name",
    searchIdle: "Type your university's name to check.",
    searchYes: "✓ It's accredited.",
    searchNo: "Not accredited yet — ask it to fill out the form above.",
    searchLoading: "Searching…",
  },
} as const;

// Links reales que dieron los diseñadores junto con el boceto (no son
// placeholders): grupo de WhatsApp para alumnos y formulario para universidades.
const SOY_ALUMNO_HREF = "https://chat.whatsapp.com/GaZPl2xGppVGJ1Y1r9vJEo";
const SOY_UNIVERSIDAD_HREF = "https://forms.gle/impFDrqXVFmxUrxV7";

// Beneficios y experiencias — links del machete (MAS-BITCONF/29.png, 30.png).
const HACKATHON_LUMA_HREF = "https://luma.com/cwhw1uls";
// Bases del hackathon: el machete dice explícitamente "no están definidas
// todavía" — el botón queda deshabilitado hasta que Ignacio pase el link.
const HACKATHON_BASES_HREF: string | undefined = undefined;
// Bootcamp/Workshops "más info" reusa el mismo grupo de WhatsApp de alumnos.
const BOOTCAMP_WHATSAPP_HREF = SOY_ALUMNO_HREF;
// "UNITE" del Bitcoin College: carpeta de Drive con la info del college,
// confirmada por Ignacio (22/09/2026).
const BITCOIN_COLLEGE_UNITE_HREF =
  "https://drive.google.com/drive/folders/1TsUOt_p5JIfabuPbLo_WMkD_Rvr1Plza?usp=drive_link";

export default function MasPage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#171616" }}>
      <Navbar />

      {/* Hero — video de campaña full-bleed (1:1 screen), overlay oscuro para
          legibilidad del copy + CTAs encima */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-end overflow-hidden px-6 pb-16 sm:pb-20"
        style={{ zIndex: 1, background: "#000" }}
      >
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{ zIndex: 0 }}
          aria-hidden
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>

        {/* Overlay: oscurece todo el video (el reel trae texto propio en
            varias escenas) para que el copy y los CTA de la UI no compitan */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, rgba(23,22,22,0.55) 0%, rgba(23,22,22,0.35) 45%, rgba(23,22,22,0.85) 100%)",
          }}
        />

        {/* CTAs — flanquean la línea central del hero, a la altura media
            (posición y ancho del boceto: no son pills chicas centradas, son
            dos placas anchas una a cada lado del eje vertical) */}
        <Reveal
          delay={0.1}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 sm:px-10"
          style={{ zIndex: 2 }}
        >
          {/* Botones al 80% del tamaño original + más separados entre sí
              (gap más grande) — pedido explícito, no van a full width del
              contenedor: por eso flex-1 pasó a flex-none con un ancho fijo
              en vez de repartir el maxWidth del contenedor. */}
          <div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-[40px] sm:gap-[100px]">
            <a
              href={SOY_ALUMNO_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-none flex-col items-center justify-center rounded-2xl border-2 text-center transition-transform duration-200 hover:scale-[1.03]"
              style={{
                ...labelStyle,
                color: "#E6EEF2",
                background: "#FF4E01",
                borderColor: "#ABF760",
                width: "clamp(110px, 18vw, 220px)",
                fontSize: "clamp(11px, 1.45vw, 16px)",
                lineHeight: 1.3,
                padding: "clamp(16px, 2.4vw, 27px) clamp(9px, 1.8vw, 18px)",
              }}
            >
              <span>{t.soyAlumnoL1}</span>
              <span>{t.soyAlumnoL2}</span>
            </a>
            <a
              href={SOY_UNIVERSIDAD_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-none flex-col items-center justify-center rounded-2xl border-2 text-center transition-transform duration-200 hover:scale-[1.03]"
              style={{
                ...labelStyle,
                color: "#E6EEF2",
                background: "#FFAB0B",
                borderColor: "#ABF760",
                width: "clamp(110px, 18vw, 220px)",
                fontSize: "clamp(11px, 1.45vw, 16px)",
                lineHeight: 1.3,
                padding: "clamp(16px, 2.4vw, 27px) clamp(9px, 1.8vw, 18px)",
              }}
            >
              <span>{t.soyUniversidadL1}</span>
              <span>{t.soyUniversidadL2}</span>
            </a>
          </div>
        </Reveal>

        {/* Headline — centrada, un solo renglón: sin max-w (usa todo el
            ancho disponible) y el mínimo del clamp baja con el vw para que
            en mobile achique lo suficiente en vez de cortar línea. */}
        <Reveal delay={0.2} className="relative w-full" style={{ zIndex: 2 }}>
          <h1
            style={{
              ...labelStyle,
              color: "#E6EEF2",
              textAlign: "center",
              fontSize: "clamp(11px, 3.6vw, 44px)",
              lineHeight: 1.15,
              whiteSpace: "nowrap",
              textShadow: "0 2px 24px rgba(0,0,0,0.6)",
            }}
          >
            {t.headline}
          </h1>
        </Reveal>
      </section>

      {/* ¿Qué es EDU HUB? — MAS-BITCONF/28.png. Mismo fondo punteado
          (pixel-grid-2 invertido) ya usado en /comunidad, en vez de intentar
          reproducir el detalle de la ballena punteada con líneas HUD del
          mock: es un efecto de Figma sobre el mismo asset, no un archivo
          nuevo del banco de diseño. */}
      <section id="que-es" className="relative px-6 sm:px-10 py-24 sm:py-32 overflow-hidden">
        <ParallaxBg src="/assets/home/pixel-grid-2.png" opacity={0.15} filter="invert(1)" drift={10} />

        <div className="relative mx-auto w-full max-w-5xl" style={{ zIndex: 1 }}>
          <Reveal>
            <h2
              style={{
                ...labelStyle,
                color: "#FF4E01",
                fontSize: "clamp(28px, 5vw, 56px)",
                lineHeight: 1.1,
                marginBottom: 32,
              }}
            >
              {t.queEsTitle}
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div style={cardStyle({ padding: "clamp(20px, 3vw, 36px)" })}>
              <p style={{ ...lightStyle, color: "#E6EEF2", fontSize: "clamp(15px, 1.6vw, 19px)", lineHeight: 1.5 }}>
                {t.queEsBody1}
              </p>
              <p
                style={{
                  ...lightStyle,
                  color: "#E6EEF2",
                  fontSize: "clamp(15px, 1.6vw, 19px)",
                  lineHeight: 1.5,
                  marginTop: 20,
                }}
              >
                {t.queEsBody2}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <p
              style={{
                ...labelStyle,
                color: "#E6EEF2",
                fontSize: "clamp(16px, 2.4vw, 26px)",
                marginTop: 40,
              }}
            >
              {t.queEsAudiencia}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Beneficios y experiencias — MAS-BITCONF/29.png + 30.png (un solo
          scroll partido en dos capturas por el diseñador). Grid de 2
          columnas: izquierda espacio físico + hackathon + bootcamp,
          derecha whatsapp + bitcoin college + certificado/networking. */}
      <section id="beneficios" className="relative px-6 sm:px-10 py-24 sm:py-32 overflow-hidden" style={{ background: "#000" }}>
        <div className="relative mx-auto w-full max-w-6xl">
          <Reveal>
            <h2
              style={{
                ...labelStyle,
                color: "#FF4E01",
                fontSize: "clamp(26px, 4.4vw, 48px)",
                lineHeight: 1.1,
                marginBottom: 32,
              }}
            >
              {t.beneficiosTitle}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="flex flex-col gap-6">
              <Reveal delay={0.05}>
                <div style={cardStyle({ padding: "24px 28px" })}>
                  <h3 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(16px, 1.8vw, 20px)" }}>
                    {t.cardEspacioTitle}
                  </h3>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div style={cardStyle({ padding: "28px" })}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <h3 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(18px, 2vw, 24px)" }}>
                      {t.cardHackathonTitle}
                    </h3>
                    <span
                      style={{
                        ...labelStyle,
                        color: "#171616",
                        background: "#FF4E01",
                        borderRadius: 999,
                        fontSize: "clamp(11px, 0.9vw, 13px)",
                        padding: "6px 14px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.cardHackathonPremio}
                    </span>
                  </div>
                  <p
                    style={{
                      ...lightStyle,
                      color: "#E6EEF2",
                      fontSize: "clamp(14px, 1.3vw, 16px)",
                      lineHeight: 1.5,
                      marginTop: 16,
                    }}
                  >
                    {t.cardHackathonBody}
                  </p>
                  <div className="flex items-center gap-3 mt-6">
                    <PillLink href={HACKATHON_LUMA_HREF}>{t.cardHackathonParticipa}</PillLink>
                    <PillLink href={HACKATHON_BASES_HREF} disabled={!HACKATHON_BASES_HREF}>
                      {t.cardHackathonMasInfo}
                    </PillLink>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <div style={cardStyle({ padding: "28px" })}>
                  <h3 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(18px, 2vw, 24px)" }}>
                    {t.cardBootcampTitle}
                  </h3>
                  <div className="mt-6">
                    <PillLink href={BOOTCAMP_WHATSAPP_HREF}>{t.cardBootcampMasInfo}</PillLink>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Columna derecha */}
            <div className="flex flex-col gap-6">
              <Reveal delay={0.05}>
                <div style={cardStyle({ padding: "24px 28px" })}>
                  <div className="flex items-center justify-between gap-4">
                    <h3 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(16px, 1.8vw, 20px)" }}>
                      {t.cardWhatsappTitle}
                    </h3>
                    <a
                      href={SOY_ALUMNO_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-transform duration-200 hover:scale-110"
                      aria-label={t.cardWhatsappTitle}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#ABF760" aria-hidden>
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.44.79 3.06 1.2 4.71 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.8c2.16 0 4.19.84 5.72 2.37a8.07 8.07 0 0 1 2.38 5.74c0 4.47-3.64 8.1-8.11 8.1a8.1 8.1 0 0 1-4.11-1.12l-.3-.17-3.12.82.83-3.04-.19-.31a8.05 8.05 0 0 1-1.24-4.31c0-4.47 3.64-8.08 8.14-8.08m-4.49 4.65c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.16 1.74 2.77 4.29 3.78 2.12.84 2.55.67 3.01.63.46-.04 1.49-.61 1.7-1.19.21-.59.21-1.09.15-1.19-.06-.11-.23-.17-.48-.29-.25-.13-1.49-.74-1.72-.82-.23-.09-.4-.13-.57.13-.17.25-.65.82-.8.99-.15.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.57-1.4-.79-1.91-.2-.5-.42-.43-.57-.44Z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div style={cardStyle({ padding: "28px" })}>
                  <h3 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(18px, 2vw, 24px)" }}>
                    {t.cardCollegeTitle}
                  </h3>
                  <p
                    style={{
                      ...lightStyle,
                      color: "#E6EEF2",
                      fontSize: "clamp(14px, 1.3vw, 16px)",
                      lineHeight: 1.5,
                      marginTop: 16,
                    }}
                  >
                    {t.cardCollegeBody}
                  </p>
                  <div className="mt-6">
                    <PillLink href={BITCOIN_COLLEGE_UNITE_HREF}>{t.cardCollegeUnite}</PillLink>
                  </div>
                </div>
              </Reveal>

              <div className="grid grid-cols-2 gap-6">
                <Reveal delay={0.15}>
                  <div style={cardStyle({ padding: "24px", textAlign: "center" })}>
                    <h3 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(14px, 1.4vw, 17px)" }}>
                      {t.cardCertificadoTitle}
                    </h3>
                  </div>
                </Reveal>
                <Reveal delay={0.18}>
                  <div style={cardStyle({ padding: "24px", textAlign: "center" })}>
                    <h3 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(14px, 1.4vw, 17px)" }}>
                      {t.cardNetworkingTitle}
                    </h3>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ¿Querés estar dentro? — MAS-BITCONF/31.png. El paso 2 no es un link
          externo: "Ver si mi uni está acreditada" scrollea a la sección
          siguiente (ancla #universidades-acreditadas). */}
      <section id="queres-estar-dentro" className="relative px-6 sm:px-10 py-24 sm:py-32 overflow-hidden">
        <ParallaxBg src="/assets/home/pixel-grid-2.png" opacity={0.15} filter="invert(1)" drift={10} />

        <div className="relative mx-auto w-full max-w-5xl text-center" style={{ zIndex: 1 }}>
          <Reveal>
            <h2
              style={{
                ...labelStyle,
                color: "#FF4E01",
                fontSize: "clamp(28px, 5vw, 56px)",
                lineHeight: 1.1,
                marginBottom: 40,
              }}
            >
              {t.queresTitle}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <Reveal delay={0.05}>
              <div style={cardStyle({ padding: "28px 32px", height: "100%" })}>
                <span style={{ ...labelStyle, color: "#A5A8B1", fontSize: "clamp(32px, 4vw, 48px)" }}>1</span>
                <h3
                  style={{
                    ...labelStyle,
                    color: "#E6EEF2",
                    fontSize: "clamp(17px, 1.8vw, 21px)",
                    marginTop: 8,
                  }}
                >
                  {t.step1Title}
                </h3>
                <p
                  style={{
                    ...lightStyle,
                    color: "#E6EEF2",
                    fontSize: "clamp(14px, 1.2vw, 15px)",
                    lineHeight: 1.5,
                    marginTop: 12,
                  }}
                >
                  {t.step1Body}
                </p>
                <a
                  href={SOY_UNIVERSIDAD_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-5 transition-opacity duration-200 hover:opacity-70"
                  style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(12px, 1vw, 14px)" }}
                >
                  →
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div style={cardStyle({ padding: "28px 32px", height: "100%" })}>
                <span style={{ ...labelStyle, color: "#A5A8B1", fontSize: "clamp(32px, 4vw, 48px)" }}>2</span>
                <h3
                  style={{
                    ...labelStyle,
                    color: "#E6EEF2",
                    fontSize: "clamp(17px, 1.8vw, 21px)",
                    marginTop: 8,
                  }}
                >
                  {t.step2Title}
                </h3>
                <p
                  style={{
                    ...lightStyle,
                    color: "#E6EEF2",
                    fontSize: "clamp(14px, 1.2vw, 15px)",
                    lineHeight: 1.5,
                    marginTop: 12,
                  }}
                >
                  {t.step2Body}
                </p>
                <a
                  href="#universidades-acreditadas"
                  className="inline-block mt-5 transition-opacity duration-200 hover:opacity-70"
                  style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(12px, 1vw, 14px)" }}
                >
                  {t.step2Cta}
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.16}>
            <p
              style={{
                ...labelStyle,
                color: "#E6EEF2",
                fontSize: "clamp(15px, 2vw, 22px)",
                lineHeight: 1.4,
                marginTop: 48,
              }}
            >
              {t.closingLine}
            </p>
          </Reveal>

          <p style={{ ...lightStyle, color: "#A5A8B1", fontSize: 14, marginTop: 24 }}>{t.scrollHint}</p>
        </div>
      </section>

      {/* Universidades acreditadas — MAS-BITCONF/32.png. Buscador real
          contra la tabla edu_hub_universities (espejo del Google Sheet del
          cliente) + marquee de logos en loop. Sin datos cargados todavía:
          el buscador funciona pero no va a encontrar nada hasta que se
          importe la lista real. */}
      <section
        id="universidades-acreditadas"
        className="relative px-6 sm:px-10 py-24 sm:py-32 overflow-hidden"
        style={{ background: "#000" }}
      >
        <div className="relative mx-auto w-full max-w-5xl">
          <Reveal>
            <h2
              style={{
                ...labelStyle,
                color: "#FF4E01",
                fontSize: "clamp(24px, 4vw, 44px)",
                lineHeight: 1.1,
                marginBottom: 32,
              }}
            >
              {t.acreditadasTitle}
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <UniversitySearch t={t} />
          </Reveal>
        </div>

        <Reveal delay={0.14}>
          <div className="mt-16">
            <LogoMarquee />
          </div>
        </Reveal>
      </section>

      <Footer lang={lang} />

      <QaChatWidget />
    </main>
  );
}

type MasCopy = (typeof T)[keyof typeof T];

type Uni = { name: string; accredited: boolean };

// Buscador contra edu_hub_universities. Carga la tabla entera una sola vez
// (la lista de universidades acreditadas es chica, no hace falta paginar ni
// pegarle a Supabase en cada tecla) y filtra en el cliente.
function UniversitySearch({ t }: { t: MasCopy }) {
  const [query, setQuery] = useState("");
  const [unis, setUnis] = useState<Uni[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSupabaseClient()
      .from("edu_hub_universities")
      .select("name, accredited")
      .then(({ data }) => {
        if (!cancelled) setUnis((data as Uni[] | null) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const q = query.trim().toLowerCase();
  const match = q && unis ? unis.find((u) => u.name.toLowerCase().includes(q)) : undefined;

  let feedback: string | null = null;
  if (q) {
    if (unis === null) feedback = t.searchLoading;
    else feedback = match?.accredited ? t.searchYes : t.searchNo;
  }

  return (
    <div style={cardStyle({ padding: "clamp(20px, 3vw, 32px)" })}>
      <label
        htmlFor="uni-search"
        style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(15px, 1.6vw, 19px)" }}
      >
        {t.searchLabel}
      </label>
      <input
        id="uni-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.searchPlaceholder}
        style={{
          ...lightStyle,
          display: "block",
          width: "100%",
          marginTop: 16,
          background: "rgba(230,238,242,0.06)",
          border: "1px solid rgba(230,238,242,0.2)",
          borderRadius: 12,
          color: "#E6EEF2",
          fontSize: 16,
          padding: "14px 18px",
          outline: "none",
        }}
      />
      <p
        style={{
          ...lightStyle,
          color: match?.accredited ? "#ABF760" : "#A5A8B1",
          fontSize: 14,
          marginTop: 12,
          minHeight: 20,
        }}
      >
        {feedback ?? t.searchIdle}
      </p>
    </div>
  );
}

// Marquee de logos de universidades — placeholder ("logo") hasta que
// carguemos los assets reales de la carpeta de Drive del machete. Dos
// carriles en direcciones opuestas, cada uno con el set duplicado y
// animado a -50% de su propio ancho (sin salto, ver skill
// css-marquee-infinito-dos-tracks) — mismo patrón que las lanes de
// speakers, reducido a 2 filas porque acá son logos, no cards variadas.
function MarqueeRow({ reverse, duration }: { reverse?: boolean; duration: number }) {
  const items = Array.from({ length: 10 }, (_, i) => i);
  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex w-max items-center gap-16"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((i, idx) => (
          <span
            key={`${i}-${idx}`}
            style={{
              ...labelStyle,
              color: "#E6EEF2",
              opacity: 0.35,
              fontSize: "clamp(22px, 3vw, 36px)",
              whiteSpace: "nowrap",
            }}
          >
            logo
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function LogoMarquee() {
  return (
    <div className="flex flex-col gap-6">
      <MarqueeRow duration={38} />
      <MarqueeRow duration={44} reverse />
    </div>
  );
}
