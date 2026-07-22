"use client";

import Image from "next/image";
import Navbar from "@/components/home/Navbar";
import QaChatWidget from "@/components/home/QaChatWidget";
import Footer from "@/components/home/Footer";
import Reveal from "@/components/home/Reveal";
import Floating from "@/components/home/Floating";
import ParallaxBg from "@/components/home/ParallaxBg";
import { useHeadlineWidth } from "@/components/home/useHeadlineWidth";
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

// Versiones -trim (recortadas al texto) + altura fija TITLE_H para que todos
// los títulos de sección tengan la misma altura de letra (ver app/page.tsx)
const TITLE_IMAGES = {
  comunidad: { es: "/assets/home/titulos/comunidad-es-trim.png", en: "/assets/home/titulos/comunidad-en-trim.png" },
  comunidades: { es: "/assets/home/titulos/comunidades-es-trim.png", en: "/assets/home/titulos/comunidades-en-trim.png" },
  embajadores: { es: "/assets/home/titulos/embajadores-es-trim.png", en: "/assets/home/titulos/embajadores-en-trim.png" },
  studentHub: { es: "/assets/home/titulos/student-hub-es-trim.png", en: "/assets/home/titulos/student-hub-en-trim.png" },
} as const;

const TITLE_H = "clamp(40px, 5.5vw, 68px)";

// Dimensiones intrínsecas del título "Embajadores" -trim (identify), para
// renderizarlo sin `fill` y poder ponerle al lado el badge "Próximamente".
const EMBAJADORES_TITLE_DIMS = {
  es: { w: 973, h: 92 },
  en: { w: 976, h: 86 },
} as const;

const T = {
  es: {
    presentacionP1:
      "LABITCONF vuelve a Buenos Aires para su edición número 13, conectando a los líderes, constructores y comunidades que están dando forma al futuro de América Latina.",
    presentacionP2: "Porque las mejores historias son las que siguen construyéndose.",
    inscribirme: "Inscribirme",
    verticalEmbajadores: "Embajadores",
    verticalStudentHub: "Student Hub",
    verticalComunidades: "Comunidades",
    ctaEmbajadorTitle: "¿Por qué HODLeás? Contanos tu historia y postulate.",
    ctaHubTitle: "¿Querés unirte al hub?",
    ctaComunidadTitle: "¿Querés unir tu comunidad?",
    ctaButtonLabel: "Inscribite acá",
    proximamente: "Próximamente",
    embajadoresCopy: [
      "Hay personas que apostaron por sus ideas cuando nadie más creía en ellas. Que siguieron adelante cuando todo parecía indicar que debían abandonar. Personas que eligieron resistir, construir y mantenerse fieles a su visión.",
      "Este año, por primera vez en la historia de LABITCONF, queremos reconocerlas y darles un lugar oficial dentro de la conferencia.",
    ],
    studentHubCopy: [
      "El espacio de LABITCONF donde se forma la próxima generación del ecosistema.",
      "Creemos que el futuro no se espera: se comprende, se cuestiona y se construye. Por eso, acercamos a los estudiantes las herramientas y los principios de la descentralización, para que puedan ampliar su mirada y convertirse en protagonistas del cambio que blockchain ya está impulsando.",
      "Los estudiantes de universidades aliadas acceden gratuitamente al evento, cuentan con un espacio propio dentro del predio y reciben un certificado digital de participación.",
      "Porque descentralizar el conocimiento es el primer paso para descentralizar el futuro.",
    ],
    comunidadesCopy:
      "Las comunidades son el corazón del ecosistema. El programa de Comunidades Asociadas está abierto a comunidades crypto, tech, universitarias y de nicho que quieran ser parte de la edición 2026. Las comunidades adheridas acceden a beneficios exclusivos para sus miembros y tienen la posibilidad de tener presencia dentro del evento. Si tu comunidad forma parte del ecosistema, tiene un lugar acá. Completá el formulario y sumala a LABITCONF.",
  },
  en: {
    presentacionP1:
      "LABITCONF returns to Buenos Aires for its 13th edition, connecting the leaders, builders and communities shaping the future of Latin America.",
    presentacionP2: "Because the best stories are the ones still being written.",
    inscribirme: "Sign up",
    verticalEmbajadores: "Ambassadors",
    verticalStudentHub: "Student Hub",
    verticalComunidades: "Communities",
    ctaEmbajadorTitle: "Why do you HODL? Tell us your story and apply.",
    ctaHubTitle: "Want to join the hub?",
    ctaComunidadTitle: "Want to connect your community?",
    ctaButtonLabel: "Sign up here",
    proximamente: "Coming soon",
    embajadoresCopy: [
      "There are people who bet on their ideas when no one else believed in them. Who kept going when everything seemed to say they should give up. People who chose to resist, build, and stay true to their vision.",
      "This year, for the first time in LABITCONF's history, we want to recognize them and give them an official place within the conference.",
    ],
    studentHubCopy: [
      "LABITCONF's space where the next generation of the ecosystem is shaped.",
      "We believe the future isn't waited for: it's understood, questioned and built. That's why we bring students the tools and principles of decentralization, so they can broaden their perspective and become protagonists of the change blockchain is already driving.",
      "Students from partner universities get free access to the event, have their own space on site, and receive a digital certificate of participation.",
      "Because decentralizing knowledge is the first step to decentralizing the future.",
    ],
    comunidadesCopy:
      "Communities are the heart of the ecosystem. The Associated Communities program is open to crypto, tech, university and niche communities that want to be part of the 2026 edition. Partner communities get exclusive benefits for their members and the chance to have a presence at the event. If your community is part of the ecosystem, it has a place here. Fill out the form and add it to LABITCONF.",
  },
} as const;

