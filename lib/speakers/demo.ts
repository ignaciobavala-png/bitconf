// Horarios de ejemplo para poder VER la grilla mientras la planilla no trae la
// hora de inicio.
//
// Por qué existe: `talks.starts_at` está vacío en las 33 charlas confirmadas,
// así que sin esto el cronograma no se puede ni probar ni mostrar. Lo que NO
// hace es entrar a la página pública: se activa solo con `?demo=1`, se calcula
// en el browser, nunca toca la base y la vista avisa en un cartel que los
// horarios son inventados.
//
// Sirve para dos cosas: desarrollar la grilla, y llevarle a la organización una
// demo funcionando a la reunión donde se les pide justamente el horario real.

import { DAY_WINDOW, type Day } from "./schedule";
import type { AgendaTalk } from "./queries";

/** Aire entre charla y charla de un mismo escenario. */
const GAP_MIN = 15;

/**
 * Encadena las charlas de cada escenario desde la apertura de la jornada,
 * usando la duración real de cada una. Es determinista: el mismo listado da
 * siempre el mismo horario, así que la demo no cambia entre recargas.
 */
export function demoStartTimes(talks: AgendaTalk[], day: Day): Map<string, number> {
  const cursor = new Map<string, number>();
  const out = new Map<string, number>();
  const opens = DAY_WINDOW[day].opens;

  for (const k of talks) {
    if (k.day !== day) continue;
    const at = cursor.get(k.stage) ?? opens;
    out.set(k.id, at);
    cursor.set(k.stage, at + (k.durationMin ?? 30) + GAP_MIN);
  }

  return out;
}
