import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QaChatWidget from "@/components/home/QaChatWidget";
import MyAgendaButton from "@/components/home/MyAgendaButton";
import AgendaHeader from "@/components/agenda/AgendaHeader";
import AgendaBrowser from "@/components/agenda/AgendaBrowser";
import { getSessions } from "@/lib/agenda/source";
import { toAgendaTalks } from "@/lib/agenda/match";
import { getSpeakers } from "@/lib/speakers/queries";

export const metadata: Metadata = {
  title: "Agenda — LABITCONF 2026",
  description:
    "Qué pasa en cada escenario los dos días de LABITCONF 26, en Costa Salguero.",
};

// El temario es un archivo del repo (lib/agenda/temario.ts). De la base solo
// sale la lista de speakers, para ponerle foto y link a quien se pueda cruzar:
// revalidar cada hora deja la página estática y al día.
export const revalidate = 3600;

export default async function AgendaPage() {
  const talks = toAgendaTalks(await getSessions(), await getSpeakers());
  return (
    <main className="relative min-h-screen" style={{ background: "#000" }}>
      <Navbar />

      <section className="relative overflow-hidden px-6 sm:px-10 pb-20 sm:pb-28">
        {/* El header va dentro del browser: el fondo del banner llega hasta
            los botones de día y la grilla de abajo queda limpia. */}
        {/* La grilla sale del `max-w-6xl` del header: con 7 escenarios, dentro
            de 1152px cada columna queda en 145px y no entra el título. A
            1600px son ~209px, que es el ancho de la referencia del cliente. */}
        <div className="relative w-full max-w-[1600px]">
          <AgendaBrowser talks={talks} header={<AgendaHeader total={talks.length} />} />
        </div>
      </section>

      <Footer />
      <QaChatWidget />
      <MyAgendaButton />
    </main>
  );
}
