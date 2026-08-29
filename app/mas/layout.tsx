"use client";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import MasNav from "@/components/mas/MasNav";
import { useLangStore } from "@/lib/store/lang";

// Shell de la sección MÁS (mapa de fase 2: "MÁS = participar"). Las cuatro
// páginas comparten navbar, cross-links, footer y el widget de Bi; cada
// page.tsx aporta solo sus secciones.
export default function MasLayout({ children }: { children: React.ReactNode }) {
  const lang = useLangStore((s) => s.lang);

  return (
    <main className="relative min-h-screen overflow-x-clip" style={{ background: "#171616" }}>
      <Navbar />
      {children}
      <MasNav />
      <Footer lang={lang} />
      <QaChatWidget />
    </main>
  );
}
