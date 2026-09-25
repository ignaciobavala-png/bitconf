"use client";

import Image from "next/image";
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
} from "@/components/mas/ui";

// MÁS → EMBAJADORES (bloque 05 del PDF "FASE 2 - WEB 15.08"). Página editorial.
// Los 6 embajadores ya tienen foto y nombre (gráficas propias de la
// organización, con su marco "EMBAJADORES" + placa de nombre horneados) — se
// usan tal cual las mandaron, sin recortar. El "universo HODL" y la bio de
// cada uno todavía no llegaron.

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

// Gráficas reales de cada embajador (foto + nombre horneados por la
// organización). Orden alfabético, sin preferencia editorial.
const AMBASSADORS = [
  { src: "/assets/home/embajadores/gabriela-pirela.jpg", name: "Gabriela Pirela" },
  { src: "/assets/home/embajadores/gaucho.jpg", name: "Gaucho" },
  { src: "/assets/home/embajadores/hernan-gonzalez.jpg", name: "Hernán González" },
  { src: "/assets/home/embajadores/martin-gutter.jpg", name: "Martín Gütter" },
  { src: "/assets/home/embajadores/mery-fiorentini.jpg", name: "Mery Fiorentini" },
  { src: "/assets/home/embajadores/noelia-robles.jpg", name: "Noelia Robles" },
] as const;

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
    universoNote: "El universo HODL y la historia de cada embajador se suman pronto.",
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
    universoNote: "Each ambassador's HODL universe and story are coming soon.",
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

      {/* 2 — Las seis fichas (placeholder hasta tener fotos y nombres) */}
      <MasSection bg="/assets/home/lluvia-naranja.png" bgOpacity={0.22} compactTop>
        <BlockTitle>{t.universoTitle}</BlockTitle>
        <CopyCard paragraphs={[t.universoNote]} delay={0.1} className="mt-6" />

        {/* Sin borde ni card de fondo — la gráfica ya trae su propio marco
            horneado, la foto va suelta. Dos filas de 3 (grid-cols-3 fijo,
            no 6 columnas en desktop) para que se vean más grandes. */}
        <div className="mt-8 mx-auto grid max-w-3xl grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
          {AMBASSADORS.map((amb, i) => (
            <Reveal
              key={amb.name}
              delay={0.1 + i * 0.1}
              className="relative w-full"
              style={{ aspectRatio: "1892 / 2130" }}
            >
              <Image src={amb.src} alt={amb.name} fill style={{ objectFit: "cover" }} />
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