const VERTICALES = [
  {
    key: "verticalEmbajadores",
    href: "#embajadores",
    image: "/assets/home/honeybadger-final.png",
    labelPosition: "bottom",
  },
  {
    key: "verticalStudentHub",
    href: "#student-hub",
    image: "/assets/home/ballena-final.png",
    labelPosition: "top",
  },
  {
    key: "verticalComunidades",
    href: "#comunidades",
    image: "/assets/home/pildora-final.png",
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

function CtaButton({ label, href = "#" }: { label: string; href?: string }) {
  return (
    <a
      href={href}
      target={href !== "#" ? "_blank" : undefined}
      rel={href !== "#" ? "noopener noreferrer" : undefined}
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
function InlineCta({
  title,
  label,
  delay = 0.2,
  href,
}: {
  title: string;
  label: string;
  delay?: number;
  href?: string;
}) {
  return (
    <Reveal
      delay={delay}
      className="mt-10 w-full flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-6 rounded-3xl"
      style={{
        border: "1px solid #ABF760",
        background: "rgba(13,13,11,0.55)",
        padding: "clamp(22px, 3vw, 36px) clamp(24px, 4vw, 48px)",
      }}
    >
      <h3
        className="sm:whitespace-nowrap"
        style={{
          ...labelStyle,
          color: "#FF4E01",
          fontSize: "clamp(16px, 2vw, 26px)",
          lineHeight: 1.1,
        }}
      >
        {title}
      </h3>
      <div className="shrink-0">
        <CtaButton label={label} href={href} />
      </div>
    </Reveal>
  );
}

export default function ComunidadPage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];
  const { probe: headlineProbe } = useHeadlineWidth();

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#171616" }}
    >
      {headlineProbe}
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
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.45) 32%, rgba(13,13,11,0.45) 68%, #171616 100%)",
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

          <Reveal delay={0.15} className="relative mt-12 w-full">
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
                  textAlign: "justify",
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
                  textAlign: "justify",
                }}
              >
                {t.presentacionP2}
              </p>
            </div>

            {/* Píldora acento */}
            <div
              className="absolute pointer-events-none select-none hidden sm:block"
              style={{
                bottom: "calc(-12px - min(12vw, 110px))",
                left: "-1.5rem",
                width: "min(12vw, 110px)",
                height: "min(12vw, 110px)",
              }}
            >
              <Floating duration={5.5} y={8} rotate={4}>
                <Image
                  src="/assets/home/pildora-final.png"
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
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.4) 32%, rgba(13,13,11,0.4) 68%, #171616 100%)",
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
                  style={{ inset: "10%", opacity: 0.9 }}
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
                    fontSize: "clamp(14px, 1.8vw, 19px)",
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
        className="relative flex flex-col justify-center sm:justify-start px-6 sm:px-10 py-24 sm:py-0 sm:pt-36 sm:min-h-screen overflow-hidden"
        style={{ zIndex: 3 }}
      >
        <ParallaxBg src="/assets/home/pixel-grid-2.png" opacity={0.15} filter="invert(1)" drift={10} />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.4) 32%, rgba(13,13,11,0.4) 68%, #171616 100%)",
          }}
        />

        <div className="relative w-full max-w-6xl" style={{ zIndex: 2 }}>
          <div className="flex items-end gap-4 flex-wrap">
            <Reveal style={{ height: TITLE_H }}>
              <Image
                src={TITLE_IMAGES.embajadores[lang]}
                alt={t.verticalEmbajadores}
                width={EMBAJADORES_TITLE_DIMS[lang].w}
                height={EMBAJADORES_TITLE_DIMS[lang].h}
                style={{ height: TITLE_H, width: "auto" }}
              />
            </Reveal>
            <Reveal delay={0.05}>
              <span
                style={{
                  ...labelStyle,
                  color: "#FF4E01",
                  fontSize: "clamp(13px, 1.2vw, 16px)",
                }}
              >
                {t.proximamente}
              </span>
            </Reveal>
          </div>

          <Reveal
            delay={0.1}
            className="mt-8 rounded-3xl w-full"
            style={{
              border: "1px solid #ABF760",
              background: "rgba(13,13,11,0.55)",
              padding: "clamp(24px, 4vw, 40px)",
            }}
          >
            {t.embajadoresCopy.map((paragraph, i) => (
              <p
                key={i}
                className={i === 0 ? undefined : "mt-3"}
                style={{
                  ...lightStyle,
                  color: "#E6EEF2",
                  fontSize: "clamp(14px, 1.4vw, 17px)",
                  lineHeight: 1.6,
                }}
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {Array.from({ length: 6 }, (_, i) => {
              return (
                <Reveal
                  key={i}
                  delay={0.1 + i * 0.1}
                  className="relative rounded-2xl overflow-hidden w-full"
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

          <InlineCta
            title={t.ctaEmbajadorTitle}
            label={t.ctaButtonLabel}
            delay={0.3}
            href="https://forms.gle/x7KFRbUTVSahpgqCA"
          />
        </div>
      </section>

      {/* 4 — Student Hub: título + copy + CTA integrado (1 pantalla) */}
      <section
        id="student-hub"
        className="relative flex flex-col justify-center sm:justify-start px-6 sm:px-10 py-24 sm:py-0 sm:pt-36 sm:min-h-screen overflow-hidden"
        style={{ zIndex: 3 }}
      >
        <ParallaxBg src="/assets/home/fondo-iconos.jpg" opacity={0.22} drift={12} />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.35) 32%, rgba(13,13,11,0.35) 68%, #171616 100%)",
          }}
        />

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
            className="mt-8 rounded-3xl w-full"
            style={{
              border: "1px solid #ABF760",
              background: "rgba(13,13,11,0.55)",
              padding: "clamp(24px, 4vw, 40px)",
            }}
          >
            {t.studentHubCopy.map((paragraph, i) => (
              <p
                key={i}
                className={i === 0 ? undefined : "mt-3"}
                style={{
                  ...lightStyle,
                  color: "#E6EEF2",
                  fontSize: "clamp(14px, 1.4vw, 17px)",
                  lineHeight: 1.6,
                }}
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          <InlineCta title={t.ctaHubTitle} label={t.ctaButtonLabel} delay={0.25} />
        </div>
      </section>

      {/* 5 — Comunidades: título + copy + CTA integrado (1 pantalla, sin logos) */}
      <section
        id="comunidades"
        className="relative flex flex-col justify-center sm:justify-start px-6 sm:px-10 py-24 sm:py-0 sm:pt-36 sm:min-h-screen overflow-hidden"
        style={{ zIndex: 3 }}
      >
        <ParallaxBg src="/assets/home/fondo-hexmap.jpg" opacity={0.22} objectPosition="center bottom" drift={12} />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.35) 32%, rgba(13,13,11,0.35) 68%, #171616 100%)",
          }}
        />

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
                  src="/assets/home/pildora-final.png"
                  alt=""
                  fill
                  style={{ objectFit: "contain", transform: "rotate(20deg)" }}
                />
              </Floating>
            </div>
          </Reveal>

          <Reveal
            delay={0.15}
            className="mt-8 rounded-3xl w-full"
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

          <InlineCta
            title={t.ctaComunidadTitle}
            label={t.ctaButtonLabel}
            delay={0.25}
            href="https://forms.gle/wUCHHJEgr8ZeWGK49"
          />
        </div>
      </section>

      {/* 9 — Footer compartido con / */}
      <Footer lang={lang} />

      <QaChatWidget />
    </main>
  );
}
