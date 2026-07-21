"use client";

import Image from "next/image";
import HodlReasonsSection from "@/components/HodlReasonsSection";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/labitconf/",
    path: "M12 2.2c2.7 0 3 .01 4.1.06 1 .05 1.6.2 1.9.34.5.2.8.4 1.2.8.4.4.6.7.8 1.2.14.4.3 1 .34 1.9.05 1.1.06 1.4.06 4.1s-.01 3-.06 4.1c-.05 1-.2 1.6-.34 1.9-.2.5-.4.8-.8 1.2-.4.4-.7.6-1.2.8-.4.14-1 .3-1.9.34-1.1.05-1.4.06-4.1.06s-3-.01-4.1-.06c-1-.05-1.6-.2-1.9-.34-.5-.2-.8-.4-1.2-.8-.4-.4-.6-.7-.8-1.2-.14-.4-.3-1-.34-1.9C2.21 15 2.2 14.7 2.2 12s.01-3 .06-4.1c.05-1 .2-1.6.34-1.9.2-.5.4-.8.8-1.2.4-.4.7-.6 1.2-.8.4-.14 1-.3 1.9-.34C7.5 2.21 7.8 2.2 12 2.2zM12 0C9.28 0 8.94.01 7.87.06c-1.07.05-1.8.22-2.44.47-.66.26-1.22.6-1.78 1.16C3.09 2.25 2.75 2.8 2.5 3.46c-.25.64-.42 1.37-.47 2.44C1.98 6.94 1.97 7.28 1.97 10v4c0 2.72.01 3.06.06 4.13.05 1.07.22 1.8.47 2.44.26.66.6 1.22 1.16 1.78.56.56 1.12.9 1.78 1.16.64.25 1.37.42 2.44.47C8.94 23.99 9.28 24 12 24s3.06-.01 4.13-.06c1.07-.05 1.8-.22 2.44-.47.66-.26 1.22-.6 1.78-1.16.56-.56.9-1.12 1.16-1.78.25-.64.42-1.37.47-2.44.05-1.07.06-1.41.06-4.13v-4c0-2.72-.01-3.06-.06-4.13-.05-1.07-.22-1.8-.47-2.44-.26-.66-.6-1.22-1.16-1.78C21.75 1.09 21.2.75 20.54.5c-.64-.25-1.37-.42-2.44-.47C17.06.01 16.72 0 14 0z M12 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 12 8a4 4 0 0 1 0 8zM19.85 4.15a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z",
  },
  {
    label: "X",
    href: "https://x.com/labitconf",
    path: "M18.9 1.9h3.7l-8 9.2 9.4 12.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.9h7.6l5.2 7 6.1-7zm-1.3 19.3h2L6.5 4.1H4.4l13.2 17.1z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/labitconf/posts/?feedView=all",
    path: "M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.24 8.24h4.48V24H.24V8.24zM8.4 8.24h4.3v2.15h.06c.6-1.13 2.05-2.32 4.22-2.32 4.52 0 5.35 2.97 5.35 6.84V24h-4.48v-7.29c0-1.74-.03-3.98-2.43-3.98-2.43 0-2.8 1.9-2.8 3.86V24H8.4V8.24z",
  },
  {
    label: "Email",
    href: "mailto:contacto@labitconf.com",
    path: "M1.5 4.5h21a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-21A1.5 1.5 0 0 1 0 18V6a1.5 1.5 0 0 1 1.5-1.5zm.7 1.9 9.3 6.7a1 1 0 0 0 1 0l9.3-6.7H2.2zM2 8.4V17h20V8.4l-9.2 6.6a2.5 2.5 0 0 1-2.6 0L2 8.4z",
  },
] as const;

const T = {
  es: {
    footerBlurb:
      "Desde 2013 la conferencia de Bitcoin más antigua del mundo y el evento número uno de la industria blockchain en América Latina.",
    eventos2026: "Eventos 2026",
    location: "Buenos Aires, Argentina",
    quickLinks: "Enlaces Rápidos",
    aboutLink: "Sobre LABITCONF",
    followUs: "Seguinos en",
  },
  en: {
    footerBlurb:
      "Since 2013, the world's oldest Bitcoin conference and the number one blockchain industry event in Latin America.",
    eventos2026: "2026 Events",
    location: "Buenos Aires, Argentina",
    quickLinks: "Quick Links",
    aboutLink: "About LABITCONF",
    followUs: "Follow us on",
  },
} as const;

