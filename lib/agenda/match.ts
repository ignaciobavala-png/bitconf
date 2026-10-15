// Del temario estático a la forma que ya entiende la agenda (`AgendaTalk`).
//
// El boceto de la organización trae los speakers como texto libre ("Luis J.
// Canessa y Otros", "Gabi Battiato & Co."). Ese texto se muestra LITERAL; el
// cruce con la tabla de speakers solo sirve para ponerle foto y link a la
// ficha a quien se pueda identificar. Lo que no matchea queda como texto: un
// match dudoso que lleva a la ficha de otra persona es peor que no tener link.

import type { AgendaTalk, SpeakerCard } from "@/lib/speakers/queries";
import { TRACKS, type Session } from "./temario";
import { sessionUuid } from "./ids";

function norm(v: string): string {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cómo nombra la agenda a quien en la ficha figura con otro nombre (apodo o
 * handle vs nombre real). Clave: el nombre del temario normalizado; valor: el
 * nombre de la ficha. Parche hasta que el temario traiga ids de speaker.
 */
const ALIASES: Record<string, string> = {
  rodo: "Rodolfo Andragnes",
  visionariobtc: "Adrián Treviño",
  johan: "Johan Hernández",
  "jere souto": "Jeremias Souto",
  "nicolas seguro": "Niko Seguro",
  "ray nasser": "Raymond Nasser",
};

const SEP = /\s*(?:,|\+|&|\/|\sy\s)\s*/i;

/** Nombres sueltos dentro de un "who": separa por coma, +, &, / y " y ". */
function names(text: string): string[] {
  return text
    .split(SEP)
    .map((n) => n.trim())
    .filter(Boolean);
}

function sameName(a: string[], b: string[]): boolean {
  if (a.join(" ") === b.join(" ")) return true;
  // Un nombre contenido en el otro, pero solo con 2+ palabras en común: evita
  // que "Ivan" matchee con cualquier Iván.
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return short.length >= 2 && short.every((w) => long.includes(w));
}

export function toAgendaTalks(sessions: Session[], speakers: SpeakerCard[]): AgendaTalk[] {
  // Dos claves por speaker: el nombre publicado (alias) y el nombre real. Se
  // prueba primero contra todos los alias y recién después contra los nombres
  // reales, para que un alias exacto nunca pierda contra un parecido.
  const byAlias = speakers.map((s) => ({ card: s, words: norm(s.name).split(" ") }));
  const byReal = speakers
    .filter((s) => s.fullName)
    .map((s) => ({ card: s, words: norm(s.fullName as string).split(" ") }));

  const ordered = [...sessions].sort(
    (a, b) =>
      a.day.localeCompare(b.day) ||
      a.start - b.start ||
      TRACKS.indexOf(a.track) - TRACKS.indexOf(b.track)
  );

  return ordered.map((s) => {
    // Celdas que traen solo un nombre ("Carlos Maslatón") lo tienen en el título.
    const source = s.who ?? (s.title.split(" ").length <= 4 ? s.title : "");
    const seen = new Set<string>();
    const found: NonNullable<AgendaTalk["speakers"]> = [];
    for (const n of names(source)) {
      const words = norm(ALIASES[norm(n)] ?? n).split(" ");
      const hit =
        byAlias.find((x) => sameName(words, x.words)) ?? byReal.find((x) => sameName(words, x.words));
      if (hit && !seen.has(hit.card.slug)) {
        seen.add(hit.card.slug);
        found.push({ slug: hit.card.slug, name: hit.card.name, photoUrl: hit.card.photoUrl });
      }
    }

    // Hora del evento: Buenos Aires es UTC-3 todo el año (sin horario de verano).
    const date = s.day === "oct30" ? "2026-10-30" : "2026-10-31";
    const hh = String(Math.floor(s.start / 60)).padStart(2, "0");
    const mm = String(s.start % 60).padStart(2, "0");

    return {
      id: sessionUuid(s.id),
      title: s.title,
      abstract: null,
      tags: s.tags,
      level: null,
      durationMin: s.dur,
      isPanel: false,
      stage: `s${TRACKS.indexOf(s.track) + 1}`,
      day: s.day,
      startsAt: `${date}T${hh}:${mm}:00-03:00`,
      speaker: found[0] ?? null,
      whoText: s.who,
      mod: s.mod,
      speakers: found,
      span: s.span,
    };
  });
}
