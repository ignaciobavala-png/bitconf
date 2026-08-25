// Vocabulario del cronograma: días y escenarios.
//
// Vive acá y no en cada componente porque ya lo usan la ficha de speaker y la
// agenda. Cuando la organización confirme los nombres reales de los escenarios
// (hoy la planilla solo manda los códigos s1..s7), se cambia STAGE_NAMES y
// aparece en todo el sitio a la vez.

export const DAYS = ["oct30", "oct31"] as const;
export type Day = (typeof DAYS)[number];

export const DAY_LABELS: Record<Day, { es: string; en: string }> = {
  oct30: { es: "Viernes 30 de octubre", en: "Friday, October 30" },
  oct31: { es: "Sábado 31 de octubre", en: "Saturday, October 31" },
};

/** Versión corta para los tabs, donde el label largo no entra en mobile. */
export const DAY_SHORT: Record<Day, { es: string; en: string }> = {
  oct30: { es: "Vie 30 oct", en: "Fri Oct 30" },
  oct31: { es: "Sáb 31 oct", en: "Sat Oct 31" },
};

export function isDay(value: string | null): value is Day {
  return value != null && (DAYS as readonly string[]).includes(value);
}

/**
 * Nombre propio de cada escenario.
 *
 * PENDIENTE con la organización: la planilla manda `s1`..`s7` y nada más, así
 * que hoy no hay con qué llenar esto. Mientras esté vacío se cae a
 * "Escenario N", que es correcto pero no ayuda a elegir — que es justamente
 * para lo que sirve filtrar por escenario.
 */
export const STAGE_NAMES: Record<string, { es: string; en: string }> = {};

export function stageLabel(stage: string, lang: "es" | "en"): string {
  const named = STAGE_NAMES[stage];
  if (named) return named[lang];
  const n = stage.replace(/^s/i, "");
  return lang === "es" ? `Escenario ${n}` : `Stage ${n}`;
}

/** s1, s2, … s10 en orden numérico (el alfabético pondría s10 antes que s2). */
export function compareStages(a: string, b: string): number {
  const na = Number(a.replace(/^s/i, ""));
  const nb = Number(b.replace(/^s/i, ""));
  if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
  return a.localeCompare(b);
}
