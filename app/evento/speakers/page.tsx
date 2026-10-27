import EventoSpeakers, { type SpeakerSlot } from "@/components/evento/EventoSpeakers";
import { getSessions } from "@/lib/agenda/source";
import { toAgendaTalks } from "@/lib/agenda/match";
import { getSpeakers } from "@/lib/speakers/queries";
import { EVENT_TZ } from "@/lib/speakers/schedule";

export const revalidate = 3600;

const hhmm = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", { timeZone: EVENT_TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));

export default async function EventoSpeakersPage() {
  const speakers = await getSpeakers();
  const talks = toAgendaTalks(await getSessions(), speakers);

  // slug → cuándo y dónde habla (ordenado por hora). Es lo que habilita filtrar
  // por día y escenario: los speakers no traen temas cargados.
  const slots: Record<string, SpeakerSlot[]> = {};
  for (const talk of [...talks].filter((x) => x.startsAt).sort((a, b) => a.startsAt!.localeCompare(b.startsAt!))) {
    for (const p of talk.speakers ?? []) {
      (slots[p.slug] ??= []).push({ day: talk.day, stage: talk.stage, at: hhmm(talk.startsAt!) });
    }
  }
  return <EventoSpeakers speakers={speakers} slots={slots} />;
}
