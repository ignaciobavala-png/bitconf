"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/home/Navbar";

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

// Tinte naranja #F7931A para las figuras punteadas: fuerza el asset gris a
// negro y lo recolorea (invert/sepia/saturate calculados para ese hex)
const orangeTint =
  "brightness(0) saturate(100%) invert(60%) sepia(51%) saturate(1521%) hue-rotate(347deg) brightness(99%) contrast(97%)";

const VERTICALES = [
  {
    title: "Embajadores",
    href: "#embajadores",
    image: "/assets/home/honeybadger-dots.png",
    labelPosition: "bottom",
  },
  {
    title: "Student Hub",
    href: "#student-hub",
    image: "/assets/home/ballena-dots.png",
    labelPosition: "top",
  },
  {
    title: "Comunidades",
    href: "#comunidades",
    image: "/assets/home/pildora-dots.png",
    labelPosition: "bottom",
  },
] as const;

const EMBAJADORES: { name: [string, string]; gradient: string }[] = [
  {
    name: ["Axel", "Becker"],
    gradient: "linear-gradient(135deg, #1c1c1c 0%, #F7931A 100%)",
  },
];

const LOGO_PLACEHOLDERS = Array.from({ length: 10 }, (_, i) => `logo-${i}`);

function CtaButton({ label }: { label: string }) {
  return (
    <a
      href="#"
      className="rounded-full transition-colors duration-200 border-2 hover:bg-[#9ACE6A] hover:text-[#0D0D0B]"
      style={{
        ...labelStyle,
        color: "#FCFCFC",
        borderColor: "#9ACE6A",
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
              color: "#FCFCFC",
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
  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#0D0D0B" }}
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
              "linear-gradient(to bottom, #0D0D0B 0%, rgba(13,13,11,0.45) 20%, rgba(13,13,11,0.45) 80%, #0D0D0B 100%)",
          }}
        />

        <div className="relative w-full max-w-6xl" style={{ zIndex: 2 }}>
          <h1
            style={{
              ...labelStyle,
              color: "#F7931A",
              fontSize: "clamp(48px, 9vw, 104px)",
              lineHeight: 1,
            }}
          >
            Comunidad
          </h1>

          <div className="relative mt-12 sm:ml-10 max-w-3xl">
            <div
              className="rounded-3xl"
              style={{
                border: "1px solid #9ACE6A",
                background: "rgba(13,13,11,0.55)",
                padding: "clamp(24px, 4vw, 48px)",
              }}
            >
              <p
                style={{
                  ...lightStyle,
                  color: "#FCFCFC",
                  fontSize: "clamp(14px, 1.4vw, 17px)",
                  lineHeight: 1.6,
                }}
              >
                LABITCONF vuelve a Buenos Aires para su edición número 13,
                conectando a los líderes, constructores y comunidades que están
                dando forma al futuro de América Latina.
              </p>
              <p
                className="mt-4"
                style={{
                  ...lightStyle,
                  color: "#FCFCFC",
                  fontSize: "clamp(14px, 1.4vw, 17px)",
                  lineHeight: 1.6,
                }}
              >
                Porque las mejores historias son las que siguen construyéndose.
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
              <Image
                src="/assets/home/pildora.png"
                alt=""
                fill
                style={{ objectFit: "contain", transform: "rotate(-25deg)" }}
              />
            </div>
          </div>
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
              "linear-gradient(to bottom, #0D0D0B 0%, rgba(13,13,11,0.4) 20%, rgba(13,13,11,0.4) 80%, #0D0D0B 100%)",
          }}
        />

        <div
          className="relative mx-auto w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 items-center"
          style={{ zIndex: 2 }}
        >
          {VERTICALES.map((vertical) => (
            <div key={vertical.title} className="flex flex-col items-center gap-5">
              {vertical.labelPosition === "top" && (
                <a
                  href={vertical.href}
                  className="transition-opacity duration-200 hover:opacity-70"
                  style={{
                    ...lightStyle,
                    color: "#FCFCFC",
                    fontSize: "clamp(12px, 1.1vw, 14px)",
                  }}
                >
                  Inscribirme
                </a>
              )}

              <a
                href={vertical.href}
                className="relative block w-full rounded-3xl overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
                style={{
                  aspectRatio: "1 / 1.15",
                  border: "1px solid #9ACE6A",
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
                    color: "#FCFCFC",
                    fontSize: "clamp(24px, 2.6vw, 34px)",
                    lineHeight: 1.15,
                    textShadow: "0 2px 20px rgba(0,0,0,0.8)",
                  }}
                >
                  {vertical.title}
                </span>
              </a>

              {vertical.labelPosition === "bottom" && (
                <a
                  href={vertical.href}
                  className="transition-opacity duration-200 hover:opacity-70"
                  style={{
                    ...lightStyle,
                    color: "#FCFCFC",
                    fontSize: "clamp(12px, 1.1vw, 14px)",
                  }}
                >
                  Inscribirme
                </a>
              )}
            </div>
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
              "linear-gradient(to bottom, #0D0D0B 0%, rgba(13,13,11,0.4) 15%, rgba(13,13,11,0.4) 80%, #0D0D0B 100%)",
          }}
        />

        <div className="relative w-full" style={{ zIndex: 2 }}>
          <div className="w-full max-w-6xl">
            <h2
              style={{
                ...labelStyle,
                color: "#F7931A",
                fontSize: "clamp(44px, 7vw, 84px)",
                lineHeight: 1,
              }}
            >
              Embajadores
            </h2>
          </div>

          <div className="mt-14 mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-8 justify-items-center">
            {Array.from({ length: 3 }, (_, i) => {
              const embajador = EMBAJADORES[i];
              return (
                <div
                  key={i}
                  className="relative rounded-3xl overflow-hidden w-full max-w-[260px]"
                  style={{
                    aspectRatio: "3 / 4",
                    border: "1px solid #9ACE6A",
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
                      <div className="absolute bottom-6 left-5">
                        <div
                          style={{
                            ...labelStyle,
                            color: "#FCFCFC",
                            fontSize: "clamp(20px, 2.2vw, 28px)",
                            lineHeight: 1.1,
                          }}
                        >
                          {embajador.name[0]}
                        </div>
                        <div
                          style={{
                            ...labelStyle,
                            color: "#F7931A",
                            fontSize: "clamp(20px, 2.2vw, 28px)",
                            lineHeight: 1.1,
                          }}
                        >
                          {embajador.name[1]}
                        </div>
                      </div>
                    </>
                  )}
                </div>
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
              "linear-gradient(to bottom, #0D0D0B 0%, rgba(13,13,11,0.35) 25%, rgba(13,13,11,0.35) 75%, #0D0D0B 100%)",
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
          <Image
            src="/assets/home/pildora.png"
            alt=""
            fill
            style={{ objectFit: "contain", transform: "rotate(-30deg)" }}
          />
        </div>

        <div
          className="relative flex flex-col items-center gap-10 text-center"
          style={{ zIndex: 2 }}
        >
          <h2
            style={{
              ...labelStyle,
              color: "#F7931A",
              fontSize: "clamp(36px, 6vw, 72px)",
              lineHeight: 1.1,
            }}
          >
            ¿Querés ser embajador?
          </h2>
          <CtaButton label="Inscribite acá" />
        </div>
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
          <h2
            style={{
              ...labelStyle,
              color: "#F7931A",
              fontSize: "clamp(44px, 7vw, 84px)",
              lineHeight: 1,
            }}
          >
            Student Hub
          </h2>

          <div
            className="mt-10 rounded-3xl max-w-3xl sm:ml-10"
            style={{
              border: "1px solid #9ACE6A",
              background: "rgba(13,13,11,0.55)",
              padding: "clamp(24px, 4vw, 40px)",
            }}
          >
            <p
              style={{
                ...lightStyle,
                color: "#FCFCFC",
                fontSize: "clamp(14px, 1.4vw, 17px)",
                lineHeight: 1.6,
              }}
            >
              {/* Copy placeholder — pendiente del cliente */}
              El Student Hub es el espacio de LABITCONF para estudiantes:
              charlas, workshops y networking para la próxima generación de
              constructores.
            </p>
          </div>

          <h3
            className="mt-16"
            style={{
              ...labelStyle,
              color: "#F7931A",
              fontSize: "clamp(30px, 4.6vw, 56px)",
              lineHeight: 1,
            }}
          >
            Universidades aliadas
          </h3>
        </div>

        <div className="relative mt-10 w-full" style={{ zIndex: 2 }}>
          <LogoMarquee id="unis" direction="left" />
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

        <div
          className="relative flex flex-col items-center gap-10 text-center"
          style={{ zIndex: 2 }}
        >
          <h2
            style={{
              ...labelStyle,
              color: "#F7931A",
              fontSize: "clamp(36px, 6vw, 72px)",
              lineHeight: 1.1,
            }}
          >
            ¿Querés unirte al hub?
          </h2>
          <CtaButton label="Inscribite acá" />
        </div>
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
          <div className="relative max-w-3xl">
            <h2
              style={{
                ...labelStyle,
                color: "#F7931A",
                fontSize: "clamp(44px, 7vw, 84px)",
                lineHeight: 1,
              }}
            >
              Comunidades
            </h2>

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
              <Image
                src="/assets/home/pildora.png"
                alt=""
                fill
                style={{ objectFit: "contain", transform: "rotate(20deg)" }}
              />
            </div>
          </div>

          <div
            className="mt-10 rounded-3xl max-w-3xl sm:ml-10"
            style={{
              border: "1px solid #9ACE6A",
              background: "rgba(13,13,11,0.55)",
              padding: "clamp(24px, 4vw, 40px)",
            }}
          >
            <p
              style={{
                ...lightStyle,
                color: "#FCFCFC",
                fontSize: "clamp(14px, 1.4vw, 17px)",
                lineHeight: 1.6,
              }}
            >
              {/* Copy placeholder — pendiente del cliente */}
              Estas son las comunidades que hacen que LABITCONF sea posible:
              grupos locales de toda América Latina que construyen, educan y
              difunden Bitcoin todo el año.
            </p>
          </div>
        </div>

        <div className="relative mt-14 w-full" style={{ zIndex: 2 }}>
          <LogoMarquee id="comus" direction="right" />
        </div>
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
              "linear-gradient(to bottom, #0D0D0B 0%, rgba(13,13,11,0.4) 20%, rgba(13,13,11,0.4) 80%, #0D0D0B 100%)",
          }}
        />

        <div
          className="relative flex flex-col items-center gap-10 text-center max-w-4xl"
          style={{ zIndex: 2 }}
        >
          <h2
            style={{
              ...labelStyle,
              color: "#F7931A",
              fontSize: "clamp(36px, 6vw, 72px)",
              lineHeight: 1.15,
            }}
          >
            ¿Querés unir tu comunidad?
          </h2>
          <CtaButton label="Inscribite acá" />
        </div>
      </section>

      {/* 9 — Cierre: astronauta sobre iconos + footer propio */}
      <section className="relative overflow-hidden" style={{ zIndex: 3 }}>
        <div
          className="relative flex items-end justify-center"
          style={{ minHeight: "62vh" }}
        >
          {/* Franja de iconos con wireframe */}
          <div
            className="absolute pointer-events-none select-none"
            style={{
              left: "50%",
              top: "42%",
              transform: "translate(-50%, -50%)",
              width: "min(92vw, 1400px)",
              aspectRatio: "1920 / 274",
              zIndex: 0,
              opacity: 0.9,
              mixBlendMode: "screen",
            }}
          >
            <Image
              src="/assets/home/iconos-wireframe.png"
              alt=""
              fill
              style={{ objectFit: "contain", objectPosition: "center" }}
            />
          </div>

          {/* Astronauta */}
          <div
            className="relative pointer-events-none select-none"
            style={{
              width: "min(50vw, 420px)",
              height: "min(52vw, 440px)",
              zIndex: 1,
            }}
          >
            <Image
              src="/assets/home/astronauta.png"
              alt=""
              fill
              style={{ objectFit: "contain", objectPosition: "center bottom" }}
            />
          </div>
        </div>

        {/* Footer especial de comunidad */}
        <footer
          className="relative px-6 sm:px-10 pt-14 pb-8"
          style={{ zIndex: 2, background: "#0D0D0B" }}
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 max-w-6xl mx-auto">
            <div className="max-w-xs">
              <div
                style={{
                  ...labelStyle,
                  color: "#FCFCFC",
                  fontSize: "clamp(13px, 1.2vw, 16px)",
                }}
              >
                LABITCONF.
              </div>
              <div
                style={{
                  ...labelStyle,
                  fontSize: "clamp(36px, 5vw, 56px)",
                  lineHeight: 1,
                  marginTop: "6px",
                  background:
                    "linear-gradient(90deg, #F7931A 0%, #F2A17A 40%, #E07AA0 70%, #B06BE0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                HODL
              </div>
              <p
                className="mt-4"
                style={{
                  ...lightStyle,
                  color: "#A5A8B1",
                  fontSize: "clamp(11px, 1vw, 13px)",
                  lineHeight: 1.5,
                }}
              >
                Desde 2013 la conferencia de Bitcoin más antigua del mundo y el
                evento número uno de la industria blockchain en América Latina.
              </p>
            </div>

            <div className="flex items-center gap-4 md:self-center">
              {[
                {
                  label: "Instagram",
                  href: "#",
                  path: "M12 2.2c2.7 0 3 .01 4.1.06 1 .05 1.6.2 1.9.34.5.2.8.4 1.2.8.4.4.6.7.8 1.2.14.4.3 1 .34 1.9.05 1.1.06 1.4.06 4.1s-.01 3-.06 4.1c-.05 1-.2 1.6-.34 1.9-.2.5-.4.8-.8 1.2-.4.4-.7.6-1.2.8-.4.14-1 .3-1.9.34-1.1.05-1.4.06-4.1.06s-3-.01-4.1-.06c-1-.05-1.6-.2-1.9-.34-.5-.2-.8-.4-1.2-.8-.4-.4-.6-.7-.8-1.2-.14-.4-.3-1-.34-1.9C2.21 15 2.2 14.7 2.2 12s.01-3 .06-4.1c.05-1 .2-1.6.34-1.9.2-.5.4-.8.8-1.2.4-.4.7-.6 1.2-.8.4-.14 1-.3 1.9-.34C7.5 2.21 7.8 2.2 12 2.2zM12 0C9.28 0 8.94.01 7.87.06c-1.07.05-1.8.22-2.44.47-.66.26-1.22.6-1.78 1.16C3.09 2.25 2.75 2.8 2.5 3.46c-.25.64-.42 1.37-.47 2.44C1.98 6.94 1.97 7.28 1.97 10v4c0 2.72.01 3.06.06 4.13.05 1.07.22 1.8.47 2.44.26.66.6 1.22 1.16 1.78.56.56 1.12.9 1.78 1.16.64.25 1.37.42 2.44.47C8.94 23.99 9.28 24 12 24s3.06-.01 4.13-.06c1.07-.05 1.8-.22 2.44-.47.66-.26 1.22-.6 1.78-1.16.56-.56.9-1.12 1.16-1.78.25-.64.42-1.37.47-2.44.05-1.07.06-1.41.06-4.13v-4c0-2.72-.01-3.06-.06-4.13-.05-1.07-.22-1.8-.47-2.44-.26-.66-.6-1.22-1.16-1.78C21.75 1.09 21.2.75 20.54.5c-.64-.25-1.37-.42-2.44-.47C17.06.01 16.72 0 14 0z M12 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 12 8a4 4 0 0 1 0 8zM19.85 4.15a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z",
                },
                {
                  label: "X",
                  href: "#",
                  path: "M18.9 1.9h3.7l-8 9.2 9.4 12.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.9h7.6l5.2 7 6.1-7zm-1.3 19.3h2L6.5 4.1H4.4l13.2 17.1z",
                },
                {
                  label: "LinkedIn",
                  href: "#",
                  path: "M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.24 8.24h4.48V24H.24V8.24zM8.4 8.24h4.3v2.15h.06c.6-1.13 2.05-2.32 4.22-2.32 4.52 0 5.35 2.97 5.35 6.84V24h-4.48v-7.29c0-1.74-.03-3.98-2.43-3.98-2.43 0-2.8 1.9-2.8 3.86V24H8.4V8.24z",
                },
                {
                  label: "Email",
                  href: "#",
                  path: "M1.5 4.5h21a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-21A1.5 1.5 0 0 1 0 18V6a1.5 1.5 0 0 1 1.5-1.5zm.7 1.9 9.3 6.7a1 1 0 0 0 1 0l9.3-6.7H2.2zM2 8.4V17h20V8.4l-9.2 6.6a2.5 2.5 0 0 1-2.6 0L2 8.4z",
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex items-center justify-center rounded-lg transition-opacity duration-200 hover:opacity-80"
                  style={{ width: "38px", height: "38px", background: "#F7931A" }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#0D0D0B">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>

            <div className="flex gap-16">
              <div>
                <div
                  style={{
                    ...labelStyle,
                    color: "#FCFCFC",
                    fontSize: "clamp(12px, 1.1vw, 14px)",
                  }}
                >
                  Eventos 2026
                </div>
                <div
                  className="mt-3"
                  style={{
                    ...lightStyle,
                    color: "#A5A8B1",
                    fontSize: "clamp(12px, 1.1vw, 14px)",
                    lineHeight: 2,
                  }}
                >
                  Buenos Aires, Argentina
                </div>
              </div>

              <div>
                <div
                  style={{
                    ...labelStyle,
                    color: "#FCFCFC",
                    fontSize: "clamp(12px, 1.1vw, 14px)",
                  }}
                >
                  Enlaces Rápidos
                </div>
                <div
                  className="mt-3 flex flex-col gap-2"
                  style={{
                    ...lightStyle,
                    color: "#A5A8B1",
                    fontSize: "clamp(12px, 1.1vw, 14px)",
                  }}
                >
                  <a href="/home#presentacion" className="hover:opacity-70 transition-opacity">
                    Sobre LABITCONF
                  </a>
                  <a href="/home#tickets" className="hover:opacity-70 transition-opacity">
                    Tickets
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div
            className="mt-12 pt-6 max-w-6xl mx-auto flex flex-col sm:flex-row justify-between gap-2"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              ...lightStyle,
              color: "#6b6e73",
              fontSize: "11px",
            }}
          >
            <span>© 2026 LABITCONF — Latin America Bitcoin & Blockchain Conference</span>
            <span>Política de Privacidad · Términos y Condiciones</span>
          </div>
        </footer>
      </section>

      {/* Botón flotante Q&A */}
      <a
        href="#qa"
        className="fixed flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-105"
        style={{
          zIndex: 5,
          bottom: "28px",
          right: "28px",
          width: "56px",
          height: "56px",
          background: "#9ACE6A",
          color: "#0D0D0B",
          fontFamily: "var(--font-neue-machina), sans-serif",
          fontWeight: 900,
          fontSize: "12px",
        }}
      >
        Q&A
      </a>
    </main>
  );
}
