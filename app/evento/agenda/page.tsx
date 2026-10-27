import AgendaBrowser from "@/components/agenda/AgendaBrowser";
import ScreenTitle from "@/components/evento/ScreenTitle";
import { getSessions } from "@/lib/agenda/source";
import { toAgendaTalks } from "@/lib/agenda/match";
import { getSpeakers } from "@/lib/speakers/queries";

export const revalidate = 3600;

// AgendaBrowser es el mismo componente que usa /agenda en el sitio, pensado
// para web. En la app se agranda todo (`zoom`) en vez de bifurcarlo: así cada
// mejora del sitio llega acá sin trabajo, y en el celular el texto se lee.
const ZOOM = 1.18;

export default async function EventoAgendaPage() {
  const talks = toAgendaTalks(await getSessions(), await getSpeakers());
  // El zoom también agranda el margen: se divide para que el borde izquierdo
  // (16px) y el título coincidan con el de las otras pantallas. El margen
  // negativo recorta el aire que el banner de AgendaBrowser reserva arriba.
  return (
    <main style={{ zoom: ZOOM, padding: `${32 / ZOOM}px ${16 / ZOOM}px 0`, marginTop: -90 / ZOOM }}>
      <AgendaBrowser talks={talks} header={<ScreenTitle size={34 / ZOOM}>Agenda</ScreenTitle>} />
    </main>
  );
}
