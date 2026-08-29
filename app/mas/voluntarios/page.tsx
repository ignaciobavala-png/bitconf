"use client";

import Image from "next/image";
import Floating from "@/components/home/Floating";
import { useLangStore } from "@/lib/store/lang";
import { MAS_FORMS } from "@/lib/mas/links";
import {
  MasSection,
  TitleText,
  BlockTitle,
  Lead,
  CopyCard,
  FeatureGrid,
  InlineCta,
} from "@/components/mas/ui";

// MÁS → VOLUNTARIOS (bloque 07 del PDF "FASE 2 - WEB 15.08").
// "Página sencilla" según el mapa: qué significa, qué roles hay, qué obtenés.
// Todavía no hay título PNG de diseño para esta página — va como texto.
//
// Pendiente de la organización: los roles reales del staff 2026 y el formulario
// de inscripción. Los cuatro roles de abajo son los del año pasado, a validar.

const T = {
  es: {
    title: "Voluntarios",
    lead: "Sé parte de LABITCONF desde adentro.",
    copy: [
      "Ser voluntario es vivir la conferencia del otro lado: armando el evento que miles de personas van a recorrer durante dos días en Costa Salguero.",
      "Es la forma más directa de conocer al equipo, a los speakers y a las comunidades que sostienen LABITCONF — y de entender cómo se construye una conferencia de esta escala.",
    ],
    rolesTitle: "¿Qué roles existen?",
    rolesNote: "Roles a validar con la organización.",
    roles: [
      { title: "Acreditaciones", detail: "Recibir al público y gestionar el ingreso al predio." },
      { title: "Escenarios", detail: "Asistir a speakers y coordinar los tiempos de cada charla." },
      { title: "Comunidad y stands", detail: "Acompañar a las comunidades y sponsors durante el evento." },
      { title: "Contenido y registro", detail: "Documentar lo que pasa: foto, video y redes en vivo." },
    ],
    obtieneTitle: "¿Qué obtenés?",
    obtiene: [
      { title: "Acceso completo al evento", detail: "Los dos días de LABITCONF 26, sin costo." },
      { title: "Certificado de participación", detail: "Constancia digital de tu trabajo como voluntario." },
      { title: "Equipo y comunidad", detail: "Formás parte del staff y de la red que queda después del evento." },
      { title: "Experiencia real", detail: "Producción de un evento internacional, de adentro." },
    ],
    ctaTitle: "¿Querés ser voluntario?",
    ctaLabel: "Quiero ser voluntario",
    pending: "Formulario a confirmar",
  },
  en: {
    title: "Volunteers",
    lead: "Be part of LABITCONF from the inside.",
    copy: [
      "Volunteering means living the conference from the other side: building the event thousands of people will walk through for two days at Costa Salguero.",
      "It's the most direct way to meet the team, the speakers and the communities behind LABITCONF — and to understand how a conference at this scale actually gets built.",
    ],
    rolesTitle: "What roles are there?",
    rolesNote: "Roles to be validated with the organization.",
    roles: [
      { title: "Accreditation", detail: "Welcome attendees and manage entry to the venue." },
      { title: "Stages", detail: "Assist speakers and keep each talk on time." },
      { title: "Community and booths", detail: "Support communities and sponsors during the event." },
      { title: "Content and coverage", detail: "Document what happens: photo, video and live social." },
    ],
    obtieneTitle: "What do you get?",
    obtiene: [
      { title: "Full event access", detail: "Both days of LABITCONF 26, at no cost." },
      { title: "Certificate of participation", detail: "Digital proof of your work as a volunteer." },
      { title: "Team and community", detail: "You join the staff and the network that stays after the event." },
      { title: "Real experience", detail: "Producing an international event, from the inside." },
    ],
    ctaTitle: "Want to volunteer?",
    ctaLabel: "I want to volunteer",
    pending: "Form to be confirmed",
  },
} as const;

export default function VoluntariosPage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  return (
    <>
      {/* 1 — Hero */}
      <MasSection
        bg="/assets/home/hashes.jpg"
        bgOpacity={0.25}
        first
        tall
        decoration={
          /* Astronauta: la figura 3D que en el resto del sitio acompaña a
             "estar adentro". Va anclada a la sección (no al bloque de texto,
             donde se montaba encima del copy) y con offset positivo — con
             bottom negativo el overflow-hidden de la sección la corta. */
          <div
            className="absolute pointer-events-none select-none hidden lg:block"
            style={{
              right: "clamp(2rem, 6vw, 6rem)",
              bottom: "2rem",
              width: "min(20vw, 260px)",
              height: "min(24vw, 320px)",
              zIndex: 1,
            }}
          >
            <Floating duration={7} y={12} rotate={3}>
              <Image
                src="/assets/home/astronauta-final.png"
                alt=""
                fill
                style={{ objectFit: "contain" }}
              />
            </Floating>
          </div>
        }
      >
        <TitleText>{t.title}</TitleText>
        <Lead>{t.lead}</Lead>
        <CopyCard paragraphs={t.copy} justify />
      </MasSection>

      {/* 2 — Roles */}
      <MasSection bg="/assets/home/pixel-grid-2.png" bgOpacity={0.15} bgFilter="invert(1)">
        <BlockTitle>{t.rolesTitle}</BlockTitle>
        <CopyCard paragraphs={[t.rolesNote]} delay={0.1} className="mt-6" />
        <FeatureGrid items={t.roles} />
      </MasSection>

      {/* 3 — Qué obtenés + CTA */}
      <MasSection bg="/assets/home/lluvia.png" bgOpacity={0.3}>
        <BlockTitle>{t.obtieneTitle}</BlockTitle>
        <FeatureGrid items={t.obtiene} />
        <InlineCta
          title={t.ctaTitle}
          label={t.ctaLabel}
          href={MAS_FORMS.voluntarios}
          pendingLabel={t.pending}
          delay={0.3}
        />
      </MasSection>
    </>
  );
}
