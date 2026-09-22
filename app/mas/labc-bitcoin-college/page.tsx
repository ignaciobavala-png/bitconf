"use client";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import MasNav from "@/components/mas/MasNav";
import { useLangStore } from "@/lib/store/lang";
import { MasSection, TitleText, Lead, CopyCard } from "@/components/mas/ui";

// MÁS → LABC BITCOIN COLLEGE (slide del cliente "DISEÑO WEB", 22/09/2026).
// Placeholder hasta que la organización mande el brief de la sección — sin
// copy, brand ni formato todavía.

const T = {
  es: {
    title: "LABC Bitcoin College",
    lead: "Próximamente",
    copy: [
      "Todavía no tenemos el contenido de esta sección. En cuanto la organización confirme el programa de LABC Bitcoin College, esta página se completa.",
    ],
  },
  en: {
    title: "LABC Bitcoin College",
    lead: "Coming soon",
    copy: [
      "This section's content isn't ready yet. Once the organization confirms the LABC Bitcoin College program, this page will be filled in.",
    ],
  },
} as const;

export default function LabcBitcoinCollegePage() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#171616" }}>
      <Navbar />

      <MasSection bg="/assets/home/fondo-hexmap.jpg" bgOpacity={0.25} first tall>
        <TitleText>{t.title}</TitleText>
        <Lead>{t.lead}</Lead>
        <CopyCard paragraphs={t.copy} justify />
      </MasSection>

      <MasNav />
      <Footer lang={lang} />
      <QaChatWidget />
    </main>
  );
}
