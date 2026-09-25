"use client";

import Image from "next/image";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import Reveal from "@/components/home/Reveal";
import MasNav from "@/components/mas/MasNav";
import { useLangStore } from "@/lib/store/lang";
import { MasSection, CtaButton, labelStyle } from "@/components/mas/ui";

// MÁS → HACKATHON, página propia (antes placeholder "Próximamente"). Primer
// maquetado a partir de dos capturas que la organización pasó por Descargas
// (24/09/2026): hero + cartel oficial del Hackathon EDU HUB.
//
// Assets nuevos en public/assets/home/ (de la carpeta de Drive que
// compartieron, comprimidos con `convert`, nunca el original):
// - hackathon-logo.png: versión blanca del wordmark "HACKATHON EDU HUB",
//   recortada al contenido (-trim). El Drive también tenía naranja y negra;
//   blanca es la que lee sobre el fondo oscuro del sitio.
// - hackathon-cartel-legs2.jpg: recorte del cartel (foto de la carrera de la
//   edición anterior) a la franja de piernas corriendo, sin texto horneado.
//   Se probó como fondo del hero, pero Ignacio confirmó que el diseño de
//   Canva de la organización para esta pantalla es negro liso (no la foto)
//   — así que el hero quedó con bgOpacity 0 y este archivo sin usarse por
//   ahora. Se deja en public/assets/home/ por si en otra sección de esta
//   página hace falta un fondo con textura (ver /mas/edu-hub para el mismo
//   patrón con hashes.jpg). El cartel completo sí confirma la fecha "30 y
//   31 de octubre", que no estaba en ningún otro lado todavía.
//
// El link de LUMA ya estaba resuelto en /mas/edu-hub (HACKATHON_LUMA_HREF)
// — la segunda captura lo confirma tal cual. La primera captura traía
// además un "link al LUMA" que apunta a /event/manage/... (la URL de
// administración del evento, no la pública): no se usa, un visitante
// caería en un login de Luma.
//
// Bases del hackathon: Ignacio pasó el link definitivo (24/09/2026) — un
// Google Doc, no una URL propia de LABITCONF. El botón "Más info" queda
// habilitado con ese doc.
//
// Copy pendiente: la organización anotó en la propia captura "escribir aquí
// el texto de Gabi o Rochi" — el cuerpo de abajo reusa el copy ya aprobado
// en /mas/edu-hub (mismo hackathon) hasta que llegue el texto definitivo de
// esta página.
const HACKATHON_LUMA_HREF = "https://luma.com/cwhw1uls";
const HACKATHON_BASES_HREF =
  "https://docs.google.com/document/d/1h6GlcaLcnSlQdjanoidrk7rA0T6Q1Jwe1ttdXHUoUvk/edit?tab=t.0#heading=h.ty347pwluepb";
const HACKATHON_FLYER_SRC =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/mas/edu-hub/hackathon.jpg";

const T = {
  es: {
    alt: "Hackathon EDU HUB",
    fechaLugar: "30 y 31 de octubre — Costa Salguero, Bs. As.",
    tagline: "Tu próximo proyecto empieza acá.",
    participa: "Participá",
    masInfo: "Más info",
    pending: "Bases a confirmar",
    premio: "+ USD 1500 en premios",
    body: "2 días. 4 tracks. +1.500 USD en premios.\n\nEl corazón del EDU HUB. Equipos de estudiantes de universidades acreditadas detectan un problema real y construyen una solución funcional en 48 horas, dentro de LABITCONF, en Costa Salguero. Elegís uno de 4 tracks (Inclusión Financiera, Nueva Educación, Creator Economy, Impacto y Comunidad), tenés mentores todo el camino, y cerrás con premiación en el stage de LABITCONF y la fiesta de Halloween. Incluye Bootcamp previo de 4 encuentros en octubre para llegar afilado.",
  },
  en: {
    alt: "Hackathon EDU HUB",
    fechaLugar: "October 30–31 — Costa Salguero, Buenos Aires",
    tagline: "Your next project starts here.",
    participa: "Join in",
    masInfo: "More info",
    pending: "Rules to be confirmed",
    premio: "+ USD 1500 in prizes",
    body: "2 days. 4 tracks. +1,500 USD in prizes.\n\nThe heart of EDU HUB. Teams of students from accredited universities identify a real problem and build a working solution in 48 hours, inside LABITCONF, at Costa Salguero. Pick one of 4 tracks (Financial Inclusion, New Education, Creator Economy, Impact and Community), get mentors along the way, and wrap up with an awards ceremony on the LABITCONF stage and the Halloween party. Includes a 4-session Bootcamp in October to get you ready.",
  },
} as const;