export default function Footer({ lang }: { lang: "es" | "en" }) {
  const t = T[lang];

  return (
    <footer id="contacto" className="relative overflow-hidden" style={{ zIndex: 3 }}>
      {/* Fila principal: watermark full-bleed + cápsula arriba + contactos debajo (desktop) */}
      <div className="relative h-[400px] lg:h-[420px]">
        <HodlReasonsSection variant="compact" showLangToggle={false} lang={lang} compactAlign="top" />

        {/* Máscara propia de la franja de contacto (la vignette de HodlReasonsSection solo cubre la cápsula).
            Concentrada del lado izquierdo (donde va el texto) y más suave hacia el centro/derecha,
            para que las frases del watermark se sigan viendo pasar del lado derecho. */}
        <div
          className="hidden lg:block absolute inset-0 pointer-events-none"
          style={{
            zIndex: 6,
            background:
              "linear-gradient(115deg, rgba(23,22,22,0.92) 0%, rgba(23,22,22,0.6) 24%, transparent 46%), " +
              "linear-gradient(to bottom, transparent 0%, transparent 34%, rgba(23,22,22,0.4) 55%, rgba(23,22,22,0.62) 100%)",
          }}
        />

        <div className="hidden lg:block absolute left-0 bottom-8 z-10 px-6 sm:px-10 pointer-events-none">
          <div className="pointer-events-auto max-w-xs shrink-0">
            <div style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(14px, 1.4vw, 18px)" }}>
              LABITCONF.
            </div>
            {/* Logo HODL (marca 2D) — reemplaza el wordmark de texto (asset del cliente) */}
            <div className="relative" style={{ marginTop: "6px", height: "clamp(30px, 4.2vw, 44px)", width: "clamp(111px, 15.5vw, 163px)" }}>
              <Image
                src="/assets/home/hodl-marca-v2.png"
                alt="HODL"
                fill
                sizes="163px"
                style={{ objectFit: "contain", objectPosition: "left center" }}
              />
            </div>
            <p
              className="mt-3 max-w-xs"
              style={{
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 300,
                color: "#A5A8B1",
                fontSize: "clamp(11px, 1vw, 13px)",
                lineHeight: 1.5,
              }}
            >
              {t.footerBlurb}
            </p>
          </div>
        </div>

        {/* Redes sociales — ancladas al piso del footer, lado derecho */}
        <div className="hidden lg:flex absolute right-0 bottom-8 z-10 flex-col items-end gap-3 px-6 sm:px-10 lg:pr-28 pointer-events-none">
          <span
            className="pointer-events-auto"
            style={{
              ...labelStyle,
              color: "#A5A8B1",
              fontSize: "clamp(11px, 1vw, 13px)",
            }}
          >
            {t.followUs}
          </span>
          <div className="pointer-events-auto flex items-center gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={social.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="flex items-center justify-center rounded-lg transition-opacity duration-200 hover:opacity-80"
                style={{ width: "34px", height: "34px", background: "#FF4E01" }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="#171616">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Contactos en mobile: debajo de la cápsula, en flujo normal (evita superponerse) */}
      <div className="lg:hidden px-6 pt-8 pb-12">
        <div style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(14px, 1.4vw, 18px)" }}>
          LABITCONF.
        </div>
        {/* Logo HODL (marca 2D) — reemplaza el wordmark de texto (asset del cliente) */}
        <div className="relative" style={{ marginTop: "6px", height: "clamp(30px, 8vw, 44px)", width: "clamp(111px, 29.6vw, 163px)" }}>
          <Image
            src="/assets/home/hodl-marca-v2.png"
            alt="HODL"
            fill
            sizes="163px"
            style={{ objectFit: "contain", objectPosition: "left center" }}
          />
        </div>
        <p
          className="mt-3 max-w-xs"
          style={{
            fontFamily: "var(--font-neue-machina), sans-serif",
            fontWeight: 300,
            color: "#A5A8B1",
            fontSize: "clamp(12px, 1.1vw, 14px)",
            lineHeight: 1.5,
          }}
        >
          {t.footerBlurb}
        </p>

        <span
          className="block mt-5"
          style={{
            ...labelStyle,
            color: "#A5A8B1",
            fontSize: "clamp(11px, 1vw, 13px)",
          }}
        >
          {t.followUs}
        </span>
        <div className="flex items-center gap-3 mt-3">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              target={social.href.startsWith("mailto:") ? undefined : "_blank"}
              rel={social.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              className="flex items-center justify-center rounded-lg transition-opacity duration-200 hover:opacity-80"
              style={{ width: "38px", height: "38px", background: "#FF4E01" }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#171616">
                <path d={social.path} />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
