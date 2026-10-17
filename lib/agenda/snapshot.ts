// Contrato `labitconf.temario.v1`: lo que la organización publica desde su
// artefacto hacia la web.
//
// Este archivo es PURO (sin red ni base): valida lo que llega, lo normaliza a
// una forma que controlamos nosotros y lo traduce a `Session`, que es lo que
// ya entiende la agenda. Lo comparten la ruta de recepción y la lectura.
//
// Principio: lo que se guarda es lo que RECONSTRUIMOS de campos validados, no
// el body recibido. Un campo de más ("email", una nota interna) que se cuele en
// el envío no llega nunca a la base ni a una página pública.

import { CANONICAL_TAGS, type CanonicalTag } from "@/lib/speakers/tags";
import { SESSIONS, TRACKS, slug, type Session, type TemarioDay } from "./temario";

export const SCHEMA = "labitconf.temario.v1";

/** Fechas de los dos días de conferencia que muestra la agenda. */
const DAY_BY_DATE: Record<string, TemarioDay> = {
  "2026-10-30": "oct30",
  "2026-10-31": "oct31",
};

export const KINDS = ["charla", "panel", "firetalk", "plenaria", "taller", "otro"] as const;
export type Kind = (typeof KINDS)[number];

export type SnapshotSession = {
  id: string;
  day: string;
  start: string;
  durationMin: number;
  stages: string[];
  kind: Kind;
  language: string | null;
  title: string;
  speakers: { key: string | null; name: string }[];
  moderator: string | null;
  /** Descripción de la charla. El temario de la org todavía no la trae. */
  description: string | null;
  tags: CanonicalTag[];
};

export type SnapshotPayload = {
  schema: typeof SCHEMA;
  generatedAt: string | null;
  stages: { key: string; name: string }[];
  sessions: SnapshotSession[];
};

export type Validation =
  | { ok: true; payload: SnapshotPayload; warnings: string[] }
  | { ok: false; errors: string[] };

const MAX_SESSIONS = 500;
const MAX_ERRORS = 25;

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t && t.length <= max ? t : null;
}

