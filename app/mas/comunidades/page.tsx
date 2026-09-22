"use client";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import { useLangStore } from "@/lib/store/lang";
import { MAS_FORMS } from "@/lib/mas/links";
import MasNav from "@/components/mas/MasNav";
import {
  MasSection,
  TitleImage,
  BlockTitle,
  Lead,
  CopyCard,
  Chips,
  FeatureGrid,
  InlineCta,
  LogoStrip,
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

const T = {
  es: {
    alt: "Comunidades",
    lead: "LABITCONF no es solamente un evento. Es una red.",
    copy: [
      "Las comunidades son el corazón del ecosistema. El programa de Comunidades Asociadas está abierto a comunidades crypto, tech, universitarias y de nicho que quieran ser parte de la edición 2026.",
      "Las comunidades adheridas acceden a beneficios exclusivos para sus miembros y tienen la posibilidad de tener presencia dentro del evento. Si tu comunidad forma parte del ecosistema, tiene un lugar acá.",
    ],
    categoriasTitle: "Categorías",
    categorias: ["Bitcoin", "Tech", "Startups", "Creators", "Finanzas", "Universidades"],
    asociadasTitle: "Comunidades asociadas",
    asociadasNote:
      "El listado con logo, nombre y descripción de cada comunidad lo carga la organización. Cuando esté, estas categorías pasan a funcionar como filtro.",
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
    ctaTitle: "¿Querés sumar tu comunidad?",
    ctaLabel: "Sumar mi comunidad",
    pending: "Formulario a confirmar",
  },
  en: {
    alt: "Communities",
    lead: "LABITCONF isn't just an event. It's a network.",
    copy: [
      "Communities are the heart of the ecosystem. The Associated Communities program is open to crypto, tech, university and niche communities that want to be part of the 2026 edition.",
      "Partner communities get exclusive benefits for their members and the chance to have a presence at the event. If your community is part of the ecosystem, it has a place here.",
    ],
    categoriasTitle: "Categories",
    categorias: ["Bitcoin", "Tech", "Startups", "Creators", "Finance", "Universities"],
    asociadasTitle: "Partner communities",
    asociadasNote:
      "The list with each community's logo, name and description is provided by the organization. Once it's in, these categories become working filters.",
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
    ctaTitle: "Want to add your community?",
    ctaLabel: "Add my community",
    pending: "Form to be confirmed",
  },
} as const;

export default function ComunidadesPage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#171616" }}>
      <Navbar />

      {/* 1 — Hero */}
      <MasSection bg="/assets/home/fondo-hexmap.jpg" bgOpacity={0.22} bgPosition="center bottom" first tall>
        <TitleImage src={TITLE[lang]} alt={t.alt} />
        <Lead>{t.lead}</Lead>
        <CopyCard paragraphs={t.copy} justify />

        <div className="mt-10">
          <BlockTitle delay={0.2} color="#ABF760">
            {t.categoriasTitle}
          </BlockTitle>
          <Chips items={t.categorias} delay={0.25} />
        </div>
      </MasSection>

      {/* 2 — Grilla de comunidades (logos pendientes de la organización) */}
      <MasSection bg="/assets/home/pixel-grid-2.png" bgOpacity={0.15} bgFilter="invert(1)">
        <BlockTitle>{t.asociadasTitle}</BlockTitle>
        <CopyCard paragraphs={[t.asociadasNote]} delay={0.1} className="mt-6" />
        <LogoStrip count={8} label={t.logoPlaceholder} />
      </MasSection>

      {/* 3 — Beneficios + CTA */}
      <MasSection bg="/assets/home/lluvia.png" bgOpacity={0.3}>
        <BlockTitle>{t.beneficiosTitle}</BlockTitle>
        <FeatureGrid items={t.beneficios} cols="sm:grid-cols-2 lg:grid-cols-3" />
        <InlineCta
          title={t.ctaTitle}
          label={t.ctaLabel}
          href={MAS_FORMS.comunidades}
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
