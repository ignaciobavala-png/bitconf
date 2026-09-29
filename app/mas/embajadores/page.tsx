"use client";

import { Fragment, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import Reveal from "@/components/home/Reveal";
import { useLangStore } from "@/lib/store/lang";
import MasNav from "@/components/mas/MasNav";
import ScrambleText from "@/components/mas/ScrambleText";
import DetectionTracker from "@/components/mas/DetectionTracker";

// Fondo de "Los seis universos": reemplaza lluvia-naranja.png estático por
// uno de los clips que mandó la organización (`~/Descargas/fondo1.mp4`,
// 25/09/2026). Original 4K/21,7MB → 1920px/24fps/crf30 sin audio (1MB) y
// subido al bucket público de Supabase; no se trackea en git.
const UNIVERSOS_BG_VIDEO_SRC =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/mas/embajadores/universos-bg.mp4";
import {
  MasSection,
  BlockTitle,
  Lead,
  CopyCard,
  FeatureGrid,
  labelStyle,
  lightStyle,
} from "@/components/mas/ui";

// MÁS → EMBAJADORES (bloque 05 del PDF "FASE 2 - WEB 15.08"). Página editorial.
// Los 6 embajadores ya tienen foto y nombre (gráficas propias de la
// organización, con su marco "EMBAJADORES" + placa de nombre horneados) — se
// usan tal cual las mandaron, sin recortar.
//
// Mini bio + red social de cada uno llegaron el 25/09/2026 por WhatsApp (texto
// suelto, sin columna "en"/"es" — la traducción al inglés es nuestra). No es
// un modal/popup: teaser siempre visible y, al tocar la foto, la bio completa
// + el link a la red se despliegan en un panel a todo el ancho debajo de la
// fila de esa ficha (una bio abierta por vez). Hasta el 29/09 se desplegaba
// dentro de cada celda y dejaba huecos negros bajo las fichas vecinas.

// Hero según el banner de Canva que mandó la organización (29/09/2026,
// `~/Descargas/embajadores.png`): fondo negro liso, título naranja en texto
// sobre la tira de íconos punteados con recuadros de "detección" verdes
// (`ICONOS_FONDO_NEGRO_BIT.png` del manual de marca: el fondo #171616 pasado
// a transparente con -fuzz y recortado con -trim), bajada en
// mayúsculas y "scroll para descubrir" abajo. El video de la ballena, que
// antes era el fondo del hero, pasó a la sección del copy.
const STRIP = { src: "/assets/home/iconos-fondo-bit.png", w: 1626, h: 230 } as const;

// El Canva del 29/09/2026 no trae el bloque "Seis voces. Seis universos…" +
// los tres párrafos del programa: se sacó de la página pero queda el texto
// (T.lead / T.copy) y la sección entera detrás de este flag, por si la
// organización lo vuelve a pedir. Poner en true para restaurarlo tal cual.
const SHOW_INTRO = false;

// Video de la ballena (Descargas/BALLENA_FINAL_PIVOT.mp4, 25/09/2026),
// recomprimido (h264 crf 30, sin audio) y subido al bucket público de
// Supabase — mismo patrón que HERO_VIDEO_SRC en app/mas/edu-hub/page.tsx.
const HERO_VIDEO_SRC =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/mas/embajadores/hero.mp4";

// Label del link según la red — "Ver" para LinkedIn porque "Seguir" no es el
// verbo que usa esa red.
const SOCIAL_LABEL = {
  x: { es: "Seguir en X", en: "Follow on X" },
  instagram: { es: "Seguir en Instagram", en: "Follow on Instagram" },
  linkedin: { es: "Ver LinkedIn", en: "View LinkedIn" },
} as const;

// Gráficas reales de cada embajador (foto + nombre horneados por la
// organización). Orden alfabético, sin preferencia editorial. Bio + red
// social: texto que mandó la organización por WhatsApp el 25/09/2026.
const AMBASSADORS = [
  {
    src: "/assets/home/embajadores/gabriela-pirela.jpg",
    name: "Gabriela Pirela",
    teaser: { es: "Creadora de contenido, creativa multipasional.", en: "Content creator, multi-passionate creative." },
    bio: {
      es: "Creadora de contenido. Creativa multipasional, me mueve impulsar y enseñar a otros creativos a monetizar sus habilidades y vivir de lo que saben hacer. En mi free time me gusta salir a museos, conocer cafés de especialidad y hacer cowork con amigos.",
      en: "Content creator. A multi-passionate creative, I love helping other creatives monetize their skills and make a living doing what they're good at. In my free time I like visiting museums, finding specialty coffee spots and working alongside friends.",
    },
    social: { platform: "instagram", href: "https://www.instagram.com/tuamigafreelo?stkn=aWZieThuZnNvM2hn" },
  },
  {
    src: "/assets/home/embajadores/gaucho.jpg",
    name: "Gaucho",
    teaser: {
      es: "Un Omnibot de Tomy de 1984 recuperado — hoy tiene cerebro propio.",
      en: "A restored 1984 Tomy Omnibot — now with a brain of his own.",
    },
    bio: {
      es: "Gaucho es un Omnibot de Tomy de 1984 recuperado. Gracias a una Raspberry Pi Zero, una ESP32, una cámara y un modelo de lenguaje que no se olvida de nada, hoy tiene cerebro propio: escucha, conversa, reconoce caras y canta. Hoy es DevRel y Content Creator de Paisanos.",
      en: "Gaucho is a restored 1984 Tomy Omnibot. Thanks to a Raspberry Pi Zero, an ESP32, a camera and a language model that never forgets, he now has a brain of his own: he listens, talks, recognizes faces and sings. Today he's DevRel and Content Creator at Paisanos.",
    },
    social: { platform: "x", href: "https://x.com/gauchopaisano" },
  },
  {
    src: "/assets/home/embajadores/hernan-gonzalez.jpg",
    name: "Hernán González",
    teaser: {
      es: "Educador y divulgador sobre tecnología, finanzas y Bitcoin.",
      en: "Educator and communicator on technology, finance and Bitcoin.",
    },
    bio: {
      es: "Educador y divulgador sobre tecnología, finanzas y Bitcoin. Creador de Bitcoin Stratos. Miembro de ONG Bitcoin Argentina. Me moviliza el hecho de ver cómo Bitcoin impacta positivamente en la vida de las personas, satisfaciendo necesidades y resolviendo problemas que el mundo tradicional en pleno siglo XXI no les ha podido solucionar.",
      en: "Educator and communicator on technology, finance and Bitcoin. Creator of Bitcoin Stratos. Member of Bitcoin Argentina NGO. What drives me is seeing how Bitcoin positively impacts people's lives, meeting needs and solving problems that the traditional world, well into the 21st century, hasn't been able to solve.",
    },
    social: { platform: "x", href: "https://x.com/hernigonz" },
  },
  {
    src: "/assets/home/embajadores/martin-gutter.jpg",
    name: "Martín Gütter",
    teaser: {
      es: "Speaker y divulgador tecnológico, creador de contenido.",
      en: "Speaker and tech communicator, content creator.",
    },
    bio: {
      es: "Speaker y divulgador tecnológico. Creador de contenido. Marketing y partnerships en Blockchain Acceleration Foundation (BAF) y Country Ambassador de Hedera para Argentina. Cofundó Wave, una comunidad pensada para que los jóvenes aprendan y emprendan en tecnologías como blockchain e inteligencia artificial. Es tallerista en la ONG Bitcoin Argentina y estudiante de Negocios Digitales en la Universidad Austral.",
      en: "Speaker and tech communicator. Content creator. Marketing and partnerships at Blockchain Acceleration Foundation (BAF) and Country Ambassador for Hedera in Argentina. Co-founded Wave, a community for young people to learn and build in technologies like blockchain and AI. Workshop leader at Bitcoin Argentina NGO and Digital Business student at Universidad Austral.",
    },
    social: { platform: "linkedin", href: "https://www.linkedin.com/in/martingutter" },
  },
  {
    src: "/assets/home/embajadores/mery-fiorentini.jpg",
    name: "Mery Fiorentini",
    teaser: { es: "Abogada especializada en tecnología.", en: "Lawyer specialized in technology." },
    bio: {
      es: "Mery es abogada especializada en tecnología. Se desempeña como Legal Associate en MGFV, donde asesora a startups y empresas tecnológicas y trabaja en proyectos vinculados con LegalTech, innovación y transformación digital. Además, forma parte del core team de Mujeres en Crypto, es docente, speaker y creadora de contenido sobre derecho y tecnología.",
      en: "Mery is a lawyer specialized in technology. She works as Legal Associate at MGFV, advising startups and tech companies and working on projects tied to LegalTech, innovation and digital transformation. She's also part of the core team at Mujeres en Crypto, and a teacher, speaker and content creator on law and technology.",
    },
    social: { platform: "instagram", href: "https://www.instagram.com/meryfiorentini?stkn=MWUxejQ4b2d6c2Zpag==" },
  },
  {
    src: "/assets/home/embajadores/noelia-robles.jpg",
    name: "Noelia Robles",
    teaser: { es: "Creadora de Bitácora Financiera.", en: "Creator of Bitácora Financiera." },
    bio: {
      es: "Creadora de Bitácora Financiera, comunicadora y educadora sobre Bitcoin y criptomonedas. Cuando conocí este mundo pensé que no era para mí: parecía difícil y lleno de palabras que no entendía. Hoy creo contenido y acompaño a otras personas para que puedan aprender, perder el miedo y dar sus primeros pasos de una manera simple y cercana.",
      en: "Creator of Bitácora Financiera, communicator and educator on Bitcoin and cryptocurrencies. When I first found this world I thought it wasn't for me — it seemed hard and full of words I didn't understand. Today I create content and support other people so they can learn, lose the fear, and take their first steps in a simple, approachable way.",
    },
    social: { platform: "instagram", href: "https://www.instagram.com/bitacora.noe" },
  },
] as const satisfies readonly {
  src: string;
  name: string;
  teaser: { es: string; en: string };
  bio: { es: string; en: string };
  social: { platform: keyof typeof SOCIAL_LABEL; href: string };
}[];

const T = {
  es: {
    alt: "Embajadores",
    heroSub: "Descubrí las 6 voces referentes de LABITCONF 2026",
    scrollHint: "scroll para descubrir",
    lead: "Seis voces. Seis universos. Una misma convicción.",
    copy: [
      "El programa reúne referentes con comunidades estratégicas para representar, activar y amplificar LABITCONF desde sus propios territorios.",
      "Hay personas que apostaron por sus ideas cuando nadie más creía en ellas. Que siguieron adelante cuando todo parecía indicar que debían abandonar. Personas que eligieron resistir, construir y mantenerse fieles a su visión.",
      "Este año, por primera vez en la historia de LABITCONF, queremos reconocerlas y darles un lugar oficial dentro de la conferencia.",
    ],
    universoTitle: "Los seis universos",
    ayudaTitle: "¿En qué te puede ayudar un embajador?",
    ayuda: [
      { title: "Conectar con comunidades", detail: "Te presenta a la comunidad que tiene que ver con lo tuyo." },
      { title: "Orientarte dentro de LABITCONF", detail: "Qué ver, dónde estar y a quién buscar en los dos días." },
      { title: "Recomendarte agenda", detail: "Charlas y escenarios según lo que te interesa." },
      { title: "Participar en activaciones", detail: "Actividades y encuentros propios de cada universo." },
      { title: "Conocer proyectos y personas", detail: "Puertas de entrada al ecosistema que no están en el programa." },
    ],
    ayudaCols: "sm:grid-cols-2 lg:grid-cols-3",
  },
  en: {
    alt: "Ambassadors",
    heroSub: "Discover the 6 leading voices of LABITCONF 2026",
    scrollHint: "scroll to discover",
    lead: "Six voices. Six universes. One conviction.",
    copy: [
      "The program brings together referents with strategic communities to represent, activate and amplify LABITCONF from their own territories.",
      "There are people who bet on their ideas when no one else believed in them. Who kept going when everything seemed to say they should give up. People who chose to resist, build, and stay true to their vision.",
      "This year, for the first time in LABITCONF's history, we want to recognize them and give them an official place within the conference.",
    ],
    universoTitle: "The six universes",
    ayudaTitle: "How can an ambassador help you?",
    ayuda: [
      { title: "Connect with communities", detail: "They introduce you to the community that matches what you do." },
      { title: "Find your way around LABITCONF", detail: "What to see, where to be and who to look for across both days." },
      { title: "Recommend an agenda", detail: "Talks and stages based on what interests you." },
      { title: "Take part in activations", detail: "Activities and meetups specific to each universe." },
      { title: "Meet projects and people", detail: "Ways into the ecosystem that aren't on the program." },
    ],
    ayudaCols: "sm:grid-cols-2 lg:grid-cols-3",
  },
} as const;

// Columnas de la grilla de fichas: 2 en mobile, 3 desde `sm` (640px). Tiene
// que coincidir con `grid-cols-2 sm:grid-cols-3` para saber dónde termina cada
// fila. En el server se asume 3; no importa porque el panel solo existe
// después de un click.
const SM_QUERY = "(min-width: 640px)";
function useGridCols() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(SM_QUERY);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => (window.matchMedia(SM_QUERY).matches ? 3 : 2),
    () => 3,
  );
}

