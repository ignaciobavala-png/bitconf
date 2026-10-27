import SpeakersBrowser from "@/components/speakers/SpeakersBrowser";
import { getSpeakers } from "@/lib/speakers/queries";

export const revalidate = 3600;

export default async function EventoSpeakersPage() {
  const speakers = await getSpeakers();
  return (
    <main className="px-4 pt-6">
      <SpeakersBrowser speakers={speakers} />
    </main>
  );
}
