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

const TICKETS = [
  {
    tier: "General",
    code: "GEN",
    level: "01",
    pass: "General Pass",
    accent: "#A5A8B1",
    background:
      "linear-gradient(155deg, #3a3a3a 0%, #1c1c1c 45%, #2e2e2e 70%, #111 100%)",
  },
  {
    tier: "Business",
    code: "BIZ",
    level: "02",
    pass: "Business Pass",
    accent: "#F7931A",
    background:
      "linear-gradient(155deg, #f2f2f2 0%, #cfcfcf 30%, #8a8a8a 55%, #d8d8d8 75%, #a0a0a0 100%)",
    dark: false,
  },
  {
    tier: "Experience",
    code: "EXP",
    level: "03",
    pass: "Experience Pass",
    accent: "#F7931A",
    background:
      "linear-gradient(155deg, #3a1d6e 0%, #b02ee0 25%, #F7931A 50%, #2ee0c8 75%, #1c1c3a 100%)",
  },
] as const;

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

      {/* Tickets */}
      <section
        id="tickets"
        className="relative px-6 sm:px-10 overflow-hidden"
        style={{ zIndex: 3, paddingTop: "8rem", paddingBottom: "10rem" }}
      >
        {/* Fondo: lluvia de dígitos */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{ zIndex: 0, opacity: 0.5 }}
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
              "linear-gradient(to bottom, #0D0D0B 0%, rgba(13,13,11,0.4) 15%, rgba(13,13,11,0.4) 80%, #0D0D0B 100%)",
          }}
        />

        <div className="relative w-full max-w-6xl" style={{ zIndex: 2 }}>
          <h2
            style={{
              ...labelStyle,
              color: "#9ACE6A",
              fontSize: "clamp(48px, 9vw, 104px)",
              lineHeight: 1,
            }}
          >
            Tickets
          </h2>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
            {TICKETS.map((ticket) => (
              <div
                key={ticket.tier}
                className="relative rounded-2xl mx-auto sm:mx-0 w-full max-w-[260px]"
                style={{
                  aspectRatio: "5 / 8",
                  background: ticket.background,
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    ...labelStyle,
                    color: ticket.tier === "Business" ? "#0D0D0B" : ticket.accent,
                    fontSize: "clamp(16px, 1.6vw, 20px)",
                  }}
                >
                  {ticket.tier}
                </div>
                <div
                  style={{
                    height: "2px",
                    width: "40%",
                    background:
                      ticket.tier === "Business"
                        ? "rgba(13,13,11,0.4)"
                        : "rgba(255,255,255,0.25)",
                    margin: "10px 0 16px",
                  }}
                />

                <div
                  style={{
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 300,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontSize: "9px",
                    color: ticket.tier === "Business" ? "rgba(13,13,11,0.6)" : "#A5A8B1",
                  }}
                >
                  Access Level
                </div>
                <div
                  style={{
                    ...labelStyle,
                    color: ticket.tier === "Business" ? "#0D0D0B" : "#FCFCFC",
                    fontSize: "clamp(22px, 3vw, 30px)",
                    marginTop: "2px",
                  }}
                >
                  HODL
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 300,
                    fontSize: "9px",
                    color: ticket.tier === "Business" ? "rgba(13,13,11,0.6)" : "#A5A8B1",
                    marginTop: "2px",
                  }}
                >
                  LABITCONF 2026
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 300,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontSize: "9px",
                    color: ticket.tier === "Business" ? "rgba(13,13,11,0.6)" : "#A5A8B1",
                    marginTop: "20px",
                  }}
                >
                  Access Type
                </div>
                <div
                  style={{
                    ...labelStyle,
                    color: ticket.tier === "Business" ? "#0D0D0B" : ticket.accent,
                    fontSize: "clamp(11px, 1.2vw, 13px)",
                    marginTop: "2px",
                  }}
                >
                  {ticket.pass}
                </div>

                <div
                  className="absolute"
                  style={{
                    bottom: "76px",
                    left: "20px",
                    ...labelStyle,
                    color: ticket.tier === "Business" ? "#0D0D0B" : "#F7931A",
                    fontSize: "clamp(30px, 4vw, 40px)",
                  }}
                >
                  {ticket.level}
                </div>

                <div
                  className="absolute rounded-full flex items-center justify-center"
                  style={{
                    bottom: "76px",
                    right: "20px",
                    width: "34px",
                    height: "34px",
                    border: `1px solid ${
                      ticket.tier === "Business" ? "rgba(13,13,11,0.4)" : "rgba(255,255,255,0.3)"
                    }`,
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 900,
                    fontSize: "8px",
                    color: ticket.tier === "Business" ? "#0D0D0B" : "#FCFCFC",
                  }}
                >
                  {ticket.code}
                </div>

                <div
                  className="absolute"
                  style={{
                    bottom: "20px",
                    left: "20px",
                    fontFamily: "var(--font-neue-machina), sans-serif",
                    fontWeight: 900,
                    fontSize: "10px",
                    color: ticket.tier === "Business" ? "#0D0D0B" : "#FCFCFC",
                  }}
                >
                  LABITCONF 2026
                  <div
                    style={{
                      fontWeight: 300,
                      fontSize: "8px",
                      color: ticket.tier === "Business" ? "rgba(13,13,11,0.6)" : "#A5A8B1",
                      marginTop: "2px",
                    }}
                  >
                    Hodl the future
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Honeybadger */}
          <div
            className="absolute pointer-events-none select-none hidden sm:block"
            style={{
              bottom: "-2rem",
              left: "-1rem",
              width: "min(16vw, 170px)",
              height: "min(16vw, 170px)",
              zIndex: 3,
            }}
          >
            <Image
              src="/assets/home/honeybadger.png"
              alt=""
              fill
              style={{ objectFit: "contain" }}
            />
          </div>

          <span
            className="relative mt-16 sm:mt-24 block text-center"
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
