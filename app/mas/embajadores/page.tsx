"use client";

import Image from "next/image";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import Reveal from "@/components/home/Reveal";
import Floating from "@/components/home/Floating";
import { useLangStore } from "@/lib/store/lang";
import { MAS_FORMS } from "@/lib/mas/links";
import MasNav from "@/components/mas/MasNav";
import {
  MasSection,
  BlockTitle,
  Lead,
  CopyCard,
  FeatureGrid,
  InlineCta,
  labelStyle,
  lightStyle,
} from "@/components/mas/ui";

// MÁS → EMBAJADORES (bloque 05 del PDF "FASE 2 - WEB 15.08"). Página editorial.
// Las 6 fichas están en placeholder: la organización todavía no mandó fotos,
// nombres ni el "universo HODL" de cada uno.

const TITLE = {
  es: "/assets/home/titulos/embajadores-es-trim.png",
  en: "/assets/home/titulos/embajadores-en-trim.png",
} as const;

// Dimensiones intrínsecas del PNG -trim, para poder poner el badge al lado.
const TITLE_DIMS = { es: { w: 973, h: 92 }, en: { w: 976, h: 86 } } as const;
const TITLE_H = "clamp(40px, 5.5vw, 68px)";

// Íconos placeholder (transparentes) hasta tener los retratos reales.
const ICONS = [
  "/assets/home/iconos/candado.png",
  "/assets/home/iconos/casa.png",
  "/assets/home/iconos/diamante.png",
  "/assets/home/iconos/llave.png",
  "/assets/home/iconos/ojo.png",
  "/assets/home/iconos/rayo.png",
] as const;

const T = {
  es: {
    alt: "Embajadores",
    proximamente: "Próximamente",
    lead: "Seis voces. Seis universos. Una misma convicción.",
    copy: [
      "El programa reúne referentes con comunidades estratégicas para representar, activar y amplificar LABITCONF desde sus propios territorios.",
      "Hay personas que apostaron por sus ideas cuando nadie más creía en ellas. Que siguieron adelante cuando todo parecía indicar que debían abandonar. Personas que eligieron resistir, construir y mantenerse fieles a su visión.",
      "Este año, por primera vez en la historia de LABITCONF, queremos reconocerlas y darles un lugar oficial dentro de la conferencia.",
    ],
    universoTitle: "Los seis universos",
    universoNote: "Foto, nombre y universo HODL de cada embajador — a confirmar por la organización.",
    ayudaTitle: "¿En qué te puede ayudar un embajador?",
    ayuda: [
      { title: "Conectar con comunidades", detail: "Te presenta a la comunidad que tiene que ver con lo tuyo." },
      { title: "Orientarte dentro de LABITCONF", detail: "Qué ver, dónde estar y a quién buscar en los dos días." },
      { title: "Recomendarte agenda", detail: "Charlas y escenarios según lo que te interesa." },
      { title: "Participar en activaciones", detail: "Actividades y encuentros propios de cada universo." },
      { title: "Conocer proyectos y personas", detail: "Puertas de entrada al ecosistema que no están en el programa." },
    ],
    ayudaCols: "sm:grid-cols-2 lg:grid-cols-3",
    redesTitle: "Conectá con...",
    redes: ["Instagram", "X", "LinkedIn", "YouTube / Podcast"],
    ctaTitle: "¿Por qué HODLeás? Contanos tu historia y postulate.",
    ctaLabel: "Inscribite acá",
    pending: "Formulario a confirmar",
  },
  en: {
    alt: "Ambassadors",
    proximamente: "Coming soon",
    lead: "Six voices. Six universes. One conviction.",
    copy: [
      "The program brings together referents with strategic communities to represent, activate and amplify LABITCONF from their own territories.",
      "There are people who bet on their ideas when no one else believed in them. Who kept going when everything seemed to say they should give up. People who chose to resist, build, and stay true to their vision.",
      "This year, for the first time in LABITCONF's history, we want to recognize them and give them an official place within the conference.",
    ],
    universoTitle: "The six universes",
    universoNote: "Photo, name and HODL universe for each ambassador — to be confirmed by the organization.",
    ayudaTitle: "How can an ambassador help you?",
    ayuda: [
      { title: "Connect with communities", detail: "They introduce you to the community that matches what you do." },
      { title: "Find your way around LABITCONF", detail: "What to see, where to be and who to look for across both days." },
      { title: "Recommend an agenda", detail: "Talks and stages based on what interests you." },
      { title: "Take part in activations", detail: "Activities and meetups specific to each universe." },
      { title: "Meet projects and people", detail: "Ways into the ecosystem that aren't on the program." },
    ],
    ayudaCols: "sm:grid-cols-2 lg:grid-cols-3",
    redesTitle: "Connect through...",
    redes: ["Instagram", "X", "LinkedIn", "YouTube / Podcast"],
    ctaTitle: "Why do you HODL? Tell us your story and apply.",
    ctaLabel: "Sign up here",
    pending: "Form to be confirmed",
  },
} as const;

