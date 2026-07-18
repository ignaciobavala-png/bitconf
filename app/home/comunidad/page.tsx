"use client";

import Image from "next/image";
import Navbar from "@/components/home/Navbar";
import QaChatWidget from "@/components/home/QaChatWidget";
import Footer from "@/components/home/Footer";
import Reveal from "@/components/home/Reveal";
import Floating from "@/components/home/Floating";
import ParallaxBg from "@/components/home/ParallaxBg";
import { useLangStore } from "@/lib/store/lang";

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

// Tinte naranja #FF4E01 para las figuras punteadas: fuerza el asset gris a
// negro y lo recolorea (invert/sepia/saturate calculados para ese hex)
const orangeTint =
  "brightness(0) saturate(100%) invert(60%) sepia(51%) saturate(1521%) hue-rotate(347deg) brightness(99%) contrast(97%)";

// Versiones -trim (recortadas al texto) + altura fija TITLE_H para que todos
// los títulos de sección tengan la misma altura de letra (ver app/home/page.tsx)
const TITLE_IMAGES = {
  comunidad: { es: "/assets/home/titulos/comunidad-es-trim.png", en: "/assets/home/titulos/comunidad-en-trim.png" },
  comunidades: { es: "/assets/home/titulos/comunidades-es-trim.png", en: "/assets/home/titulos/comunidades-en-trim.png" },
  embajadores: { es: "/assets/home/titulos/embajadores-es-trim.png", en: "/assets/home/titulos/embajadores-en-trim.png" },
  studentHub: { es: "/assets/home/titulos/student-hub-es-trim.png", en: "/assets/home/titulos/student-hub-en-trim.png" },
} as const;

const TITLE_H = "clamp(40px, 5.5vw, 68px)";

const T = {
  es: {
    presentacionP1:
      "LABITCONF vuelve a Buenos Aires para su edición número 13, conectando a los líderes, constructores y comunidades que están dando forma al futuro de América Latina.",
    presentacionP2: "Porque las mejores historias son las que siguen construyéndose.",
    inscribirme: "Inscribirme",
    verticalEmbajadores: "Embajadores",
    verticalStudentHub: "Student Hub",
    verticalComunidades: "Comunidades",
    ctaEmbajadorTitle: "¿Querés ser embajador?",
    ctaHubTitle: "¿Querés unirte al hub?",
    ctaComunidadTitle: "¿Querés unir tu comunidad?",
    ctaButtonLabel: "Inscribite acá",
    studentHubCopy:
      "El Student Hub es el espacio de LABITCONF para estudiantes: charlas, workshops y networking para la próxima generación de constructores.",
    comunidadesCopy:
      "Estas son las comunidades que hacen que LABITCONF sea posible: grupos locales de toda América Latina que construyen, educan y difunden Bitcoin todo el año.",
  },
  en: {
    presentacionP1:
      "LABITCONF returns to Buenos Aires for its 13th edition, connecting the leaders, builders and communities shaping the future of Latin America.",
    presentacionP2: "Because the best stories are the ones still being written.",
    inscribirme: "Sign up",
    verticalEmbajadores: "Ambassadors",
    verticalStudentHub: "Student Hub",
    verticalComunidades: "Communities",
    ctaEmbajadorTitle: "Want to become an ambassador?",
    ctaHubTitle: "Want to join the hub?",
    ctaComunidadTitle: "Want to connect your community?",
    ctaButtonLabel: "Sign up here",
    studentHubCopy:
      "Student Hub is LABITCONF's space for students: talks, workshops and networking for the next generation of builders.",
    comunidadesCopy:
      "These are the communities that make LABITCONF possible: local groups across Latin America that build, educate and spread Bitcoin all year round.",
  },
} as const;

const VERTICALES = [
  {
    key: "verticalEmbajadores",
    href: "#embajadores",
    image: "/assets/home/honeybadger-dots.png",
    labelPosition: "bottom",
  },
  {
    key: "verticalStudentHub",
    href: "#student-hub",
    image: "/assets/home/ballena-dots.png",
    labelPosition: "top",
  },
  {
    key: "verticalComunidades",
    href: "#comunidades",
    image: "/assets/home/pildora-dots.png",
    labelPosition: "bottom",
  },
] as const;

