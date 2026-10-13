import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import MyAgendaButton from "@/components/home/MyAgendaButton";
import AgendaHeader from "@/components/agenda/AgendaHeader";
import TemarioView from "@/components/agenda/TemarioView";
import { SESSIONS } from "@/lib/agenda/temario";

export const metadata: Metadata = {
  title: "Agenda — LABITCONF 2026",
  description:
    "Qué pasa en cada escenario los dos días de LABITCONF 26, en Costa Salguero.",
};

// El temario es un archivo del repo (lib/agenda/temario.ts), no sale de la base:
// la página es estática.
export default function AgendaPage() {
  return (
    <main className="relative min-h-screen" style={{ background: "#171616" }}>
      <Navbar />

      <section className="relative px-6 sm:px-10 pt-32 sm:pt-40 pb-20 sm:pb-28">
        <div className="relative w-full max-w-6xl">
          <AgendaHeader total={SESSIONS.length} />
        </div>

        {/* La grilla sale del `max-w-6xl` del header: con 7 escenarios, dentro
            de 1152px cada columna queda en 145px y no entra el título. A
            1600px son ~209px, que es el ancho de la referencia del cliente. */}
        <div className="relative mt-10 sm:mt-14 w-full max-w-[1600px]">
          <TemarioView />
        </div>
      </section>

      <Footer />
      <QaChatWidget />
      <MyAgendaButton />
    </main>
  );
}
