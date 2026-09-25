"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/home/Navbar";
import QaChatWidget from "@/components/home/QaChatWidget";
import Footer from "@/components/home/Footer";
import MasNav from "@/components/mas/MasNav";
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

// Largo del desvanecido de cada fondo en los bordes de su sección: el
// fondo de un scroll se funde con el del siguiente en vez de cortar en seco.
const SECTION_FADE = "180px";

// Altura compartida por la card de Bootcamp y el par Certificado/Networking:
// están en columnas de flex distintas (no se alinean solas por grid), así que
// sin este mínimo común las dos chicas quedan bastante más bajas que Bootcamp.
const BOOTCAMP_ROW_MIN_H = "132px";

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
    queEsAudiencia: ["ESTUDIANTES", "PROFESORES", "ALUMNI", "UNIVERSIDADES"],

    beneficiosTitle: "Beneficios y experiencias",
    cardEspacioTitle: "Espacio físico exclusivo en el evento",
    cardHackathonTitle: "Hackathon EDU HUB",
    cardHackathonPremio: "+ USD 1500 en premios",
    cardHackathonBody:
      "2 días. 4 tracks.\n\nEl corazón del EDU HUB. Equipos de estudiantes de universidades acreditadas detectan un problema real y construyen una solución funcional en 48 horas, dentro de LABITCONF, en Costa Salguero.\n\nElegís uno de 4 tracks (Inclusión Financiera, Nueva Educación, Creator Economy, Impacto y Comunidad), tenés mentores todo el camino, y cerrás con premiación en el stage de LABITCONF y la fiesta de Halloween.\n\nIncluye Bootcamp previo de 4 encuentros en octubre para llegar afilado.",
    cardHackathonParticipa: "participá",
    cardHackathonMasInfo: "más info",
    cardBootcampPrefix: "Bootcamp -",
    cardBootcampLocked: "Workshops y charlas",
    cardBootcampMasInfo: "más info",
    cardWhatsappTitle: "Comunidad de WhatsApp",
    cardCollegeTitle: "LABITCONF Bitcoin College",
    cardCollegeBody:
      "Un día. Certificación real. Antes de LABITCONF.\n\nUn día completo, IRL, de formación intensiva en Bitcoin, con certificación conjunta de la Universidad Champagnat y la Escuelita Bitcoin. Jueves 29 de octubre, en la Universidad del Salvador (USAL), Buenos Aires. Abierto a toda la comunidad universitaria de Argentina y países vecinos: estudiantes, alumni y profesores. ¿Sos de una universidad del interior? Podés postularte a una beca de movilidad de hasta USD 1.000 por delegación.",
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
    step1Cta: "Acredita tu universidad →",
    step2Cta: "Ver si mi uni está acreditada →",
    closingLine: "Tu universidad → tu código → tu entrada → EDU Hub → la comunidad.",

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
    queEsAudiencia: ["STUDENTS", "PROFESSORS", "ALUMNI", "UNIVERSITIES"],

    beneficiosTitle: "Benefits and experiences",
    cardEspacioTitle: "Exclusive physical space at the event",
    cardHackathonTitle: "Hackathon EDU HUB",
    cardHackathonPremio: "+ USD 1500 in prizes",
    cardHackathonBody:
      "2 days. 4 tracks.\n\nThe heart of EDU HUB. Teams of students from accredited universities identify a real problem and build a working solution in 48 hours, inside LABITCONF, at Costa Salguero.\n\nPick one of 4 tracks (Financial Inclusion, New Education, Creator Economy, Impact and Community), get mentors along the way, and wrap up with an awards ceremony on the LABITCONF stage and the Halloween party.\n\nIncludes a 4-session Bootcamp in October to get you ready.",
    cardHackathonParticipa: "join in",
    cardHackathonMasInfo: "more info",
    cardBootcampPrefix: "Bootcamp -",
    cardBootcampLocked: "Workshops and talks",
    cardBootcampMasInfo: "more info",
    cardWhatsappTitle: "WhatsApp community",
    cardCollegeTitle: "LABITCONF Bitcoin College",
    cardCollegeBody:
      "One day. Real certification. Before LABITCONF.\n\nA full day, IRL, of intensive Bitcoin training, with joint certification from Universidad Champagnat and Escuelita Bitcoin. Thursday, October 29, at Universidad del Salvador (USAL), Buenos Aires. Open to the entire university community of Argentina and neighboring countries: students, alumni and professors. Are you from a university outside Buenos Aires? You can apply for a mobility scholarship of up to USD 1,000 per delegation.",
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
    step1Cta: "Accredit your university →",
    step2Cta: "Check if my university is accredited →",
    closingLine: "Your university → your code → your ticket → EDU Hub → the community.",

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