// Íconos placeholder (transparentes) para las 6 cards hasta tener fotos reales
const AMBASSADOR_ICONS = [
  "/assets/home/iconos/candado.png",
  "/assets/home/iconos/casa.png",
  "/assets/home/iconos/diamante.png",
  "/assets/home/iconos/llave.png",
  "/assets/home/iconos/ojo.png",
  "/assets/home/iconos/rayo.png",
] as const;

function CtaButton({ label }: { label: string }) {
  return (
    <a
      href="#"
      className="rounded-full transition-colors duration-200 border-2 hover:bg-[#ABF760] hover:text-[#171616]"
      style={{
        ...labelStyle,
        color: "#E6EEF2",
        borderColor: "#ABF760",
        background: "rgba(13,13,11,0.6)",
        fontSize: "clamp(13px, 1.2vw, 16px)",
        padding: "14px 40px",
      }}
    >
      {label}
    </a>
  );
}

// CTA integrado: pregunta + botón en una misma barra, para cerrar cada sección
// dentro de su propia pantalla en vez de una pantalla-CTA separada.
function InlineCta({ title, label, delay = 0.2 }: { title: string; label: string; delay?: number }) {
  return (
    <Reveal
      delay={delay}
      className="mt-10 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 rounded-3xl"
      style={{
        border: "1px solid #ABF760",
        background: "rgba(13,13,11,0.55)",
        padding: "clamp(22px, 3vw, 36px) clamp(24px, 4vw, 48px)",
      }}
    >
      <h3
        style={{
          ...labelStyle,
          color: "#FF4E01",
          fontSize: "clamp(22px, 3.2vw, 40px)",
          lineHeight: 1.1,
        }}
      >
        {title}
      </h3>
      <div className="shrink-0">
        <CtaButton label={label} />
      </div>
    </Reveal>
  );
}

