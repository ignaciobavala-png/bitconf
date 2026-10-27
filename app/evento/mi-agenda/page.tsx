import MyAgendaView from "@/components/mi-agenda/MyAgendaView";
import { getSessions } from "@/lib/agenda/source";
import { toAgendaTalks } from "@/lib/agenda/match";
import { getSpeakers } from "@/lib/speakers/queries";

export const revalidate = 3600;

export default async function EventoMiAgendaPage() {
  const talks = toAgendaTalks(await getSessions(), await getSpeakers());
  return (
    <main className="px-6 pt-10">
      <MyAgendaView talks={talks} />
    </main>
  );
}
