"use client";

import Image from "next/image";
import Reveal from "@/components/home/Reveal";
import ParallaxBg from "@/components/home/ParallaxBg";
import LogoMarquee, { type LogoItem } from "@/components/home/LogoMarquee";

// Piezas compartidas por las páginas de /mas. Salen de la vieja /comunidad
// (tarjeta de copy con borde Brote, CTA integrado, títulos PNG a altura fija);
// acá están extraídas porque ahora son cinco páginas y no una.

export const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

export const lightStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 300,
};

// Misma altura de letra para todos los títulos de sección del sitio.
export const TITLE_H = "clamp(40px, 5.5vw, 68px)";

const CARD: React.CSSProperties = {
  border: "1px solid #ABF760",
  background: "rgba(13,13,11,0.55)",
};

/**
 * Sección full-bleed con fondo parallax + degradé de legibilidad.
 * `tall` la lleva a pantalla completa (se usa para el hero de cada página);
 * el resto crece con su contenido: estas páginas tienen varios bloques y
 * forzar 100vh en cada uno deja huecos enormes.
 */
export function MasSection({
  id,
  bg,
  bgOpacity = 0.22,
  bgFilter,
  bgPosition = "center",
  tall = false,
  first = false,
  compactTop = false,
  centered = false,
  decoration,
  children,
}: {
  id?: string;
  bg: string;
  bgOpacity?: number;
  bgFilter?: string;
  bgPosition?: string;
  tall?: boolean;
  first?: boolean;
  /** Menos aire arriba, para pegarla al contenedor anterior. */
  compactTop?: boolean;
  /**
   * El contenedor interno (max-w-6xl) no lleva mx-auto por defecto: queda
   * pegado al borde izquierdo (mismo borde que el logo del navbar), a
   * propósito para secciones como "Presentación". Un hero con contenido
   * centrado (text-center + items-center) necesita `centered` para que ese
   * centrado sea real contra toda la pantalla y no contra esa caja corrida
   * a la izquierda — si no, en pantallas anchas queda más aire a la derecha
   * que a la izquierda.
   */
  centered?: boolean;
  /** Figura 3D u otro adorno, anclado a la sección y no al bloque de texto. */
  decoration?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`relative flex flex-col justify-center px-6 sm:px-10 overflow-hidden ${
        tall ? "sm:min-h-screen" : ""
      }`}
      style={{
        zIndex: 3,
        // El navbar es fixed: la primera sección necesita despejarlo.
        paddingTop: first
          ? "clamp(120px, 16vh, 180px)"
          : compactTop
            ? "clamp(24px, 3vh, 48px)"
            : "clamp(72px, 10vh, 120px)",
        paddingBottom: "clamp(72px, 10vh, 120px)",
      }}
    >
      <ParallaxBg
        src={bg}
        opacity={bgOpacity}
        filter={bgFilter}
        objectPosition={bgPosition}
        priority={first}
        drift={10}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to bottom, #171616 0%, rgba(13,13,11,0.4) 32%, rgba(13,13,11,0.4) 68%, #171616 100%)",
        }}
      />
      {decoration}
      <div className={`relative w-full max-w-6xl ${centered ? "mx-auto" : ""}`} style={{ zIndex: 2 }}>
        {children}
      </div>
    </section>
  );
}

/** Título de sección con asset PNG (los que ya existen en /titulos). */
export function TitleImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Reveal className="relative w-full" style={{ height: TITLE_H }}>
      <Image
        src={src}
        alt={alt}
        fill
        priority
        style={{ objectFit: "contain", objectPosition: "left center" }}
      />
    </Reveal>
  );
}

/**
 * Título de sección en texto, para los que todavía no tienen PNG de diseño
 * (MÁS, VOLUNTARIOS, STUDENT DEMO DAY). Mismo peso y altura aproximada que
 * los PNG para que la página no se lea despareja.
 */
export function TitleText({
  children,
  color = "#E6EEF2",
  delay = 0,
}: {
  children: React.ReactNode;
  color?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <h1
        style={{
          ...labelStyle,
          color,
          fontSize: "clamp(34px, 5vw, 60px)",
          lineHeight: 1.05,
        }}
      >
        {children}
      </h1>
    </Reveal>
  );
}

/** Encabezado de bloque interno dentro de una página de MÁS. */
export function BlockTitle({
  children,
  delay = 0,
  color = "#FF4E01",
}: {
  children: React.ReactNode;
  delay?: number;
  color?: string;
}) {
  return (
    <Reveal delay={delay}>
      <h2
        style={{
          ...labelStyle,
          color,
          fontSize: "clamp(18px, 2.4vw, 30px)",
          lineHeight: 1.15,
        }}
      >
        {children}
      </h2>
    </Reveal>
  );
}

/** Bajada del hero: una línea destacada bajo el título. */
export function Lead({ children, delay = 0.08 }: { children: React.ReactNode; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <p
        className="mt-6 max-w-3xl"
        style={{
          ...labelStyle,
          color: "#ABF760",
          fontSize: "clamp(15px, 1.9vw, 24px)",
          lineHeight: 1.3,
        }}
      >
        {children}
      </p>
    </Reveal>
  );
}