export default function EmbajadoresPage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#171616" }}>
      <Navbar />

      {/* 1 — Hero editorial */}
      <MasSection bg="/assets/home/pixel-grid-2.png" bgOpacity={0.15} bgFilter="invert(1)" first tall>
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
          <Reveal delay={0.05}>
            <span style={{ ...labelStyle, color: "#FF4E01", fontSize: "clamp(13px, 1.2vw, 16px)" }}>
              {t.proximamente}
            </span>
          </Reveal>
        </div>

        <Lead>{t.lead}</Lead>
        <CopyCard paragraphs={t.copy} justify />
      </MasSection>

      {/* 2 — Las seis fichas (placeholder hasta tener fotos y nombres) */}
      <MasSection bg="/assets/home/lluvia-naranja.png" bgOpacity={0.22}>
        <BlockTitle>{t.universoTitle}</BlockTitle>
        <CopyCard paragraphs={[t.universoNote]} delay={0.1} className="mt-6" />

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {ICONS.map((icon, i) => (
            <Reveal
              key={icon}
              delay={0.1 + i * 0.1}
              className="relative rounded-2xl overflow-hidden w-full"
              style={{
                aspectRatio: "3 / 4",
                border: "1px solid #ABF760",
                background: "rgba(13,13,11,0.4)",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <div className="relative" style={{ width: "46%", height: "46%", opacity: 0.9 }}>
                  <Floating duration={4 + i * 0.4} y={6} rotate={2}>
                    <Image src={icon} alt="" fill style={{ objectFit: "contain" }} />
                  </Floating>
                </div>
              </div>
              <span
                className="absolute left-0 right-0 bottom-0 text-center"
                style={{
                  ...lightStyle,
                  color: "rgba(165,168,177,0.75)",
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "10px 6px",
                }}
              >
                {t.proximamente}
              </span>
            </Reveal>
          ))}
        </div>
      </MasSection>

      {/* 3 — En qué te puede ayudar + redes */}
      <MasSection bg="/assets/home/hashes.jpg" bgOpacity={0.25}>
        <BlockTitle>{t.ayudaTitle}</BlockTitle>
        <FeatureGrid items={t.ayuda} cols={t.ayudaCols} />

        <div className="mt-12">
          <BlockTitle delay={0.1} color="#ABF760">
            {t.redesTitle}
          </BlockTitle>
          <div className="mt-6 flex flex-wrap gap-3">
            {t.redes.map((red, i) => (
              <Reveal key={red} delay={0.15 + i * 0.05}>
                <span
                  className="inline-block rounded-full"
                  style={{
                    ...labelStyle,
                    color: "#A5A8B1",
                    border: "1px solid rgba(165,168,177,0.35)",
                    background: "rgba(13,13,11,0.5)",
                    fontSize: "clamp(11px, 1vw, 13px)",
                    padding: "9px 18px",
                  }}
                >
                  {red}
                </span>
              </Reveal>
            ))}
          </div>
        </div>

        <InlineCta
          title={t.ctaTitle}
          label={t.ctaLabel}
          href={MAS_FORMS.embajadores}
          pendingLabel={t.pending}
          delay={0.3}
        />
      </MasSection>

      <MasNav />
      <Footer lang={lang} />
      <QaChatWidget />
    </main>
  );
}
