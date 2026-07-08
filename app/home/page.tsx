"use client";

import Image from "next/image";

const NAV_LINKS = [
  { label: "¿Por qué hodleás?", href: "#hodleas" },
  { label: "Comunidad", href: "#comunidad" },
  { label: "Sé parte", href: "#se-parte" },
];

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

export default function HomePage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#0D0D0B" }}
    >
      {/* Fondo: ballena estilizada */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{ zIndex: 0 }}
      >
        <Image
          src="/assets/home/ballena.png"
          alt=""
          fill
          priority
          style={{
            objectFit: "contain",
            objectPosition: "85% 40%",
            opacity: 0.45,
            filter: "grayscale(1) brightness(3) contrast(0.9)",
          }}
        />
      </div>

      {/* Degradé para legibilidad sobre la ballena */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(13,13,11,0.75) 0%, rgba(13,13,11,0.4) 55%, transparent 80%)",
        }}
      />

      {/* Navbar */}
      <header
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 sm:px-10 py-6"
        style={{
          zIndex: 50,
          background:
            "linear-gradient(to bottom, rgba(13,13,11,0.85) 0%, rgba(13,13,11,0) 100%)",
        }}
      >
        <div className="flex items-center gap-8">
          <span
            style={{
              ...labelStyle,
              color: "#FCFCFC",
              fontSize: "clamp(14px, 1.4vw, 18px)",
            }}
          >
            LABITCONF.
          </span>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors duration-200 hover:opacity-70"
                style={{
                  ...labelStyle,
                  color: "#9ACE6A",
                  fontSize: "clamp(11px, 0.9vw, 13px)",
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <a
          href="#tickets"
          className="transition-colors duration-200 hover:opacity-70"
          style={{
            ...labelStyle,
            color: "#9ACE6A",
            fontSize: "clamp(12px, 1vw, 14px)",
          }}
        >
          Tickets
        </a>
      </header>

      {/* Hero central */}
      <section
        className="relative flex flex-col items-center justify-center px-6"
        style={{ zIndex: 3, minHeight: "78vh" }}
      >
        <div className="w-full flex justify-center">
          <Image
            src="/assets/home/hodl-3d.png"
            alt="LABITCONF 26 — HODL, Costa Salguero, BsAs, OCT 30-31"
            width={1600}
            height={528}
            priority
            className="w-[92vw] sm:w-[70vw] md:w-[52vw]"
            style={{ objectFit: "contain", height: "auto" }}
          />
        </div>

        <a
          href="#tickets"
          className="mt-8 rounded-full transition-colors duration-200 border-2"
          style={{
            ...labelStyle,
            color: "#0D0D0B",
            background: "#9ACE6A",
            borderColor: "#9ACE6A",
            fontSize: "clamp(12px, 1.1vw, 15px)",
            padding: "12px 32px",
          }}
        >
          Comprar Ticket
        </a>

        <span
          className="mt-10 animate-bounce"
          style={{
            fontFamily: "var(--font-neue-machina), sans-serif",
            fontWeight: 300,
            color: "#A5A8B1",
            fontSize: "clamp(11px, 0.9vw, 13px)",
            letterSpacing: "0.04em",
          }}
        >
          ↓ scroll para descubrir más
        </span>
      </section>

      {/* Presentación */}
      <section
        id="presentacion"
        className="relative px-6 sm:px-10"
        style={{ zIndex: 3, paddingTop: "8rem", paddingBottom: "8rem" }}
      >
        <div className="relative w-full max-w-6xl">
          {/* Textura pixel detrás del título */}
          <div
            className="absolute pointer-events-none select-none"
            style={{
              top: "-4rem",
              left: "-2rem",
              right: "-2rem",
              height: "16rem",
              zIndex: 0,
            }}
          >
            <Image
              src="/assets/home/labitconf-pixel.png"
              alt=""
              fill
              style={{ objectFit: "contain", objectPosition: "left center", opacity: 0.5 }}
            />
          </div>

          {/* Píldora BTC */}
          <div
            className="absolute pointer-events-none select-none hidden sm:block"
            style={{ top: "-1rem", right: "0", width: "min(22vw, 220px)", height: "min(22vw, 220px)", zIndex: 1 }}
          >
            <Image
              src="/assets/home/pildora.png"
              alt=""
              fill
              style={{ objectFit: "contain" }}
            />
          </div>

          <h2
            className="relative"
            style={{
              ...labelStyle,
              color: "#FCFCFC",
              fontSize: "clamp(48px, 9vw, 104px)",
              lineHeight: 1,
              zIndex: 2,
            }}
          >
            LABITCONF
          </h2>

          <p
            className="relative mt-6"
            style={{
              ...labelStyle,
              color: "#FCFCFC",
              fontSize: "clamp(20px, 3.2vw, 34px)",
              zIndex: 2,
            }}
          >
            Latin American <span style={{ color: "#F7931A" }}>Bitcoin</span> &{" "}
            <span style={{ color: "#F7931A" }}>Blockchain</span> Conference
          </p>

          <p
            className="relative mt-6 max-w-2xl"
            style={{
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontWeight: 300,
              color: "#A5A8B1",
              fontSize: "clamp(14px, 1.4vw, 17px)",
              lineHeight: 1.6,
              zIndex: 2,
            }}
          >
            LABITCONF vuelve a Buenos Aires para su edición número 13,
            conectando a los líderes, constructores y comunidades que están
            dando forma al futuro de América Latina.
          </p>

          <p
            className="relative mt-4 max-w-2xl"
            style={{
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontWeight: 300,
              color: "#A5A8B1",
              fontSize: "clamp(14px, 1.4vw, 17px)",
              lineHeight: 1.6,
              zIndex: 2,
            }}
          >
            Porque las mejores historias son las que siguen construyéndose.
          </p>
        </div>
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
