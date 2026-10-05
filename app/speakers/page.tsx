import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import SpeakersBrowser from "@/components/speakers/SpeakersBrowser";
import SpeakersHeader from "@/components/speakers/SpeakersHeader";
import { MasSection } from "@/components/mas/ui";
import { getSpeakers } from "@/lib/speakers/queries";

export const metadata: Metadata = {
  title: "Speakers — LABITCONF 2026",
  description:
    "Conocé a las personas que están construyendo el futuro en la edición HODL de LABITCONF 26.",
};

// Los datos vienen del sync con la planilla de la organización, que corre cada
// 6 horas. Revalidar cada hora deja la página estática (rápida y barata) y aun
// así refleja un cambio manual del sync sin esperar un deploy.
export const revalidate = 3600;

export default async function SpeakersPage() {
  const speakers = await getSpeakers();

  return (
    <main className="relative min-h-screen" style={{ background: "#000" }}>
      <Navbar />

      {/* Cabecera con el fondo de hashes de la presentación, y sin 100vh: se
          viene a ver las caras, no a scrollear un hero. */}
      <MasSection bg="/assets/home/hashes.jpg" bgOpacity={0.25} first>
        <SpeakersHeader total={speakers.length} />
      </MasSection>

      {/* La grilla va sobre fondo liso: el degradé de la cabecera termina en
          Alamo, y con textura detrás las fotos (400px, de fondos dispares) se
          ensucian.
          Sin `max-w-6xl`: la grilla llega al mismo margen derecho que el
          navbar, así la sangría es igual a los dos lados (pedido de la
          organización, 05/10/2026). */}
      <section className="relative px-6 sm:px-10 pb-20 sm:pb-28">
        <div className="relative w-full">
          <SpeakersBrowser speakers={speakers} />
        </div>
      </section>

      <Footer fadeFrom="#000" />
      <QaChatWidget />
    </main>
  );
}