function minutesOf(hhmm: string): number | null {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(hhmm.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export function validateTemario(body: unknown): Validation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const err = (m: string) => {
    if (errors.length < MAX_ERRORS) errors.push(m);
  };

  if (!isObj(body)) return { ok: false, errors: ["El cuerpo tiene que ser un objeto JSON."] };
  if (body.schema !== SCHEMA) err(`"schema" tiene que ser "${SCHEMA}".`);

  // ── Escenarios ──────────────────────────────────────────────
  const stages: SnapshotPayload["stages"] = [];
  if (!Array.isArray(body.stages) || body.stages.length === 0) {
    err('Falta "stages": la lista de escenarios con su nombre.');
  } else {
    for (const [i, raw] of body.stages.entries()) {
      const key = isObj(raw) ? str(raw.key, 20) : null;
      const name = isObj(raw) ? str(raw.name, 60) : null;
      if (!key || !name) err(`stages[${i}]: necesita "key" y "name" (texto).`);
      else if (!/^s[1-9]$/.test(key)) err(`stages[${i}]: "key" tiene que ser s1 a s9 (llegó "${key}").`);
      else if (stages.some((s) => s.key === key)) err(`stages[${i}]: "${key}" está repetido.`);
      else stages.push({ key, name });
    }
    // La web tiene siete columnas con nombre propio. Un nombre distinto no
    // rompe nada, pero hoy la web sigue mostrando el suyo: se avisa.
    for (const s of stages) {
      const n = Number(s.key.slice(1));
      const known = TRACKS[n - 1];
      if (!known) warnings.push(`El escenario ${s.key} ("${s.name}") no existe en la web; sus sesiones no se muestran.`);
    }
  }
  const stageKeys = new Set(stages.map((s) => s.key));

  // ── Sesiones ────────────────────────────────────────────────
  const sessions: SnapshotSession[] = [];
  if (!Array.isArray(body.sessions)) {
    err('Falta "sessions": la lista de sesiones.');
  } else if (body.sessions.length === 0) {
    err('"sessions" está vacío: no se publica un temario sin sesiones.');
  } else if (body.sessions.length > MAX_SESSIONS) {
    err(`Demasiadas sesiones (${body.sessions.length}, máximo ${MAX_SESSIONS}).`);
  } else {
    const ids = new Set<string>();
    for (const [i, raw] of body.sessions.entries()) {
      const at = `sessions[${i}]`;
      if (!isObj(raw)) {
        err(`${at}: tiene que ser un objeto.`);
        continue;
      }
      const id = str(raw.id, 120);
      const title = str(raw.title, 400);
      if (!id) err(`${at}: falta "id" (texto estable de la tarjeta).`);
      else if (ids.has(id)) err(`${at}: el id "${id}" está repetido.`);
      else ids.add(id);
      if (!title) err(`${at}: falta "title".`);

      const day = typeof raw.day === "string" ? raw.day : "";
      if (!DAY_BY_DATE[day]) err(`${at}: "day" tiene que ser 2026-10-30 o 2026-10-31 (llegó "${day}").`);

      const start = typeof raw.start === "string" ? minutesOf(raw.start) : null;
      if (start === null) err(`${at}: "start" tiene que ser HH:MM (llegó "${String(raw.start)}").`);
      else if (start % 5 !== 0) err(`${at}: "start" tiene que caer en múltiplos de 5 minutos.`);

      const dur = raw.durationMin;
      if (typeof dur !== "number" || !Number.isInteger(dur) || dur < 5 || dur > 600 || dur % 5 !== 0) {
        err(`${at}: "durationMin" tiene que ser un entero entre 5 y 600, múltiplo de 5.`);
      }

      const sts = Array.isArray(raw.stages) ? raw.stages.filter((x): x is string => typeof x === "string") : [];
      if (sts.length === 0) err(`${at}: falta "stages" (al menos un escenario).`);
      else {
        const bad = sts.find((k) => !stageKeys.has(k));
        if (bad) err(`${at}: el escenario "${bad}" no está en la lista de "stages".`);
        const idx = sts.map((k) => Number(k.slice(1))).sort((a, b) => a - b);
        if (idx.some((n, j) => j > 0 && n !== idx[j - 1] + 1)) {
          err(`${at}: los escenarios de una plenaria tienen que ser consecutivos.`);
        }
      }

      const kind = (KINDS as readonly string[]).includes(raw.kind as string) ? (raw.kind as Kind) : "otro";
      if (raw.kind !== undefined && kind === "otro" && raw.kind !== "otro") {
        warnings.push(`${at}: kind "${String(raw.kind)}" no se reconoce; se guarda como "otro".`);
      }

      const speakers: SnapshotSession["speakers"] = [];
      if (Array.isArray(raw.speakers)) {
        for (const sp of raw.speakers) {
          const name = isObj(sp) ? str(sp.name, 120) : null;
          if (name) speakers.push({ key: isObj(sp) ? str(sp.key, 120) : null, name });
        }
      }

      let tags: CanonicalTag[] = [];
      if (Array.isArray(raw.tags)) {
        tags = raw.tags.filter((t): t is CanonicalTag => (CANONICAL_TAGS as readonly string[]).includes(t as string));
        if (tags.length !== raw.tags.length) warnings.push(`${at}: algún tag no es de los 12 vigentes y se descartó.`);
      }

      if (id && title && DAY_BY_DATE[day] && start !== null && typeof dur === "number" && sts.length) {
        sessions.push({
          id,
          day,
          start: `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}`,
          durationMin: dur,
          stages: sts,
          kind,
          language: str(raw.language, 10),
          title,
          speakers,
          // La org manda el moderador como { key, name } (igual que los speakers);
          // el temario de ejemplo lo traía como texto. Se aceptan los dos.
          moderator: str(isObj(raw.moderator) ? raw.moderator.name : raw.moderator, 120),
          description: str(raw.description ?? raw.abstract ?? raw.descripcion, 4000),
          tags,
        });
      }
    }

    // Dos tarjetas en el mismo escenario y horario se dibujarían una encima de
    // la otra: se frena acá, no en la pantalla del asistente.
    const busy = new Map<string, SnapshotSession>();
    for (const s of sessions) {
      const from = minutesOf(s.start) as number;
      for (const st of s.stages) {
        for (let m = from; m < from + s.durationMin; m += 5) {
          const k = `${s.day}|${st}|${m}`;
          const other = busy.get(k);
          if (other && other.id !== s.id) {
            err(`"${s.title}" y "${other.title}" se pisan en ${s.day} ${st} a las ${s.start}.`);
            m = from + s.durationMin;
            break;
          }
          busy.set(k, s);
        }
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  const generatedAt =
    typeof body.generatedAt === "string" && !Number.isNaN(Date.parse(body.generatedAt))
      ? new Date(body.generatedAt).toISOString()
      : null;

  return { ok: true, payload: { schema: SCHEMA, generatedAt, stages, sessions }, warnings };
}

// ── Del contrato a lo que dibuja la agenda ───────────────────────────────

/**
 * Temas provisorios del temario cargado a mano, por título. El artefacto de la
 * organización todavía no manda temas; mientras tanto, una sesión que ya
 * teníamos conserva los suyos en vez de perder el filtro por tema de golpe.
 */
const FALLBACK_TAGS = new Map(SESSIONS.map((s) => [slug(s.title), s.tags]));

export function toSessions(payload: SnapshotPayload): Session[] {
  const out: Session[] = [];
  for (const s of payload.sessions) {
    const nums = s.stages.map((k) => Number(k.slice(1))).sort((a, b) => a - b);
    const track = TRACKS[nums[0] - 1];
    if (!track) continue; // escenario que la web no tiene (ya se avisó)
    out.push({
      id: s.id,
      day: DAY_BY_DATE[s.day],
      track,
      span: Math.min(nums.length, TRACKS.length - (nums[0] - 1)),
      start: minutesOf(s.start) as number,
      dur: s.durationMin,
      title: s.title,
      who: s.speakers.length ? s.speakers.map((x) => x.name).join(", ") : undefined,
      mod: s.moderator ?? undefined,
      description: s.description ?? undefined,
      tags: s.tags.length ? s.tags : (FALLBACK_TAGS.get(slug(s.title)) ?? []),
    });
  }
  return out;
}