export default function HackathonPage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#171616" }}>
      <Navbar />

      {/* Hero — la organización lo diseñó en Canva con fondo negro liso (no
          el cartel/foto): bgOpacity 0 deja el negro de MasSection sin la
          imagen de fondo, wordmark + fecha + CTA arriba. */}
      <MasSection bg="/assets/home/hackathon-cartel-legs2.jpg" bgOpacity={0} first tall centered>
        <div className="flex flex-col items-center text-center gap-6">
          <Reveal className="relative w-full max-w-xl" style={{ aspectRatio: "698 / 307" }}>
            <Image
              src="/assets/home/hackathon-logo.png"
              alt={t.alt}
              fill
              sizes="(max-width: 640px) 100vw, 576px"
              style={{ objectFit: "contain" }}
              priority
            />
          </Reveal>

          <Reveal delay={0.1}>
            <p style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(14px, 1.6vw, 18px)" }}>
              {t.fechaLugar}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <p style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(18px, 2.6vw, 30px)" }}>{t.tagline}</p>
          </Reveal>

          <Reveal delay={0.22} className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <CtaButton label={t.participa} href={HACKATHON_LUMA_HREF} pendingLabel={t.pending} />
            <CtaButton label={t.masInfo} href={HACKATHON_BASES_HREF} pendingLabel={t.pending} />
          </Reveal>
        </div>
      </MasSection>

      {/* Sobre el Hackathon — layout tal como está en hackaton1.png
          (Descargas): flyer a la izquierda, wordmark + copy + los dos CTA
          (participá / más info) a la derecha, todo dentro de una misma card
          con borde Brote. El copy reusa el ya aprobado en /mas/edu-hub para
          este mismo hackathon. */}
      <MasSection id="sobre-hackathon" bg="/assets/home/hashes.jpg" bgOpacity={0.25} centered>
        <div
          className="flex flex-col sm:flex-row sm:items-start gap-6 rounded-3xl overflow-hidden"
          style={{ border: "1px solid #ABF760", background: "rgba(13,13,11,0.55)", padding: "16px" }}
        >
          <div
            className="relative shrink-0 w-full sm:w-[260px] rounded-2xl overflow-hidden"
            style={{ aspectRatio: "4 / 5" }}
          >
            <Image
              src={HACKATHON_FLYER_SRC}
              alt={t.alt}
              fill
              sizes="(max-width: 640px) 100vw, 260px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div
            style={{ padding: "clamp(8px, 1.5vw, 20px) clamp(8px, 1.5vw, 20px) clamp(8px, 1.5vw, 20px) 0" }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="relative w-full max-w-xs" style={{ aspectRatio: "698 / 307" }}>
              <Image
                src="/assets/home/hackathon-logo.png"
                alt={t.alt}
                fill
                sizes="320px"
                style={{ objectFit: "contain", objectPosition: "left center" }}
              />
            </div>

            <span
              className="mt-5"
              style={{
                ...labelStyle,
                color: "#171616",
                background: "#FF4E01",
                borderRadius: 999,
                fontSize: "clamp(11px, 0.9vw, 13px)",
                padding: "6px 14px",
                width: "fit-content",
              }}
            >
              {t.premio}
            </span>
            <p
              style={{
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 300,
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
              <CtaButton label={t.participa} href={HACKATHON_LUMA_HREF} pendingLabel={t.pending} />
              <CtaButton label={t.masInfo} href={HACKATHON_BASES_HREF} pendingLabel={t.pending} />
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
