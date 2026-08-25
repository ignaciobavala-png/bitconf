import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import SpeakersBrowser from "@/components/speakers/SpeakersBrowser";
import SpeakersHeader from "@/components/speakers/SpeakersHeader";
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
    <main className="relative min-h-screen" style={{ background: "#171616" }}>
      <Navbar />

      <section className="relative px-6 sm:px-10 pt-32 sm:pt-40 pb-20 sm:pb-28">
        <div className="relative w-full max-w-6xl">
          <SpeakersHeader total={speakers.length} />
          <div className="mt-10 sm:mt-14">
            <SpeakersBrowser speakers={speakers} />
          </div>
        </div>
      </section>

      <Footer />
      <QaChatWidget />
    </main>
  );
}