// Flyers de la organización (Descargas/EDU HUB - Flyers, 23/09/2026),
// recomprimidos (BITCOIN COLLEGE.png pesaba 11,8MB a 4320x5760) y subidos
// al mismo bucket que el resto de los assets de esta página.
const HACKATHON_FLYER_SRC =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/mas/edu-hub/hackathon.jpg";
// Flyer completo (foto + título + calendario + footer), no el recorte del
// calendario — a 3:4, el aspect ratio real del flyer original.
const BITCOIN_COLLEGE_FLYER_SRC =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/mas/edu-hub/bitcoin-college.jpg";
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
              "linear-gradient(to bottom, rgba(23,22,22,0.55) 0%, rgba(23,22,22,0.35) 45%, rgba(23,22,22,0.85) 80%, #171616 100%)",
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
              fontSize: "clamp(10.5px, 3.42vw, 41.8px)",
              lineHeight: 1.15,
              whiteSpace: "nowrap",
              textShadow: "0 2px 24px rgba(0,0,0,0.6)",
            }}
          >
            {t.headline}
          </h1>
        </Reveal>
      </section>

      {/* ¿Qué es EDU HUB? — MAS-BITCONF/28.png. Fondo de hashes (hashes.jpg)
          en vez de pixel-grid-2: esta página ya usa pixel-grid-2 invertido
          en la sección "¿Querés estar dentro?", así que acá se varía. */}
      <section id="que-es" className="relative px-6 sm:px-10 py-24 sm:py-32 overflow-hidden">
        <ParallaxBg src="/assets/home/hashes.jpg" opacity={0.25} drift={10} fadeEdges={SECTION_FADE} />

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
            {/* text-align-last justifica el renglón (el único, en desktop; cada
                uno si wrappea en mobile) para que llegue exacto al borde derecho
                de la caja de arriba — mismo ancho, sin tocar el tamaño de fuente
                a mano por breakpoint. */}
            <p
              style={{
                ...labelStyle,
                color: "#E6EEF2",
                fontSize: "clamp(16px, 2.6vw, 29px)",
                marginTop: 40,
                textAlign: "justify",
                textAlignLast: "justify",
              }}
            >
              {t.queEsAudiencia.join(" • ")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Beneficios y experiencias — MAS-BITCONF/29.png + 30.png (un solo
          scroll partido en dos capturas por el diseñador). Grid de 2
          columnas: izquierda espacio físico + hackathon + bootcamp,
          derecha whatsapp + bitcoin college + certificado/networking. */}
      <section id="beneficios" className="relative px-6 sm:px-10 py-24 sm:py-32 overflow-hidden">
        {/* Íconos wireframe: mismo fondo y degradé que en /comunidad; no se
            repite con los vecinos (pixel-grid arriba y abajo) */}
        <ParallaxBg src="/assets/home/fondo-iconos.jpg" opacity={0.22} drift={12} fadeEdges={SECTION_FADE} />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.35) 32%, rgba(13,13,11,0.35) 68%, #171616 100%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-6xl" style={{ zIndex: 2 }}>
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
                <div
                  style={cardStyle({ padding: "16px", overflow: "hidden" })}
                  className="flex flex-col sm:flex-row sm:items-start gap-5 sm:min-h-[410px]"
                >
                  <div
                    className="relative shrink-0 w-full sm:w-[220px] rounded-2xl overflow-hidden"
                    style={{ aspectRatio: "4 / 5" }}
                  >
                    <Image
                      src={HACKATHON_FLYER_SRC}
                      alt={t.cardHackathonTitle}
                      fill
                      sizes="(max-width: 640px) 100vw, 220px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "12px 12px 12px 0" }} className="flex-1">
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
                        whiteSpace: "pre-line",
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
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <div
                  style={cardStyle({
                    padding: "28px",
                    minHeight: BOOTCAMP_ROW_MIN_H,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  })}
                >
                  <h3 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(18px, 2vw, 24px)", lineHeight: 1.3 }}>
                    {t.cardBootcampPrefix} <span style={{ whiteSpace: "nowrap" }}>{t.cardBootcampLocked}</span>
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
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
                      </svg>
                    </a>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                {/* sm:min-h-[410px] es el mismo valor que la card del
                    hackathon (medido en pantalla, con el título de esa card
                    en 2 líneas) — así las dos cajas quedan igual de altas.
                    Ancho fijo (220px) en vez de derivarlo del stretch del
                    flex porque el <Image fill> queda position:absolute y no
                    le da al contenedor un tamaño intrínseco del que
                    aspect-ratio pueda tirar (el width le quedaba en 0). Con
                    este tamaño se ve el flyer completo (foto + título +
                    calendario + footer) sin recortar. */}
                <div
                  style={cardStyle({ padding: "16px", overflow: "hidden" })}
                  className="flex flex-col sm:flex-row gap-5 sm:min-h-[410px]"
                >
                  <div
                    className="relative shrink-0 w-full sm:w-[220px] rounded-2xl overflow-hidden"
                    style={{ aspectRatio: "3 / 4" }}
                  >
                    <Image
                      src={BITCOIN_COLLEGE_FLYER_SRC}
                      alt={t.cardCollegeTitle}
                      fill
                      sizes="(max-width: 640px) 100vw, 220px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "12px 12px 12px 0" }} className="flex-1">
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
                        whiteSpace: "pre-line",
                      }}
                    >
                      {t.cardCollegeBody}
                    </p>
                    <div className="mt-6">
                      <PillLink href={BITCOIN_COLLEGE_UNITE_HREF}>{t.cardCollegeUnite}</PillLink>
                    </div>
                  </div>
                </div>
              </Reveal>

              <div className="grid grid-cols-2 gap-6">
                <Reveal delay={0.15}>
                  <div
                    style={cardStyle({
                      padding: "24px",
                      textAlign: "center",
                      minHeight: BOOTCAMP_ROW_MIN_H,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    })}
                  >
                    <h3 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(14px, 1.4vw, 17px)" }}>
                      {t.cardCertificadoTitle}
                    </h3>
                  </div>
                </Reveal>
                <Reveal delay={0.18}>
                  <div
                    style={cardStyle({
                      padding: "24px",
                      textAlign: "center",
                      minHeight: BOOTCAMP_ROW_MIN_H,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    })}
                  >
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
        <ParallaxBg src="/assets/home/pixel-grid-2.png" opacity={0.15} filter="invert(1)" drift={10} fadeEdges={SECTION_FADE} />

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
              <div
                style={cardStyle({ padding: "28px 32px", height: "100%" })}
                className="flex flex-col h-full"
              >
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
                  className="inline-block mt-auto pt-5 transition-opacity duration-200 hover:opacity-70"
                  style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(12px, 1vw, 14px)" }}
                >
                  {t.step1Cta}
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div
                style={cardStyle({ padding: "28px 32px", height: "100%" })}
                className="flex flex-col h-full"
              >
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
                  className="inline-block mt-auto pt-5 transition-opacity duration-200 hover:opacity-70"
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
      >
        {/* Mapa de puntos: afinidad con "universidades de toda la región",
            mismo fondo y degradé que Comunidades en /comunidad */}
        <ParallaxBg src="/assets/home/fondo-hexmap.jpg" opacity={0.22} objectPosition="center bottom" drift={12} fadeEdges={SECTION_FADE} />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.35) 32%, rgba(13,13,11,0.35) 68%, #171616 100%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-5xl" style={{ zIndex: 2 }}>
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

          <Reveal delay={0.14}>
            <div className="mt-16">
              <LogoMarquee />
            </div>
          </Reveal>
        </div>
      </section>

      <MasNav />
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

