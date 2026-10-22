// Lo que Qubit sabe de la agenda y los speakers, leído de las MISMAS fuentes
// que las páginas `/agenda` y `/speakers`: así el chat y el sitio no pueden
// contradecirse, y cuando la organización cambia el temario el chat lo sabe sin
// tocar código ni el system prompt.
//
// Se expone como herramientas (el modelo pide lo que necesita) y no pegado
// entero en el prompt: ~190 charlas + ~200 speakers son miles de tokens por
// mensaje, y Groq limita los tokens por minuto.

import { jsonSchema, tool } from "ai";
import { getSessions } from "@/lib/agenda/source";
import { toAgendaTalks } from "@/lib/agenda/match";
import { getSpeakers, type AgendaTalk, type SpeakerCard } from "@/lib/speakers/queries";
import { DAY_LABELS, compareStages, stageLabel, stageNote, type ProgramDay } from "@/lib/speakers/schedule";

const TTL_MS = 5 * 60_000;
const MAX_TALKS = 15;
const MAX_SPEAKERS = 8;

type Snapshot = { talks: AgendaTalk[]; speakers: SpeakerCard[] };
let cache: { at: number; data: Snapshot } | null = null;

async function load(): Promise<Snapshot> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  const speakers = await getSpeakers();
  const talks = toAgendaTalks(await getSessions(), speakers);
  const data = { talks, speakers };
  cache = { at: Date.now(), data };
  return data;
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Todas las palabras de la consulta tienen que aparecer en el texto. */
const matches = (haystack: string, query: string) => {
  const h = norm(haystack);
  return norm(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => h.includes(w));
};

const time = (t: AgendaTalk) => (t.startsAt ? t.startsAt.slice(11, 16) : null);

function describeTalk(t: AgendaTalk) {
  return {
    titulo: t.title,
    dia: DAY_LABELS[t.day as ProgramDay]?.es ?? t.day,
    hora: time(t) ?? "a confirmar",
    duracion_min: t.durationMin,
    escenario: stageLabel(t.stage, "es"),
    acceso: stageNote(t.stage, "es"),
    quienes: t.whoText ?? t.speakers?.map((s) => s.name).join(", ") ?? null,
    moderador: t.mod ?? null,
    temas: t.tags,
    descripcion: t.abstract ? t.abstract.slice(0, 280) : null,
  };
}

/** Resumen corto para el system prompt: sirve para que el modelo sepa qué consultar. */
export async function agendaOverview(): Promise<string> {
  try {
    const { talks, speakers } = await load();
    const stages = [...new Set(talks.map((t) => t.stage))].sort(compareStages);
    const days = [...new Set(talks.map((t) => t.day))].sort();
    return [
      `Hay ${talks.length} sesiones cargadas en la agenda y ${speakers.length} speakers publicados.`,
      `Días con agenda: ${days.map((d) => DAY_LABELS[d as ProgramDay]?.es ?? d).join("; ")}.`,
      `Escenarios: ${stages.map((s) => stageLabel(s, "es")).join(", ")}.`,
    ].join("\n");
  } catch (e) {
    console.error("[qubit] no se pudo armar el resumen de agenda:", (e as Error).message);
    return "La agenda no está disponible en este momento.";
  }
}

export const qubitTools = {
  buscar_agenda: tool({
    description:
      "Busca charlas, paneles y talleres de la agenda oficial de LABITCONF 2026. Usala para cualquier pregunta sobre qué hay, a qué hora, en qué escenario o quién habla. Todos los filtros son opcionales y se combinan.",
    inputSchema: jsonSchema<{ texto?: string; dia?: "oct30" | "oct31"; escenario?: string }>({
      type: "object",
      properties: {
        texto: {
          type: "string",
          description: "Palabras a buscar en título, speakers, temas o descripción (ej. 'lightning', 'Maslatón').",
        },
        dia: { type: "string", enum: ["oct30", "oct31"], description: "oct30 = viernes 30, oct31 = sábado 31." },
        escenario: { type: "string", description: "Nombre del escenario (ej. 'Orange Pill', 'Visión', 'ABC')." },
      },
      additionalProperties: false,
    }),
    execute: async ({ texto, dia, escenario }) => {
      try {
        const { talks } = await load();
        const hits = talks.filter(
          (t) =>
            (!dia || t.day === dia) &&
            (!escenario || matches(stageLabel(t.stage, "es"), escenario)) &&
            (!texto ||
              matches([t.title, t.whoText, t.mod, t.abstract, t.tags.join(" ")].filter(Boolean).join(" "), texto))
        );
        return {
          total: hits.length,
          mostrando: Math.min(hits.length, MAX_TALKS),
          sesiones: hits.slice(0, MAX_TALKS).map(describeTalk),
        };
      } catch (e) {
        console.error("[qubit] buscar_agenda:", (e as Error).message);
        return { error: "No pude leer la agenda en este momento." };
      }
    },
  }),

  buscar_speakers: tool({
    description:
      "Busca speakers publicados de LABITCONF 2026 por nombre, empresa, país o tema, y devuelve también sus charlas. Usala para preguntas sobre quién es alguien o quiénes hablan de un tema.",
    inputSchema: jsonSchema<{ texto: string }>({
      type: "object",
      properties: {
        texto: { type: "string", description: "Nombre, empresa, país o tema (ej. 'Argentina', 'minería')." },
      },
      required: ["texto"],
      additionalProperties: false,
    }),
    execute: async ({ texto }) => {
      try {
        const { talks, speakers } = await load();
        const hits = speakers.filter((s) =>
          matches(
            [s.name, s.fullName, s.role, s.company, s.country, s.tags.join(" ")].filter(Boolean).join(" "),
            texto
          )
        );
        return {
          total: hits.length,
          mostrando: Math.min(hits.length, MAX_SPEAKERS),
          speakers: hits.slice(0, MAX_SPEAKERS).map((s) => ({
            nombre: s.fullName ?? s.name,
            cargo: s.role,
            empresa: s.company,
            pais: s.country,
            temas: s.tags,
            ficha: `https://www.labitconf.com/speakers/${s.slug}`,
            charlas: talks
              .filter((t) => t.speakers?.some((x) => x.slug === s.slug) || t.moderator?.slug === s.slug)
              .slice(0, 5)
              .map(describeTalk),
          })),
        };
      } catch (e) {
        console.error("[qubit] buscar_speakers:", (e as Error).message);
        return { error: "No pude leer los speakers en este momento." };
      }
    },
  }),
};