export default function EmbajadoresPage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];
  // Una sola bio abierta por vez: se muestra en un panel a todo el ancho debajo
  // de la fila de la ficha. Antes cada ficha se desplegaba dentro de su celda,
  // estiraba la fila entera y dejaba un hueco negro bajo las vecinas.
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIdx((prev) => (prev === i ? null : i));
  const cols = useGridCols();
  const openRow = openIdx === null ? -1 : Math.floor(openIdx / cols);
  // Última ficha de la fila abierta: el panel se inserta justo después, así la
  // grilla lo ubica solo en una fila propia (col-span completo).
  const panelAfter = openRow < 0 ? -1 : Math.min((openRow + 1) * cols, AMBASSADORS.length) - 1;
  const openAmb = openIdx === null ? null : AMBASSADORS[openIdx];

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#000" }}>
      <Navbar />

      {/* 1 — Hero (banner de Canva): pantalla completa, todo centrado. */}
      <section
        className="relative flex flex-col items-center justify-center px-6 sm:px-10 text-center"
        style={{
          zIndex: 3,
          minHeight: "100svh",
          paddingTop: "clamp(96px, 12vh, 140px)",
          paddingBottom: "clamp(72px, 10vh, 120px)",
        }}
      >
        {/* Tira ≈ 75% del ancho en desktop, como en el banner. El contenedor es
            `inline-size` para que el título se mida en `cqw` contra la tira y
            no contra la pantalla: así ocupa la misma proporción a cualquier ancho. */}
        <Reveal className="relative w-full" style={{ maxWidth: 1440, containerType: "inline-size" }}>
          <Image
            src={STRIP.src}
            alt=""
            aria-hidden
            width={STRIP.w}
            height={STRIP.h}
            priority
            className="w-full h-auto"
          />
          <DetectionTracker />
          <h1
            className="absolute inset-0 flex items-center justify-center"
            style={{
              ...labelStyle,
              color: "#FF4E01",
              letterSpacing: "0.01em",
              lineHeight: 1,
              // Ancho del título ≈ 80% de la tira, igual que en el banner.
              fontSize: "9.4cqw",
            }}
          >
            {t.alt}
          </h1>
        </Reveal>

        {/* Entra "descifrándose" cuando la tira ya terminó de aparecer. */}
        <p
          className="mt-8 sm:mt-10 uppercase"
          style={{ ...lightStyle, color: "#E6EEF2", fontSize: "clamp(18px, 2.6vw, 40px)", lineHeight: 1.2, textWrap: "balance" }}
        >
          <ScrambleText text={t.heroSub} delay={700} duration={2000} />
        </p>

        <p
          // En el celular el botón del chat (fijo, abajo a la derecha) lo tapaba.
          className="absolute left-0 right-0 bottom-28 sm:bottom-8"
          style={{ ...lightStyle, color: "#A5A8B1", fontSize: "clamp(14px, 1.3vw, 20px)" }}
        >
          ↓ {t.scrollHint}
        </p>
      </section>

      {/* Presentación del programa (lead + copy, video de la ballena de fondo).
          Oculta: no está en el Canva del 29/09. Ver SHOW_INTRO. */}
      {SHOW_INTRO && (
        <MasSection bgVideo={HERO_VIDEO_SRC} bgOpacity={0.4} baseColor="#000">
          <Lead>{t.lead}</Lead>
          <CopyCard paragraphs={t.copy} justify />
        </MasSection>
      )}

      {/* 2 — Las seis fichas: teaser siempre visible, bio completa + red al
          tocar la foto, en un panel a todo el ancho debajo de la fila. */}
      <MasSection bgVideo={UNIVERSOS_BG_VIDEO_SRC} bgOpacity={0.28} baseColor="#000" compactTop>
        <BlockTitle>{t.universoTitle}</BlockTitle>

        {/* Sin borde ni card de fondo — la gráfica ya trae su propio marco
            horneado, la foto va suelta. Dos filas de 3 (grid-cols-3 fijo,
            no 6 columnas en desktop) para que se vean más grandes. */}
        <div className="mt-8 mx-auto grid max-w-3xl grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-x-8 sm:gap-y-6">
          {AMBASSADORS.map((amb, i) => (
            <Fragment key={amb.name}>
              <Reveal delay={0.1 + i * 0.1} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={openIdx === i}
                  aria-controls="embajador-bio"
                  className="relative w-full transition-[transform,opacity] duration-200 hover:scale-[1.02]"
                  // Con una bio abierta, las otras fichas se apagan un poco.
                  style={{ aspectRatio: "1892 / 2130", opacity: openIdx === null || openIdx === i ? 1 : 0.5 }}
                >
                  <Image src={amb.src} alt={amb.name} fill style={{ objectFit: "cover" }} />
                </button>

                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={openIdx === i}
                  aria-controls="embajador-bio"
                  className="mt-3 flex items-start gap-2 text-left"
                >
                  <p
                    className="flex-1"
                    style={{ ...lightStyle, color: "#A5A8B1", fontSize: "clamp(12px, 1.1vw, 14px)", lineHeight: 1.4 }}
                  >
                    {amb.teaser[lang]}
                  </p>
                  <span
                    aria-hidden
                    style={{
                      color: "#ABF760",
                      fontSize: 12,
                      lineHeight: 1,
                      marginTop: 3,
                      flexShrink: 0,
                      transition: "transform 0.2s",
                      transform: openIdx === i ? "rotate(180deg)" : "none",
                    }}
                  >
                    ▾
                  </span>
                </button>
              </Reveal>

              {/* Panel de la bio: fila propia a todo el ancho, debajo de la fila
                  de la ficha abierta. Si se abre otra ficha de la misma fila,
                  solo cambia el contenido y la flecha se corre; si es de otra
                  fila, el panel se cierra acá y se abre allá. */}
              <AnimatePresence initial={false}>
                {i === panelAfter && openAmb && (
                  <motion.div
                    key={`bio-row-${openRow}`}
                    id="embajador-bio"
                    className="col-span-full"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="relative pt-3">
                      {/* Flecha que apunta a la ficha abierta. */}
                      <motion.span
                        aria-hidden
                        className="absolute top-0 block"
                        initial={false}
                        animate={{ left: `${(((openIdx ?? 0) % cols) + 0.5) * (100 / cols)}%` }}
                        transition={{ type: "spring", stiffness: 260, damping: 26 }}
                        style={{
                          width: 0,
                          height: 0,
                          marginLeft: -9,
                          borderLeft: "9px solid transparent",
                          borderRight: "9px solid transparent",
                          borderBottom: "12px solid rgba(171,247,96,0.55)",
                        }}
                      />
                      <div
                        className="rounded-2xl"
                        style={{
                          border: "1px solid rgba(171,247,96,0.55)",
                          background: "rgba(13,13,11,0.85)",
                          padding: "clamp(18px, 2.4vw, 28px)",
                        }}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={openAmb.name}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <h3 style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(14px, 1.4vw, 18px)" }}>
                              {openAmb.name}
                            </h3>
                            <p
                              className="mt-3"
                              style={{
                                ...lightStyle,
                                color: "#E6EEF2",
                                fontSize: "clamp(13px, 1.2vw, 15px)",
                                lineHeight: 1.6,
                              }}
                            >
                              {openAmb.bio[lang]}
                            </p>
                            <a
                              href={openAmb.social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 inline-block transition-opacity duration-200 hover:opacity-70"
                              style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(11px, 1vw, 13px)" }}
                            >
                              {SOCIAL_LABEL[openAmb.social.platform][lang]} →
                            </a>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Fragment>
          ))}
        </div>
      </MasSection>

      {/* 3 — En qué te puede ayudar + redes */}
      <MasSection bg="/assets/home/hashes.jpg" bgOpacity={0.25} baseColor="#000">
        <BlockTitle>{t.ayudaTitle}</BlockTitle>
        <FeatureGrid items={t.ayuda} cols={t.ayudaCols} />
      </MasSection>

      <MasNav />
      <Footer lang={lang} />
      <QaChatWidget />
    </main>
  );
}