type UniLogo = { name: string; logo_url: string };

// Logos reales de universidades acreditadas (cargados desde el bucket de
// Supabase — ver edu_hub_universities). Dos carriles en direcciones
// opuestas, cada uno con DOS tracks hermanos idénticos y `min-width: 100%`,
// animados de 0% a -100% de su propio ancho: con pocos logos (19 repartidos
// en 2 filas) un solo track duplicado a -50% puede medir menos que el
// viewport en pantallas anchas y dejar un hueco al reiniciar el ciclo (ver
// skill css-marquee-infinito-dos-tracks). `justify-around` reparte el
// contenido cuando el track es más angosto que la pantalla.
function LogoLane({ unis, reverse, duration }: { unis: UniLogo[]; reverse?: boolean; duration: number }) {
  return (
    <div className="overflow-hidden flex" style={{ flexWrap: "nowrap" }}>
      {[0, 1].map((track) => (
        <motion.div
          key={track}
          className="flex items-center gap-16 shrink-0"
          style={{ minWidth: "100%", justifyContent: "space-around" }}
          animate={{ x: reverse ? ["-100%", "0%"] : ["0%", "-100%"] }}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
        >
          {unis.map((uni) => (
            // eslint-disable-next-line @next/next/no-img-element -- logos pre-comprimidos (5-130KB) con aspect ratio variable, no vale la pena el overhead de next/image para un marquee decorativo
            <img
              key={uni.name}
              src={uni.logo_url}
              alt={uni.name}
              style={{ height: "clamp(28px, 3.4vw, 44px)", width: "auto", maxWidth: 160, objectFit: "contain" }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
}

function LogoMarquee() {
  const [unis, setUnis] = useState<UniLogo[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSupabaseClient()
      .from("edu_hub_universities")
      .select("name, logo_url")
      .eq("accredited", true)
      .not("logo_url", "is", null)
      .then(({ data }) => {
        if (!cancelled) setUnis((data as UniLogo[] | null) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!unis || unis.length === 0) return null;

  const rowA = unis.filter((_, i) => i % 2 === 0);
  const rowB = unis.filter((_, i) => i % 2 === 1);

  return (
    <div className="flex flex-col gap-6">
      <LogoLane unis={rowA} duration={38} />
      <LogoLane unis={rowB} duration={44} reverse />
    </div>
  );
}
