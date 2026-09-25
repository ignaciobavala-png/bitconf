"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import Reveal from "@/components/home/Reveal";
import { useLangStore } from "@/lib/store/lang";
import MasNav from "@/components/mas/MasNav";
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
// un modal/popup: es un dropdown por ficha — teaser siempre visible, al
// tocar la foto se despliega hacia abajo la bio completa + el link a la red,
// empujando el resto de la grilla (altura auto de CSS grid).

const TITLE = {
  es: "/assets/home/titulos/embajadores-es-trim.png",
  en: "/assets/home/titulos/embajadores-en-trim.png",
} as const;

// Video de fondo del hero (Descargas/BALLENA_FINAL_PIVOT.mp4, 25/09/2026),
// recomprimido (h264 crf 30, sin audio) y subido al bucket público de
// Supabase — mismo patrón que HERO_VIDEO_SRC en app/mas/edu-hub/page.tsx.
const HERO_VIDEO_SRC =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/mas/embajadores/hero.mp4";

// Dimensiones intrínsecas del PNG -trim, para poder poner el badge al lado.
const TITLE_DIMS = { es: { w: 973, h: 92 }, en: { w: 976, h: 86 } } as const;
const TITLE_H = "clamp(40px, 5.5vw, 68px)";

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

export default function EmbajadoresPage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];
  // Set y no un solo índice: cada ficha se despliega de forma independiente,
  // no es un acordeón que cierra las demás al abrir una.
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#171616" }}>
      <Navbar />

      {/* 1 — Hero editorial — video de campaña de la organización de fondo */}
      <MasSection bgVideo={HERO_VIDEO_SRC} bgOpacity={0.4} first tall>
        <div className="flex items-end gap-4 flex-wrap">
          <Reveal style={{ height: TITLE_H }}>
            <Image
              src={TITLE[lang]}
              alt={t.alt}
              width={TITLE_DIMS[lang].w}
              height={TITLE_DIMS[lang].h}
              priority
              style={{ height: TITLE_H, width: "auto" }}
            />
          </Reveal>
        </div>

        <Lead>{t.lead}</Lead>
        <CopyCard paragraphs={t.copy} justify />
      </MasSection>

      {/* 2 — Las seis fichas: teaser siempre visible, bio completa + red al
          tocar la foto (dropdown por ficha, no un modal). */}
      <MasSection bg="/assets/home/lluvia-naranja.png" bgOpacity={0.22} compactTop>
        <BlockTitle>{t.universoTitle}</BlockTitle>

        {/* Sin borde ni card de fondo — la gráfica ya trae su propio marco
            horneado, la foto va suelta. Dos filas de 3 (grid-cols-3 fijo,
            no 6 columnas en desktop) para que se vean más grandes. */}
        <div className="mt-8 mx-auto grid max-w-3xl grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-x-8 sm:gap-y-6">
          {AMBASSADORS.map((amb, i) => (
            <Reveal key={amb.name} delay={0.1 + i * 0.1} className="flex flex-col">
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={openSet.has(i)}
                className="relative w-full transition-transform duration-200 hover:scale-[1.02]"
                style={{ aspectRatio: "1892 / 2130" }}
              >
                <Image src={amb.src} alt={amb.name} fill style={{ objectFit: "cover" }} />
              </button>

              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={openSet.has(i)}
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
                    transform: openSet.has(i) ? "rotate(180deg)" : "none",
                  }}
                >
                  ▾
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openSet.has(i) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ paddingTop: 12 }}>
                      <p
                        style={{
                          ...lightStyle,
                          color: "#E6EEF2",
                          fontSize: "clamp(13px, 1.2vw, 15px)",
                          lineHeight: 1.55,
                        }}
                      >
                        {amb.bio[lang]}
                      </p>
                      <a
                        href={amb.social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block transition-opacity duration-200 hover:opacity-70"
                        style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(11px, 1vw, 13px)" }}
                      >
                        {SOCIAL_LABEL[amb.social.platform][lang]} →
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          ))}
        </div>
      </MasSection>

      {/* 3 — En qué te puede ayudar + redes */}
      <MasSection bg="/assets/home/hashes.jpg" bgOpacity={0.25}>
        <BlockTitle>{t.ayudaTitle}</BlockTitle>
        <FeatureGrid items={t.ayuda} cols={t.ayudaCols} />
      </MasSection>

      <MasNav />
      <Footer lang={lang} />
      <QaChatWidget />
    </main>
  );
}
