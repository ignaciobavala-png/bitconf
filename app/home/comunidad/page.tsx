"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/home/Navbar";
import QaChatWidget from "@/components/home/QaChatWidget";
import Footer from "@/components/home/Footer";
import Reveal from "@/components/home/Reveal";
import Floating from "@/components/home/Floating";
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

const EMBAJADORES: { name: [string, string]; gradient: string }[] = [
  {
    name: ["Axel", "Becker"],
    gradient: "linear-gradient(135deg, #1c1c1c 0%, #FF4E01 100%)",
  },
];

const LOGO_PLACEHOLDERS = Array.from({ length: 10 }, (_, i) => `logo-${i}`);

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

function LogoMarquee({ id, direction }: { id: string; direction: "left" | "right" }) {
  const doubled = [...LOGO_PLACEHOLDERS, ...LOGO_PLACEHOLDERS];
  return (
    <div className="relative w-full overflow-hidden" style={{ height: "90px" }}>
      <motion.div
        className="flex items-center absolute top-0 left-0 h-full"
        style={{ gap: "72px", width: "max-content" }}
        animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((logo, i) => (
          <span
            key={`${id}-${logo}-${i}`}
            style={{
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontWeight: 900,
              color: "#E6EEF2",
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: 1,
              textTransform: "lowercase",
            }}
          >
            logo
          </span>
        ))}
      </motion.div>
    </div>
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
        className="relative flex flex-col justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, height: "100vh" }}
      >
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{ zIndex: 0, opacity: 0.45 }}
        >
          <Image
            src="/assets/home/labitconf-pixel.png"
            alt=""
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>

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
        className="relative flex flex-col justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, height: "100vh" }}
      >
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{ zIndex: 0, opacity: 0.3 }}
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
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.4) 20%, rgba(13,13,11,0.4) 80%, #171616 100%)",
          }}
        />

        <div
          className="relative mx-auto w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 items-center"
          style={{ zIndex: 2 }}
        >
          {VERTICALES.map((vertical, i) => (
            <Reveal key={vertical.key} delay={i * 0.12} className="flex flex-col items-center gap-5">
              {vertical.labelPosition === "top" && (
                <a
                  href={vertical.href}
                  className="transition-opacity duration-200 hover:opacity-70"
                  style={{
                    ...lightStyle,
                    color: "#E6EEF2",
                    fontSize: "clamp(12px, 1.1vw, 14px)",
                  }}
                >
                  {t.inscribirme}
                </a>
              )}

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
                  <Image
                    src={vertical.image}
                    alt=""
                    fill
                    style={{ objectFit: "contain" }}
                  />
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

              {vertical.labelPosition === "bottom" && (
                <a
                  href={vertical.href}
                  className="transition-opacity duration-200 hover:opacity-70"
                  style={{
                    ...lightStyle,
                    color: "#E6EEF2",
                    fontSize: "clamp(12px, 1.1vw, 14px)",
                  }}
                >
                  {t.inscribirme}
                </a>
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3 — Embajadores */}
      <section
        id="embajadores"
        className="relative flex flex-col justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, height: "100vh" }}
      >
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

        <div className="relative w-full" style={{ zIndex: 2 }}>
          <Reveal className="relative w-full" style={{ height: TITLE_H }}>
            <Image
              src={TITLE_IMAGES.embajadores[lang]}
              alt={t.verticalEmbajadores}
              fill
              style={{ objectFit: "contain", objectPosition: "left center" }}
            />
          </Reveal>

          <div className="mt-14 mx-auto max-w-6xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 justify-items-center">
            {Array.from({ length: 6 }, (_, i) => {
              const embajador = EMBAJADORES[i];
              return (
                <Reveal
                  key={i}
                  delay={0.1 + i * 0.12}
                  className="relative rounded-2xl overflow-hidden w-full max-w-[170px]"
                  style={{
                    aspectRatio: "3 / 4",
                    border: "1px solid #ABF760",
                    background: "rgba(13,13,11,0.4)",
                  }}
                >
                  {embajador && (
                    <>
                      {/* Placeholder de foto hasta tener material real */}
                      <div
                        className="absolute inset-0"
                        style={{ background: embajador.gradient, opacity: 0.85 }}
                      />
                      <div className="absolute bottom-4 left-4">
                        <div
                          style={{
                            ...labelStyle,
                            color: "#E6EEF2",
                            fontSize: "clamp(15px, 1.4vw, 19px)",
                            lineHeight: 1.1,
                          }}
                        >
                          {embajador.name[0]}
                        </div>
                        <div
                          style={{
                            ...labelStyle,
                            color: "#FF4E01",
                            fontSize: "clamp(15px, 1.4vw, 19px)",
                            lineHeight: 1.1,
                          }}
                        >
                          {embajador.name[1]}
                        </div>
                      </div>
                    </>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 — CTA embajador */}
      <section
        className="relative flex flex-col items-center justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, height: "100vh" }}
      >
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{ zIndex: 0, opacity: 0.55 }}
        >
          <Image
            src="/assets/home/lluvia-naranja.png"
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
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.35) 25%, rgba(13,13,11,0.35) 75%, #171616 100%)",
          }}
        />

        {/* Píldora */}
        <div
          className="absolute pointer-events-none select-none hidden sm:block"
          style={{
            bottom: "12%",
            left: "6%",
            width: "min(18vw, 200px)",
            height: "min(18vw, 200px)",
            zIndex: 2,
          }}
        >
          <Floating duration={6.5} y={12} rotate={5}>
            <Image
              src="/assets/home/pildora.png"
              alt=""
              fill
              style={{ objectFit: "contain", transform: "rotate(-30deg)" }}
            />
          </Floating>
        </div>

        <Reveal
          className="relative flex flex-col items-center gap-10 text-center"
          style={{ zIndex: 2 }}
        >
          <h2
            style={{
              ...labelStyle,
              color: "#FF4E01",
              fontSize: "clamp(36px, 6vw, 72px)",
              lineHeight: 1.1,
            }}
          >
            {t.ctaEmbajadorTitle}
          </h2>
          <CtaButton label={t.ctaButtonLabel} />
        </Reveal>
      </section>

      {/* 5 — Student Hub */}
      <section
        id="student-hub"
        className="relative flex flex-col justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, height: "100vh" }}
      >
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{ zIndex: 0, opacity: 0.18 }}
        >
          <Image
            src="/assets/home/ballena-dots.png"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center", filter: "brightness(2)" }}
          />
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
            className="mt-10 rounded-3xl max-w-3xl sm:ml-10"
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
        </div>
      </section>

      {/* 6 — CTA hub */}
      <section
        className="relative flex flex-col items-center justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, height: "100vh" }}
      >
        {/* Honeybadger punteado */}
        <div
          className="absolute pointer-events-none select-none hidden sm:block"
          style={{
            top: "50%",
            left: "8%",
            transform: "translateY(-50%)",
            width: "min(28vw, 340px)",
            height: "min(38vw, 460px)",
            zIndex: 1,
            opacity: 0.85,
          }}
        >
          <Image
            src="/assets/home/honeybadger-dots.png"
            alt=""
            fill
            style={{ objectFit: "contain", filter: "brightness(2)" }}
          />
        </div>

        <Reveal
          className="relative flex flex-col items-center gap-10 text-center"
          style={{ zIndex: 2 }}
        >
          <h2
            style={{
              ...labelStyle,
              color: "#FF4E01",
              fontSize: "clamp(36px, 6vw, 72px)",
              lineHeight: 1.1,
            }}
          >
            {t.ctaHubTitle}
          </h2>
          <CtaButton label={t.ctaButtonLabel} />
        </Reveal>
      </section>

      {/* 7 — Comunidades */}
      <section
        id="comunidades"
        className="relative flex flex-col justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, height: "100vh" }}
      >
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{ zIndex: 0, opacity: 0.18 }}
        >
          <Image
            src="/assets/home/ballena-dots.png"
            alt=""
            fill
            style={{
              objectFit: "cover",
              objectPosition: "center bottom",
              filter: "brightness(2)",
            }}
          />
        </div>

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
            className="mt-10 rounded-3xl max-w-3xl sm:ml-10"
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
        </div>

        <Reveal delay={0.25} className="relative mt-14 w-full" style={{ zIndex: 2 }}>
          <LogoMarquee id="comus" direction="right" />
        </Reveal>
      </section>

      {/* 8 — CTA comunidad */}
      <section
        className="relative flex flex-col items-center justify-center px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, height: "100vh" }}
      >
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
              "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.4) 20%, rgba(13,13,11,0.4) 80%, #171616 100%)",
          }}
        />

        <Reveal
          className="relative flex flex-col items-center gap-10 text-center max-w-4xl"
          style={{ zIndex: 2 }}
        >
          <h2
            style={{
              ...labelStyle,
              color: "#FF4E01",
              fontSize: "clamp(36px, 6vw, 72px)",
              lineHeight: 1.15,
            }}
          >
            {t.ctaComunidadTitle}
          </h2>
          <CtaButton label={t.ctaButtonLabel} />
        </Reveal>
      </section>

      {/* 9 — Footer compartido con /home */}
      <Footer lang={lang} />

      <QaChatWidget />
    </main>
  );
}
