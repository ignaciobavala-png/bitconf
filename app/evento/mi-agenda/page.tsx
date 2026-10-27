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
        {/* Vidrio opaco: el texto nunca compite con el video de atrás. */}
        <div
          className="rounded-3xl p-5"
          style={{
            background: "rgba(14,14,14,0.82)",
            backdropFilter: "blur(18px) saturate(1.2)",
            WebkitBackdropFilter: "blur(18px) saturate(1.2)",
            border: "1px solid rgba(230,238,242,0.14)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
          }}
        >
          <MyAgendaView talks={talks} />
        </div>
      </main>
    </>
  );
}
