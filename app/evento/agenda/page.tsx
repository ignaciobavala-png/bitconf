import AgendaBrowser from "@/components/agenda/AgendaBrowser";
import { getSessions } from "@/lib/agenda/source";
import { toAgendaTalks } from "@/lib/agenda/match";
import { getSpeakers } from "@/lib/speakers/queries";

export const revalidate = 3600;

export default async function EventoAgendaPage() {
  const talks = toAgendaTalks(await getSessions(), await getSpeakers());
  return (
    <main className="px-4 pt-6">
      <AgendaBrowser talks={talks} />
    </main>
  );
}
