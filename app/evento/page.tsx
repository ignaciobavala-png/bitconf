import NowView from "@/components/evento/NowView";
import { getSessions } from "@/lib/agenda/source";
import { toAgendaTalks } from "@/lib/agenda/match";
import { getSpeakers } from "@/lib/speakers/queries";

// Misma data que /agenda; la hora la resuelve el cliente.
export const revalidate = 3600;

export default async function EventoPage() {
  const talks = toAgendaTalks(await getSessions(), await getSpeakers());
  return <NowView talks={talks} />;
}
