"use client";

import Navbar from "@/components/home/Navbar";
import QaChatWidget from "@/components/home/QaChatWidget";
import Footer from "@/components/home/Footer";
import Reveal from "@/components/home/Reveal";
import { useLangStore } from "@/lib/store/lang";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

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
  },
  en: {
    headline: "THE NEXT GENERATION IS ALREADY IN.",
    soyAlumnoL1: "I'm a",
    soyAlumnoL2: "Student",
    soyUniversidadL1: "I'm a",
    soyUniversidadL2: "University",
  },
} as const;

// Links reales que dieron los diseñadores junto con el boceto (no son
// placeholders): grupo de WhatsApp para alumnos y formulario para universidades.
const SOY_ALUMNO_HREF = "https://chat.whatsapp.com/GaZPl2xGppVGJ1Y1r9vJEo";
const SOY_UNIVERSIDAD_HREF = "https://forms.gle/impFDrqXVFmxUrxV7";

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
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 sm:gap-10">
            <a
              href={SOY_ALUMNO_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 text-center transition-transform duration-200 hover:scale-[1.03]"
              style={{
                ...labelStyle,
                color: "#E6EEF2",
                background: "#FF4E01",
                borderColor: "#ABF760",
                fontSize: "clamp(13px, 1.6vw, 18px)",
                lineHeight: 1.3,
                padding: "clamp(18px, 2.6vw, 30px) clamp(10px, 2vw, 20px)",
              }}
            >
              <span>{t.soyAlumnoL1}</span>
              <span>{t.soyAlumnoL2}</span>
            </a>
            <a
              href={SOY_UNIVERSIDAD_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 text-center transition-transform duration-200 hover:scale-[1.03]"
              style={{
                ...labelStyle,
                color: "#E6EEF2",
                background: "#FFAB0B",
                borderColor: "#ABF760",
                fontSize: "clamp(13px, 1.6vw, 18px)",
                lineHeight: 1.3,
                padding: "clamp(18px, 2.6vw, 30px) clamp(10px, 2vw, 20px)",
              }}
            >
              <span>{t.soyUniversidadL1}</span>
              <span>{t.soyUniversidadL2}</span>
            </a>
          </div>
        </Reveal>

        {/* Headline — abajo, alineado al margen izquierdo de página (como el
            resto de los títulos de sección), no centrado */}
        <Reveal delay={0.2} className="relative w-full max-w-3xl" style={{ zIndex: 2 }}>
          <h1
            style={{
              ...labelStyle,
              color: "#E6EEF2",
              fontSize: "clamp(22px, 3.6vw, 44px)",
              lineHeight: 1.15,
              textShadow: "0 2px 24px rgba(0,0,0,0.6)",
            }}
          >
            {t.headline}
          </h1>
        </Reveal>
      </section>

      <Footer lang={lang} />

      <QaChatWidget />
    </main>
  );
}
