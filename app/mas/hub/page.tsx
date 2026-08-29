"use client";

import { useLangStore } from "@/lib/store/lang";
import { MAS_FORMS } from "@/lib/mas/links";
import {
  MasSection,
  TitleText,
  BlockTitle,
  Lead,
  CopyCard,
  Chips,
  FeatureGrid,
  InlineCta,
  LogoPlaceholderGrid,
} from "@/components/mas/ui";

// MÁS → THE UNIVERSITY HUB (bloque 04 del PDF "FASE 2 - WEB 15.08").
// El copy largo es el del PDF; los párrafos del cuerpo vienen de la vieja
// /comunidad, que ya estaban aprobados por la organización.

// PENDIENTE DE DISEÑO: el PNG que existe (titulos/student-hub-*-trim.png) dice
// "HUB DE ESTUDIANTES", que es el nombre viejo. El PDF de fase 2 fija "THE
// UNIVERSITY HUB" como nombre de marca, así que el título va como texto hasta
// que llegue el asset nuevo.

const T = {
  es: {
    title: "The University Hub",
    lead: "¿Estás estudiando y querés conectar con el mundo que viene?",
    intro: [
      "Sumate a The University Hub de LABITCONF y encontrá un espacio para conocer personas, empresas y proyectos del ecosistema, aprender de quienes ya están construyendo y mostrar lo que vos estás haciendo. No importa si estudiás tecnología, finanzas, diseño, comunicación, negocios o cualquier otra disciplina: hay un lugar para vos.",
      "Creemos que el futuro no se espera: se comprende, se cuestiona y se construye. Por eso, acercamos a los estudiantes las herramientas y los principios de la descentralización, para que puedan ampliar su mirada y convertirse en protagonistas del cambio que blockchain ya está impulsando.",
      "Porque descentralizar el conocimiento es el primer paso para descentralizar el futuro.",
    ],
    ctaHub: "¿Te sumás al Hub?",
    quieroSumarme: "Quiero sumarme",
    pending: "Formulario a confirmar",

    quienesTitle: "¿Quiénes pueden participar?",
    quienes: [
      "Universitarios",
      "Tecnicaturas",
      "Másters / posgrados",
      "Cursos de formación",
      "Estudiantes online",
      "Alumni recientes",
    ],
    disciplinasTitle: "Y desde cualquier disciplina",
    disciplinas: [
      "Tecnología",
      "Desarrollo",
      "Ingeniería",
      "Producto",
      "Economía",
      "Finanzas",
      "Negocios",
      "Diseño",
      "Comunicación",
      "Marketing",
    ],

    incluyeTitle: "¿Qué incluye?",
    incluye: [
      { title: "Entrada gratuita", detail: "Acceso sin costo a los dos días de LABITCONF 26." },
      { title: "Certificado / badge digital", detail: "Constancia digital de participación en el Hub." },
      { title: "Espacio propio en el predio", detail: "The University Hub tiene su lugar físico dentro de Costa Salguero." },
      { title: "Networking, actividades y Bootcamp", detail: "Encuentros con el ecosistema y formación durante el evento." },
    ],

    universidadesTitle: "Universidades asociadas",
    universidadesNote:
      "Las universidades aliadas dan acceso gratuito a sus estudiantes. Los logos los carga la organización.",
    logoPlaceholder: "Logo",
    ctaUniversidad: "¿Querés sumar tu universidad?",
    postularUniversidad: "Postular universidad",

    demoDayTitle: "Student Demo Day",
    demoDayLead: "¿Estás construyendo algo? Mostranos.",
    demoDayCopy: [
      "Podés postular tu proyecto, estés en la etapa que estés: desde una idea validada hasta un MVP o un producto funcionando. Vas a contar con instancias de preparación y acompañamiento antes de presentarlo frente a un jurado y a la comunidad.",
      "Los 4 proyectos seleccionados llegarán a LABITCONF 2026.",
    ],
    categoriasTitle: "Categorías",
    categorias: [
      { title: "Fintech & nuevas finanzas" },
      { title: "Bitcoin & Blockchain" },
      { title: "AI × Economía" },
      { title: "Tech for Real Problems" },
    ],
    ctaDemoDay: "¿Tenés un proyecto para mostrar?",
    postularProyecto: "Postular mi proyecto",
  },
  en: {
    title: "The University Hub",
    lead: "Studying, and want to connect with what's coming next?",
    intro: [
      "Join LABITCONF's University Hub and find a space to meet people, companies and projects from the ecosystem, learn from those already building, and show what you're working on. It doesn't matter if you study technology, finance, design, communication, business or any other discipline: there's a place for you.",
      "We believe the future isn't waited for: it's understood, questioned and built. That's why we bring students the tools and principles of decentralization, so they can broaden their perspective and become protagonists of the change blockchain is already driving.",
      "Because decentralizing knowledge is the first step to decentralizing the future.",
    ],
    ctaHub: "Ready to join the Hub?",
    quieroSumarme: "I want to join",
    pending: "Form to be confirmed",

    quienesTitle: "Who can take part?",
    quienes: [
      "University students",
      "Technical degrees",
      "Master's / postgrad",
      "Training courses",
      "Online students",
      "Recent alumni",
    ],
    disciplinasTitle: "From any discipline",
    disciplinas: [
      "Technology",
      "Development",
      "Engineering",
      "Product",
      "Economics",
      "Finance",
      "Business",
      "Design",
      "Communication",
      "Marketing",
    ],

    incluyeTitle: "What's included?",
    incluye: [
      { title: "Free admission", detail: "No-cost access to both days of LABITCONF 26." },
      { title: "Digital certificate / badge", detail: "Digital proof of participation in the Hub." },
      { title: "A space of its own on site", detail: "The University Hub has its own physical area inside Costa Salguero." },
      { title: "Networking, activities and Bootcamp", detail: "Meet the ecosystem and train during the event." },
    ],

    universidadesTitle: "Partner universities",
    universidadesNote:
      "Partner universities give their students free access. Logos are provided by the organization.",
    logoPlaceholder: "Logo",
    ctaUniversidad: "Want to add your university?",
    postularUniversidad: "Submit a university",

    demoDayTitle: "Student Demo Day",
    demoDayLead: "Building something? Show us.",
    demoDayCopy: [
      "You can submit your project at any stage: from a validated idea to an MVP or a working product. You'll get preparation and mentoring before presenting it to a jury and the community.",
      "The 4 selected projects will make it to LABITCONF 2026.",
    ],
    categoriasTitle: "Categories",
    categorias: [
      { title: "Fintech & new finance" },
      { title: "Bitcoin & Blockchain" },
      { title: "AI × Economics" },
      { title: "Tech for Real Problems" },
    ],
    ctaDemoDay: "Got a project to show?",
    postularProyecto: "Submit my project",
  },
} as const;

