"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import { useLangStore } from "@/lib/store/lang";
import { getSupabaseClient } from "@/lib/supabase/client";
import MasNav from "@/components/mas/MasNav";
import {
  MasSection,
  TitleImage,
  BlockTitle,
  Lead,
  CopyCard,
  Chips,
  FeatureGrid,
} from "@/components/mas/ui";

// MÁS → COMUNIDADES (bloque 06 del PDF "FASE 2 - WEB 15.08").
//
// El PDF pide filtros sobre la grilla de comunidades. Acá las categorías van
// como etiquetas y no como filtros funcionales: todavía no hay ni una comunidad
// cargada, y un filtro que no filtra nada es una promesa vacía. Cuando llegue
// el listado real se convierten en filtro (mismo patrón que /agenda).

const TITLE = {
  es: "/assets/home/titulos/comunidades-es-trim.png",
  en: "/assets/home/titulos/comunidades-en-trim.png",
} as const;

// Video de fondo del hero (Descargas/PASTILLA_FINAL_PIVOT.mp4, 25/09/2026),
// recomprimido (h264 crf 30, sin audio) y subido al bucket público de
// Supabase — mismo patrón que HERO_VIDEO_SRC en app/mas/edu-hub/page.tsx.
const HERO_VIDEO_SRC =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/mas/comunidades/hero.mp4";

const T = {
  es: {
    alt: "Comunidades",
    leadIntro: "LABITCONF no es solamente un evento.",
    leadEmphasis: "Es una red.",
    copy: [
      "Las comunidades son el corazón del ecosistema. El programa de Comunidades Asociadas está abierto a comunidades crypto, tech, universitarias y de nicho que quieran ser parte de la edición 2026.",
      "Las comunidades adheridas acceden a beneficios exclusivos para sus miembros y tienen la posibilidad de tener presencia dentro del evento. Si tu comunidad forma parte del ecosistema, tiene un lugar acá.",
    ],
    categoriasTitle: "Categorías",
    categorias: ["Bitcoin", "Tech", "Startups", "Creators", "Finanzas", "Universidades"],
    asociadasTitle: "Comunidades asociadas",
    asociadasNote:
      "Estas son algunas de las comunidades que ya forman parte del ecosistema LABITCONF. La lista sigue creciendo — cuando el listado completo esté cargado, estas categorías pasan a funcionar como filtro.",
    logoPlaceholder: "Logo",
    beneficiosTitle: "¿Qué gana tu comunidad?",
    beneficios: [
      { title: "Conexión con LABITCONF", detail: "Vínculo directo con la organización y el resto de la red." },
      { title: "Beneficios para miembros", detail: "Condiciones exclusivas para quienes forman parte de tu comunidad." },
      { title: "Activaciones", detail: "Posibilidad de tener presencia y actividades propias dentro del evento." },
      { title: "Networking", detail: "Encuentros con otras comunidades, proyectos y empresas del ecosistema." },
      { title: "Contenido", detail: "Difusión conjunta antes, durante y después de la conferencia." },
      { title: "Acceso al ecosistema", detail: "Puerta de entrada a la red que sostiene LABITCONF." },
    ],
  },
  en: {
    alt: "Communities",
    leadIntro: "LABITCONF isn't just an event.",
    leadEmphasis: "It's a network.",
    copy: [
      "Communities are the heart of the ecosystem. The Associated Communities program is open to crypto, tech, university and niche communities that want to be part of the 2026 edition.",
      "Partner communities get exclusive benefits for their members and the chance to have a presence at the event. If your community is part of the ecosystem, it has a place here.",
    ],
    categoriasTitle: "Categories",
    categorias: ["Bitcoin", "Tech", "Startups", "Creators", "Finance", "Universities"],
    asociadasTitle: "Partner communities",
    asociadasNote:
      "These are some of the communities already part of the LABITCONF ecosystem. The list keeps growing — once the full list is in, these categories become working filters.",
    logoPlaceholder: "Logo",
    beneficiosTitle: "What does your community get?",
    beneficios: [
      { title: "A link to LABITCONF", detail: "Direct connection with the organization and the rest of the network." },
      { title: "Member benefits", detail: "Exclusive conditions for the people in your community." },
      { title: "Activations", detail: "The chance to have a presence and your own activities at the event." },
      { title: "Networking", detail: "Meet other communities, projects and companies in the ecosystem." },
      { title: "Content", detail: "Joint promotion before, during and after the conference." },
      { title: "Ecosystem access", detail: "A way into the network that holds LABITCONF together." },
    ],
  },
} as const;

