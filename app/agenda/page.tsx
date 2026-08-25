import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import AgendaHeader from "@/components/agenda/AgendaHeader";
import AgendaBrowser from "@/components/agenda/AgendaBrowser";
import { getAgenda } from "@/lib/speakers/queries";

export const metadata: Metadata = {
  title: "Agenda — LABITCONF 2026",
  description:
    "Qué pasa en cada escenario los dos días de LABITCONF 26, en Costa Salguero.",
};

// Mismo criterio que /speakers: los datos vienen del sync con la planilla, que
// corre cada 6 horas, así que revalidar cada hora deja la página estática y aun
// así al día.
export const revalidate = 3600;

export default async function AgendaPage() {
  const talks = await getAgenda();

  return (
    <main className="relative min-h-screen" style={{ background: "#171616" }}>
      <Navbar />

      <section className="relative px-6 sm:px-10 pt-32 sm:pt-40 pb-20 sm:pb-28">
        <div className="relative w-full max-w-6xl">
          <AgendaHeader total={talks.length} />
          <div className="mt-10 sm:mt-14">
            <AgendaBrowser talks={talks} />
          </div>
        </div>
      </section>

      <Footer />
      <QaChatWidget />
    </main>
  );
}