/** Tarjeta de copy con borde Brote — el contenedor de texto de todo /mas. */
export function CopyCard({
  paragraphs,
  delay = 0.15,
  className = "mt-8",
  justify = false,
}: {
  paragraphs: readonly string[];
  delay?: number;
  className?: string;
  justify?: boolean;
}) {
  return (
    <Reveal
      delay={delay}
      className={`${className} rounded-3xl w-full`}
      style={{ ...CARD, padding: "clamp(24px, 4vw, 40px)" }}
    >
      {paragraphs.map((paragraph, i) => (
        <p
          key={i}
          className={i === 0 ? undefined : "mt-3"}
          style={{
            ...lightStyle,
            color: "#E6EEF2",
            fontSize: "clamp(14px, 1.4vw, 17px)",
            lineHeight: 1.6,
            textAlign: justify ? "justify" : "left",
          }}
        >
          {paragraph}
        </p>
      ))}
    </Reveal>
  );
}

/** Lista de etiquetas en píldoras (disciplinas, categorías, filtros). */
export function Chips({
  items,
  delay = 0.1,
  color = "#E6EEF2",
  border = "rgba(171,247,96,0.45)",
}: {
  items: readonly string[];
  delay?: number;
  color?: string;
  border?: string;
}) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {items.map((item, i) => (
        <Reveal key={item} delay={delay + i * 0.04}>
          <span
            className="inline-block rounded-full"
            style={{
              ...labelStyle,
              color,
              border: `1px solid ${border}`,
              background: "rgba(13,13,11,0.5)",
              fontSize: "clamp(11px, 1vw, 13px)",
              padding: "9px 18px",
            }}
          >
            {item}
          </span>
        </Reveal>
      ))}
    </div>
  );
}

/** Grilla de tarjetas cortas: un título y, opcional, una línea de detalle. */
export function FeatureGrid({
  items,
  cols = "sm:grid-cols-2 lg:grid-cols-4",
  delay = 0.1,
}: {
  items: readonly { title: string; detail?: string }[];
  cols?: string;
  delay?: number;
}) {
  return (
    <div className={`mt-8 grid grid-cols-1 ${cols} gap-5`}>
      {items.map((item, i) => (
        <Reveal
          key={item.title}
          delay={delay + i * 0.08}
          className="rounded-2xl h-full"
          style={{ ...CARD, padding: "clamp(20px, 2.4vw, 28px)" }}
        >
          <h3
            style={{
              ...labelStyle,
              color: "#ABF760",
              fontSize: "clamp(13px, 1.3vw, 16px)",
              lineHeight: 1.25,
            }}
          >
            {item.title}
          </h3>
          {item.detail && (
            <p
              className="mt-3"
              style={{
                ...lightStyle,
                color: "#A5A8B1",
                fontSize: "clamp(13px, 1.2vw, 15px)",
                lineHeight: 1.55,
              }}
            >
              {item.detail}
            </p>
          )}
        </Reveal>
      ))}
    </div>
  );
}

/**
 * Botón de CTA. `href = null` significa "formulario todavía no confirmado por
 * la organización" (ver lib/mas/links.ts): se dibuja apagado y sin link, para
 * que se vea que el bloque está armado pero el destino falta.
 */
export function CtaButton({
  label,
  href,
  pendingLabel,
}: {
  label: string;
  href?: string | null;
  pendingLabel: string;
}) {
  if (!href) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex flex-col items-center rounded-full"
        style={{
          ...labelStyle,
          color: "#A5A8B1",
          border: "2px solid rgba(165,168,177,0.4)",
          background: "rgba(13,13,11,0.5)",
          fontSize: "clamp(13px, 1.2vw, 16px)",
          padding: "14px 40px",
          cursor: "not-allowed",
        }}
      >
        {label}
        <span style={{ ...lightStyle, fontSize: "10px", marginTop: 4, letterSpacing: "0.08em" }}>
          {pendingLabel}
        </span>
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-full transition-colors duration-200 border-2 hover:bg-[#ABF760] hover:text-[#171616]"
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

/** CTA integrado: pregunta + botón en una misma barra, para cerrar un bloque. */
export function InlineCta({
  title,
  label,
  href,
  pendingLabel,
  delay = 0.2,
}: {
  title: string;
  label: string;
  href?: string | null;
  pendingLabel: string;
  delay?: number;
}) {
  return (
    <Reveal
      delay={delay}
      className="mt-10 w-full flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-6 rounded-3xl"
      style={{ ...CARD, padding: "clamp(22px, 3vw, 36px) clamp(24px, 4vw, 48px)" }}
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
        <CtaButton label={label} href={href} pendingLabel={pendingLabel} />
      </div>
    </Reveal>
  );
}

/**
 * Tira de logos (universidades, comunidades, sponsors).
 *
 * Es un envoltorio de `LogoMarquee`: la organización pidió que en TODA sección
 * con logos el movimiento sea el mismo, así que acá no hay layout propio, solo
 * el título de sección y los huecos mientras no lleguen los archivos.
 */
export function LogoStrip({
  count = 8,
  label,
  items,
  direction = "right",
}: {
  count?: number;
  label: string;
  /** Logos reales. Sin esto se dibujan `count` huecos punteados. */
  items?: LogoItem[];
  direction?: "left" | "right";
}) {
  const list: LogoItem[] =
    items && items.length > 0
      ? items
      : Array.from({ length: count }, () => ({ alt: label }));

  return <LogoMarquee items={list} direction={direction} className="mt-8" />;
}