export default function ComunidadesPage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#171616" }}>
      <Navbar />

      {/* 1 — Hero — video de campaña de la organización de fondo */}
      <MasSection bgVideo={HERO_VIDEO_SRC} bgOpacity={0.4} first tall>
        <TitleImage src={TITLE[lang]} alt={t.alt} />
        <Lead>
          {t.leadIntro} <span style={{ whiteSpace: "nowrap" }}>{t.leadEmphasis}</span>
        </Lead>
        <CopyCard paragraphs={t.copy} justify />

        <div className="mt-10">
          <BlockTitle delay={0.2} color="#ABF760">
            {t.categoriasTitle}
          </BlockTitle>
          <Chips items={t.categorias} delay={0.25} />
        </div>
      </MasSection>

      {/* 2 — Comunidades asociadas — logos reales cargados desde /admin
          (tabla mas_comunidades, mismo patrón que EDU HUB). */}
      <MasSection bg="/assets/home/pixel-grid-2.png" bgOpacity={0.15} bgFilter="invert(1)">
        <BlockTitle>{t.asociadasTitle}</BlockTitle>
        <CopyCard paragraphs={[t.asociadasNote]} delay={0.1} className="mt-6" />
        {/* Sangría horizontal para que el cinturón no vaya de punta a punta
            del contenedor — mismo padding que el borde de la CopyCard de
            arriba, en vez de ir a ras del borde de la sección. */}
        <div className="mt-16" style={{ padding: "0 clamp(24px, 4vw, 40px)" }}>
          <ComunidadesLogoMarquee />
        </div>
      </MasSection>

      {/* 3 — Beneficios. El CTA "sumar tu comunidad" se sacó: la inscripción
          ya está cerrada. */}
      <MasSection bg="/assets/home/lluvia.png" bgOpacity={0.3}>
        <BlockTitle>{t.beneficiosTitle}</BlockTitle>
        <FeatureGrid
          items={t.beneficios}
          cols="sm:grid-cols-2 lg:grid-cols-3"
          // Sin naranja: es el color del título de este bloque (BlockTitle
          // default #FF4E01) y una card en ese mismo tono se perdía contra él.
          // Orden pensado para que ninguna columna repita color entre la
          // fila 1 y la fila 2 (grid de 3 columnas).
          accentColors={["#ABF760", "#FFAB0B", "#1311FC", "#FFAB0B", "#1311FC", "#ABF760"]}
        />
      </MasSection>

      <MasNav />
      <Footer lang={lang} />
      <QaChatWidget />
    </main>
  );
}

type ComunidadLogo = { name: string; logo_url: string };

// Cinturón de logos — misma tabla que gestiona /admin (mas_comunidades),
// mismo patrón de dos carriles en loop infinito que EDU HUB (ver
// app/mas/edu-hub/page.tsx).
function ComunidadesLogoLane({
  comunidades,
  reverse,
  duration,
}: {
  comunidades: ComunidadLogo[];
  reverse?: boolean;
  duration: number;
}) {
  return (
    <div className="overflow-hidden flex" style={{ flexWrap: "nowrap" }}>
      {[0, 1].map((track) => (
        <motion.div
          key={track}
          className="flex items-center gap-16 shrink-0"
          style={{ minWidth: "100%", justifyContent: "space-around" }}
          animate={{ x: reverse ? ["-100%", "0%"] : ["0%", "-100%"] }}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
        >
          {comunidades.map((comu) => (
            // eslint-disable-next-line @next/next/no-img-element -- logos pre-comprimidos con aspect ratio variable, no vale la pena el overhead de next/image para un marquee decorativo
            <img
              key={comu.name}
              src={comu.logo_url}
              alt={comu.name}
              style={{ height: "clamp(36px, 4.4vw, 58px)", width: "auto", maxWidth: 200, objectFit: "contain" }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
}

function ComunidadesLogoMarquee() {
  const [comunidades, setComunidades] = useState<ComunidadLogo[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSupabaseClient()
      .from("mas_comunidades")
      .select("name, logo_url")
      .eq("active", true)
      .not("logo_url", "is", null)
      .then(({ data }) => {
        if (!cancelled) setComunidades((data as ComunidadLogo[] | null) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!comunidades || comunidades.length === 0) return null;

  const rowA = comunidades.filter((_, i) => i % 2 === 0);
  const rowB = comunidades.filter((_, i) => i % 2 === 1);

  return (
    <div className="flex flex-col gap-6">
      <ComunidadesLogoLane comunidades={rowA} duration={38} />
      <ComunidadesLogoLane comunidades={rowB} duration={44} reverse />
    </div>
  );
}
