import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import MyAgendaView from "@/components/mi-agenda/MyAgendaView";
import ServiceWorker from "@/components/mi-agenda/ServiceWorker";
import { getAgenda } from "@/lib/speakers/queries";

export const metadata: Metadata = {
  title: "Mi Agenda — LABITCONF 2026",
  description: "Tu itinerario de LABITCONF 26. Funciona sin conexión el día del evento.",
};

// Se sirven TODAS las charlas y el cliente filtra las elegidas. Es a propósito:
// así el service worker cachea una página que ya contiene todo lo necesario, y
// el itinerario se arma sin pedirle nada al servidor. El día del evento, con
// las antenas saturadas, esa es la diferencia entre ver la agenda y no verla.
export const revalidate = 3600;

export default async function MiAgendaPage() {
  const talks = await getAgenda();

  return (
    <main className="relative min-h-screen" style={{ background: "#171616" }}>
      <Navbar />
      <ServiceWorker />

      <section className="relative px-6 sm:px-10 pt-32 sm:pt-40 pb-20 sm:pb-28">
        <div className="relative w-full max-w-3xl">
          <MyAgendaView talks={talks} />
        </div>
      </section>
    </main>
  );
}