export default function HubPage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  return (
    <>
      {/* 1 — Hero */}
      <MasSection bg="/assets/home/fondo-iconos.jpg" bgOpacity={0.22} first tall>
        <TitleText>{t.title}</TitleText>
        <Lead>{t.lead}</Lead>
        <CopyCard paragraphs={t.intro} justify />
        <InlineCta
          title={t.ctaHub}
          label={t.quieroSumarme}
          href={MAS_FORMS.hub}
          pendingLabel={t.pending}
          delay={0.25}
        />
      </MasSection>

      {/* 2 — Quiénes pueden participar + disciplinas */}
      <MasSection bg="/assets/home/pixel-grid-2.png" bgOpacity={0.15} bgFilter="invert(1)">
        <BlockTitle>{t.quienesTitle}</BlockTitle>
        <Chips items={t.quienes} />

        <div className="mt-12">
          <BlockTitle delay={0.1} color="#ABF760">
            {t.disciplinasTitle}
          </BlockTitle>
          <Chips items={t.disciplinas} delay={0.15} color="#A5A8B1" border="rgba(165,168,177,0.35)" />
        </div>
      </MasSection>

      {/* 3 — Qué incluye */}
      <MasSection bg="/assets/home/hashes.jpg" bgOpacity={0.25}>
        <BlockTitle>{t.incluyeTitle}</BlockTitle>
        <FeatureGrid items={t.incluye} />
      </MasSection>

      {/* 4 — Universidades asociadas (logos pendientes de la organización) */}
      <MasSection bg="/assets/home/fondo-hexmap.jpg" bgOpacity={0.22} bgPosition="center bottom">
        <BlockTitle>{t.universidadesTitle}</BlockTitle>
        <CopyCard paragraphs={[t.universidadesNote]} delay={0.1} className="mt-6" />
        <LogoPlaceholderGrid count={8} label={t.logoPlaceholder} />
        <InlineCta
          title={t.ctaUniversidad}
          label={t.postularUniversidad}
          href={MAS_FORMS.postularUniversidad}
          pendingLabel={t.pending}
          delay={0.25}
        />
      </MasSection>

      {/* 5 — Student Demo Day */}
      <MasSection id="demo-day" bg="/assets/home/lluvia.png" bgOpacity={0.3}>
        <TitleText color="#ABF760">{t.demoDayTitle}</TitleText>
        <Lead>{t.demoDayLead}</Lead>
        <CopyCard paragraphs={t.demoDayCopy} justify />

        <div className="mt-12">
          <BlockTitle delay={0.1}>{t.categoriasTitle}</BlockTitle>
          <FeatureGrid items={t.categorias} delay={0.15} />
        </div>

        <InlineCta
          title={t.ctaDemoDay}
          label={t.postularProyecto}
          href={MAS_FORMS.demoDay}
          pendingLabel={t.pending}
          delay={0.3}
        />
      </MasSection>
    </>
  );
}
