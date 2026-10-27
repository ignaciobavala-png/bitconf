import MyAgendaView from "@/components/mi-agenda/MyAgendaView";
import VideoBg from "@/components/evento/VideoBg";
import { getSessions } from "@/lib/agenda/source";
import { toAgendaTalks } from "@/lib/agenda/match";
import { getSpeakers } from "@/lib/speakers/queries";

export const revalidate = 3600;

export default async function EventoMiAgendaPage() {
  const talks = toAgendaTalks(await getSessions(), await getSpeakers());
  return (
    <>
      <VideoBg />
      <main className="relative px-4 pt-8" style={{ zIndex: 1 }}>
        {/* Solo el panel de respaldo lleva vidrio opaco (prop `glass`). */}
        <MyAgendaView talks={talks} glass />
      </main>
    </>
  );
}
