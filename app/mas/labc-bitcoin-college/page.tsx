"use client";

import Image from "next/image";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import Reveal from "@/components/home/Reveal";
import MasNav from "@/components/mas/MasNav";
import { useLangStore } from "@/lib/store/lang";
import { MasSection, CtaButton, labelStyle, lightStyle } from "@/components/mas/ui";

// MÁS → LABC BITCOIN COLLEGE, página propia (25/09/2026, reemplaza el
// placeholder "Próximamente"). Maquetada a partir de las 2 laminas de Canva
// que la organización dejó en Descargas ("EDU HUB — Scroll 1"): hero con
// foto de fondo + título + CTA, y debajo una card con el flyer + copy + los
// dos CTA (participá / postulá tu uni). Mismo patrón de layout que
// /mas/hackathon (hero + "sobre" card), es el mismo tipo de página dentro
// de EDU HUB.
//
// Assets:
// - hero.jpg: foto de Descargas/College_3.png (la que el machete anotaba
//   "FOTO FONDO" con un link de Drive) comprimida a JPG y subida al bucket
//   de Supabase en mas/labc-bitcoin-college/ — no se sube el original al repo.
// - El flyer (calendario + foto + título) YA estaba subido para la card de
//   Bitcoin College en /mas/edu-hub (BITCOIN_COLLEGE_FLYER_SRC): mismo
//   archivo, se reusa la misma URL en vez de volver a subirlo.
//
// Copy: reusa el ya aprobado en /mas/edu-hub (misma sección, mismo texto) —
// el machete no trae copy nuevo, solo confirma layout y links.
//
// Links reales (del machete, no placeholders):
// - "Participá" → https://luma.com/cqk6i6vd (link público). El machete
//   también traía un "Link al LUMA" a /event/manage/... pero esa es la URL
//   de administración del evento, no la pública — un visitante caería en un
//   login de Luma, así que no se usa (mismo caso ya resuelto en /mas/hackathon).
// - "Postulá tu uni" → https://forms.gle/uvvJKf141FWNsRdA6, la beca de
//   movilidad para universidades del interior que menciona el copy.
const LUMA_HREF = "https://luma.com/cqk6i6vd";
const POSTULAR_UNI_HREF = "https://forms.gle/uvvJKf141FWNsRdA6";
const HERO_BG_SRC =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/mas/labc-bitcoin-college/hero.jpg";
const FLYER_SRC =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/mas/edu-hub/bitcoin-college.jpg";

const T = {
  es: {
    alt: "LABC Bitcoin College",
    titleL1: "LABITCONF",
    titleL2: "BITCOIN COLLEGE",
    tagline: "Un día. Certificación real. Antes de LABITCONF.",
    participa: "Participá",
    postulaUni: "Postulá tu uni",
    pending: "Link a confirmar",
    body: "Un día completo, IRL, de formación intensiva en Bitcoin, con certificación conjunta de la Universidad Champagnat y la Escuelita Bitcoin. Jueves 29 de octubre, en la Universidad del Salvador (USAL), Buenos Aires.\n\nAbierto a toda la comunidad universitaria de Argentina y países vecinos: estudiantes, alumni y profesores.\n\n¿Sos de una universidad del interior? Podés postularte a una beca de movilidad de hasta USD 1.000 por delegación.",
  },
  en: {
    alt: "LABC Bitcoin College",
    titleL1: "LABITCONF",
    titleL2: "BITCOIN COLLEGE",
    tagline: "One day. Real certification. Before LABITCONF.",
    participa: "Join in",
    postulaUni: "Apply your university",
    pending: "Link to be confirmed",
    body: "A full day, IRL, of intensive Bitcoin training, with joint certification from Universidad Champagnat and Escuelita Bitcoin. Thursday, October 29, at Universidad del Salvador (USAL), Buenos Aires.\n\nOpen to the entire university community of Argentina and neighboring countries: students, alumni and professors.\n\nAre you from a university outside Buenos Aires? You can apply for a mobility scholarship of up to USD 1,000 per delegation.",
  },
} as const;

export default function LabcBitcoinCollegePage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#171616" }}>
      <Navbar />

      {/* Hero — foto de fondo (aula/estudiantes) tal como en el machete,
          en vez del negro liso de otras páginas de MÁS. */}
      <MasSection bg={HERO_BG_SRC} bgOpacity={0.5} first tall centered>
        <div className="flex flex-col items-center text-center gap-6">
          <Reveal>
            <h1
              style={{
                ...labelStyle,
                color: "#E6EEF2",
                fontSize: "clamp(34px, 6vw, 68px)",
                lineHeight: 1.05,
              }}
            >
              <span className="block">{t.titleL1}</span>
              <span className="block">{t.titleL2}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(15px, 1.9vw, 24px)" }}>
              {t.tagline}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <CtaButton label={t.participa} href={LUMA_HREF} pendingLabel={t.pending} />
          </Reveal>
        </div>
      </MasSection>

      {/* Sobre LABC Bitcoin College — flyer a la izquierda, wordmark + copy +
          los dos CTA (participá / postulá tu uni) a la derecha, mismo layout
          que la card "Sobre el Hackathon" de /mas/hackathon. */}
      <MasSection id="sobre-college" bg="/assets/home/hashes.jpg" bgOpacity={0.25} centered>
        <div
          className="flex flex-col sm:flex-row sm:items-start gap-6 rounded-3xl overflow-hidden"
          style={{ border: "1px solid #ABF760", background: "rgba(13,13,11,0.55)", padding: "16px" }}
        >
          <div
            className="relative shrink-0 w-full sm:w-[360px] rounded-2xl overflow-hidden"
            style={{ aspectRatio: "3 / 4" }}
          >
            <Image
              src={FLYER_SRC}
              alt={t.alt}
              fill
              sizes="(max-width: 640px) 100vw, 360px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div
            style={{ padding: "clamp(8px, 1.5vw, 20px) clamp(8px, 1.5vw, 20px) clamp(8px, 1.5vw, 20px) 0" }}
            className="flex-1 flex flex-col justify-center"
          >
            <h2 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(22px, 3vw, 34px)", lineHeight: 1.1 }}>
              {t.titleL1} {t.titleL2}
            </h2>
            <p
              className="mt-3"
              style={{
                ...labelStyle,
                color: "#ABF760",
                fontSize: "clamp(14px, 1.4vw, 18px)",
                lineHeight: 1.3,
              }}
            >
              {t.tagline}
            </p>
            <p
              style={{
                ...lightStyle,
                color: "#E6EEF2",
                fontSize: "clamp(14px, 1.4vw, 17px)",
                lineHeight: 1.6,
                marginTop: 16,
                whiteSpace: "pre-line",
              }}
            >
              {t.body}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-6">
              <CtaButton label={t.participa} href={LUMA_HREF} pendingLabel={t.pending} />
              <CtaButton label={t.postulaUni} href={POSTULAR_UNI_HREF} pendingLabel={t.pending} />
            </div>
          </div>
        </div>
      </MasSection>

      <MasNav />
      <Footer lang={lang} />
      <QaChatWidget />
    </main>
  );
}
