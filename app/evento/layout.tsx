import type { Metadata, Viewport } from "next";
import BottomNav, { BOTTOM_NAV_H } from "@/components/evento/BottomNav";
import EventoServiceWorker from "@/components/evento/EventoServiceWorker";

export const metadata: Metadata = {
  title: "LABITCONF 26 — App del evento",
  description: "Agenda, speakers y tu itinerario de LABITCONF 26.",
  manifest: "/evento/manifest.webmanifest",
  appleWebApp: { capable: true, title: "LABITCONF", statusBarStyle: "black-translucent" },
  robots: { index: false },
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function EventoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#000", paddingBottom: `calc(${BOTTOM_NAV_H + 16}px + env(safe-area-inset-bottom))` }}>
      <EventoServiceWorker />
      {children}
      <BottomNav />
    </div>
  );
}