export default function ComunidadPage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#171616" }}
    >
      <Navbar />

      {/* 1 — Hero Comunidad */}
      <section
        className="relative flex flex-col justify-center px-6 sm:px-10 py-24 sm:py-0 sm:min-h-screen overflow-hidden"
        style={{ zIndex: 3 }}
      >
        <ParallaxBg src="/assets/home/labitconf-pixel.png" opacity={0.45} priority drift={8} />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.45) 20%, rgba(13,13,11,0.45) 80%, #171616 100%)",
          }}
        />

        <div className="relative w-full max-w-6xl" style={{ zIndex: 2 }}>
          <Reveal className="relative w-full" style={{ height: TITLE_H }}>
            <Image
              src={TITLE_IMAGES.comunidad[lang]}
              alt={lang === "es" ? "Comunidad" : "Community"}
              fill
              priority
              style={{ objectFit: "contain", objectPosition: "left center" }}
            />
          </Reveal>

          <Reveal delay={0.15} className="relative mt-12 sm:ml-10 max-w-3xl">
            <div
              className="rounded-3xl"
              style={{
                border: "1px solid #ABF760",
                background: "rgba(13,13,11,0.55)",
                padding: "clamp(24px, 4vw, 48px)",
              }}
            >
              <p
                style={{
                  ...lightStyle,
                  color: "#E6EEF2",
                  fontSize: "clamp(14px, 1.4vw, 17px)",
                  lineHeight: 1.6,
                }}
              >
                {t.presentacionP1}
              </p>
              <p
                className="mt-4"
                style={{
                  ...lightStyle,
                  color: "#E6EEF2",
                  fontSize: "clamp(14px, 1.4vw, 17px)",
                  lineHeight: 1.6,
                }}
              >
                {t.presentacionP2}
              </p>
            </div>

            {/* Píldora acento */}
            <div
              className="absolute pointer-events-none select-none hidden sm:block"
              style={{
                bottom: "-3rem",
                left: "-4rem",
                width: "min(12vw, 110px)",
                height: "min(12vw, 110px)",
              }}
            >
              <Floating duration={5.5} y={8} rotate={4}>
                <Image
                  src="/assets/home/pildora.png"
                  alt=""
                  fill
                  style={{ objectFit: "contain", transform: "rotate(-25deg)" }}
                />
              </Floating>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2 — Las tres verticales */}
      <section
        className="relative flex flex-col justify-center px-6 sm:px-10 py-24 sm:py-0 sm:min-h-screen overflow-hidden"
        style={{ zIndex: 3 }}
      >
        <ParallaxBg src="/assets/home/lluvia.png" opacity={0.3} drift={12} />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.4) 20%, rgba(13,13,11,0.4) 80%, #171616 100%)",
          }}
        />

        <div
          className="relative mx-auto w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 items-center"
          style={{ zIndex: 2 }}
        >
          {VERTICALES.map((vertical, i) => (
            <Reveal key={vertical.key} delay={i * 0.12} className="flex flex-col items-center gap-5">
              <a
                href={vertical.href}
                className="relative block w-full rounded-3xl overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
                style={{
                  aspectRatio: "1 / 1.15",
                  border: "1px solid #ABF760",
                  background: "rgba(13,13,11,0.4)",
                }}
              >
                <div
                  className="absolute pointer-events-none select-none"
                  style={{ inset: "10%", filter: orangeTint, opacity: 0.9 }}
                >
                  <Floating duration={5 + i * 0.6} y={9} rotate={3}>
                    <Image
                      src={vertical.image}
                      alt=""
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </Floating>
                </div>
                <span
                  className="absolute inset-0 flex items-center justify-center text-center px-4"
                  style={{
                    ...labelStyle,
                    color: "#E6EEF2",
                    fontSize: "clamp(24px, 2.6vw, 34px)",
                    lineHeight: 1.15,
                    textShadow: "0 2px 20px rgba(0,0,0,0.8)",
                  }}
                >
                  {t[vertical.key]}
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3 — Embajadores: título + 6 tarjetas + CTA integrado (1 pantalla) */}
      <section
        id="embajadores"
        className="relative flex flex-col justify-center px-6 sm:px-10 py-24 sm:py-0 sm:min-h-screen overflow-hidden"
        style={{ zIndex: 3 }}
      >
        <ParallaxBg src="/assets/home/pixel-grid-2.png" opacity={0.15} filter="invert(1)" drift={10} />

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
              src={TITLE_IMAGES.embajadores[lang]}
              alt={t.verticalEmbajadores}
              fill
              style={{ objectFit: "contain", objectPosition: "left center" }}
            />
          </Reveal>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 justify-items-center">
            {Array.from({ length: 6 }, (_, i) => {
              return (
                <Reveal
                  key={i}
                  delay={0.1 + i * 0.1}
                  className="relative rounded-2xl overflow-hidden w-full max-w-[170px]"
                  style={{
                    aspectRatio: "3 / 4",
                    border: "1px solid #ABF760",
                    background: "rgba(13,13,11,0.4)",
                  }}
                >
                  {/* Ícono placeholder (transparente) — se reemplaza por foto real */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <div className="relative" style={{ width: "46%", height: "46%", opacity: 0.9 }}>
                      <Floating duration={4 + i * 0.4} y={6} rotate={2}>
                        <Image
                          src={AMBASSADOR_ICONS[i]}
                          alt=""
                          fill
                          style={{ objectFit: "contain" }}
                        />
                      </Floating>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <InlineCta title={t.ctaEmbajadorTitle} label={t.ctaButtonLabel} delay={0.3} />
        </div>
      </section>

      {/* 4 — Student Hub: título + copy + CTA integrado (1 pantalla) */}
      <section
        id="student-hub"
        className="relative flex flex-col justify-center px-6 sm:px-10 py-24 sm:py-0 sm:min-h-screen overflow-hidden"
        style={{ zIndex: 3 }}
      >
        <ParallaxBg src="/assets/home/fondo-iconos.jpg" opacity={0.22} drift={12} />

        {/* Honeybadger punteado */}
        <div
          className="absolute pointer-events-none select-none hidden lg:block"
          style={{
            top: "50%",
            right: "4%",
            transform: "translateY(-50%)",
            width: "min(24vw, 300px)",
            height: "min(34vw, 420px)",
            zIndex: 1,
            opacity: 0.7,
          }}
        >
          <Floating duration={7} y={10} rotate={3}>
            <Image
              src="/assets/home/honeybadger-dots.png"
              alt=""
              fill
              style={{ objectFit: "contain", filter: "brightness(2)" }}
            />
          </Floating>
        </div>

        <div className="relative w-full max-w-6xl" style={{ zIndex: 2 }}>
          <Reveal className="relative w-full" style={{ height: TITLE_H }}>
            <Image
              src={TITLE_IMAGES.studentHub[lang]}
              alt={t.verticalStudentHub}
              fill
              style={{ objectFit: "contain", objectPosition: "left center" }}
            />
          </Reveal>

          <Reveal
            delay={0.15}
            className="mt-8 rounded-3xl max-w-3xl"
            style={{
              border: "1px solid #ABF760",
              background: "rgba(13,13,11,0.55)",
              padding: "clamp(24px, 4vw, 40px)",
            }}
          >
            <p
              style={{
                ...lightStyle,
                color: "#E6EEF2",
                fontSize: "clamp(14px, 1.4vw, 17px)",
                lineHeight: 1.6,
              }}
            >
              {/* Copy placeholder — pendiente del cliente */}
              {t.studentHubCopy}
            </p>
          </Reveal>

          <InlineCta title={t.ctaHubTitle} label={t.ctaButtonLabel} delay={0.25} />
        </div>
      </section>

      {/* 5 — Comunidades: título + copy + CTA integrado (1 pantalla, sin logos) */}
      <section
        id="comunidades"
        className="relative flex flex-col justify-center px-6 sm:px-10 py-24 sm:py-0 sm:min-h-screen overflow-hidden"
        style={{ zIndex: 3 }}
      >
        <ParallaxBg src="/assets/home/fondo-hexmap.jpg" opacity={0.22} objectPosition="center bottom" drift={12} />

        <div className="relative w-full max-w-6xl" style={{ zIndex: 2 }}>
          <Reveal className="relative max-w-3xl">
            <div className="relative w-full" style={{ height: TITLE_H }}>
              <Image
                src={TITLE_IMAGES.comunidades[lang]}
                alt={t.verticalComunidades}
                fill
                style={{ objectFit: "contain", objectPosition: "left center" }}
              />
            </div>

            {/* Píldora acento */}
            <div
              className="absolute pointer-events-none select-none hidden sm:block"
              style={{
                top: "-1rem",
                right: "-6rem",
                width: "min(10vw, 100px)",
                height: "min(10vw, 100px)",
              }}
            >
              <Floating duration={5} y={7} rotate={4}>
                <Image
                  src="/assets/home/pildora.png"
                  alt=""
                  fill
                  style={{ objectFit: "contain", transform: "rotate(20deg)" }}
                />
              </Floating>
            </div>
          </Reveal>

          <Reveal
            delay={0.15}
            className="mt-8 rounded-3xl max-w-3xl"
            style={{
              border: "1px solid #ABF760",
              background: "rgba(13,13,11,0.55)",
              padding: "clamp(24px, 4vw, 40px)",
            }}
          >
            <p
              style={{
                ...lightStyle,
                color: "#E6EEF2",
                fontSize: "clamp(14px, 1.4vw, 17px)",
                lineHeight: 1.6,
              }}
            >
              {/* Copy placeholder — pendiente del cliente */}
              {t.comunidadesCopy}
            </p>
          </Reveal>

          <InlineCta title={t.ctaComunidadTitle} label={t.ctaButtonLabel} delay={0.25} />
        </div>
      </section>

      {/* 9 — Footer compartido con /home */}
      <Footer lang={lang} />

      <QaChatWidget />
    </main>
  );
}
