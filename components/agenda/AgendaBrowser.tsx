"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLangStore } from "@/lib/store/lang";
import { CANONICAL_TAGS, TAG_LABELS, type CanonicalTag } from "@/lib/speakers/tags";
import {
  DAYS,
  DAY_SHORT,
  HODLWEEN,
  PROGRAM,
  compareStages,
  eventMinutes,
  formatMinutes,
  isDay,
  stageLabel,
  stageNote,
  type Day,
} from "@/lib/speakers/schedule";
import { demoStartTimes } from "@/lib/speakers/demo";
import AgendaToggle from "./AgendaToggle";
import ScheduleGrid, { type ScheduledTalk } from "./ScheduleGrid";
import MobileTimeline from "./MobileTimeline";
import TalkDetail from "./TalkDetail";
import type { AgendaTalk } from "@/lib/speakers/queries";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 300,
};

const BANNER_VIDEO_SRC =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/home/media-partners-bg.mp4";

const T = {
  es: {
    allStages: "Todos los escenarios",
    allTopics: "Todos los temas",
    stage: "Escenario",
    topic: "Tema",
    minutes: "min",
    panel: "Panel",
    empty: "No hay charlas confirmadas con ese criterio todavía.",
    clear: "Limpiar filtros",
    search: "Buscar charla, speaker o tema",
    clearSearch: "Borrar búsqueda",
    grid: "Grilla",
    list: "Lista",
    gridOnDesktop: "La grilla horaria necesita pantalla ancha",
    demoTitle: "Horarios de ejemplo",
    demoBody:
      "Esta grilla usa horarios inventados a partir de la duración de cada charla, solo para mostrar cómo se va a ver. La organización todavía no confirmó la hora de inicio.",
    otherDay: (n: number, d: string) =>
      `${n} ${n === 1 ? "coincidencia" : "coincidencias"} el ${d}`,
    count: (n: number) => `${n} ${n === 1 ? "charla" : "charlas"}`,
    countIn: (n: number, s: number) =>
      `${n} ${n === 1 ? "charla" : "charlas"} en ${s} ${s === 1 ? "escenario" : "escenarios"}`,
    talksIn: (n: number) => `${n} ${n === 1 ? "charla" : "charlas"}`,
    level: { general: "General", intermedio: "Intermedio", avanzado: "Avanzado", todos: "Todos los niveles" } as Record<string, string>,
  },
  en: {
    allStages: "All stages",
    allTopics: "All topics",
    stage: "Stage",
    topic: "Topic",
    minutes: "min",
    panel: "Panel",
    empty: "No confirmed talks match that filter yet.",
    clear: "Clear filters",
    search: "Search talk, speaker or topic",
    clearSearch: "Clear search",
    grid: "Grid",
    list: "List",
    gridOnDesktop: "The time grid needs a wider screen",
    demoTitle: "Sample times",
    demoBody:
      "This grid uses made-up start times derived from each talk's duration, only to show how it will look. The organizers have not confirmed the real schedule yet.",
    otherDay: (n: number, d: string) => `${n} ${n === 1 ? "match" : "matches"} on ${d}`,
    count: (n: number) => `${n} ${n === 1 ? "talk" : "talks"}`,
    countIn: (n: number, s: number) =>
      `${n} ${n === 1 ? "talk" : "talks"} across ${s} ${s === 1 ? "stage" : "stages"}`,
    talksIn: (n: number) => `${n} ${n === 1 ? "talk" : "talks"}`,
    level: { general: "General", intermedio: "Intermediate", avanzado: "Advanced", todos: "All levels" } as Record<string, string>,
  },
} as const;

/**
 * Sin acentos y en minúsculas: nadie escribe "Regulación" con tilde en un
 * buscador, y la mitad de los títulos de la planilla vienen en mayúsculas.
 */
function norm(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Un solo texto por charla, armado una vez y reusado en cada tecla. */
function haystack(k: AgendaTalk, lang: "es" | "en"): string {
  return norm(
    [
      k.title,
      k.abstract ?? "",
      k.speaker?.name ?? "",
      k.whoText ?? "",
      k.mod ?? "",
      stageLabel(k.stage, lang),
      ...k.tags.map((c) => TAG_LABELS[c][lang]),
    ].join(" ")
  );
}

/** La query no cambia sin navegar, así que no hay a qué suscribirse. */
const noSubscribe = () => () => {};

/**
 * Si se permiten los horarios de ejemplo (ver lib/speakers/demo.ts).
 *
 * Están permitidos POR DEFECTO: mientras la planilla no traiga la hora de
 * inicio, es la única forma de ver la grilla, y el cliente pidió tenerla a la
 * vista en `/agenda` desde ya. `?demo=0` los apaga, para poder mirar el estado
 * real de los datos.
 *
 * No alcanza con este permiso para que se usen: solo entran si además faltan
 * horarios reales — ver `usingSample` más abajo.
 *
 * Va por `useSyncExternalStore` y no por `useState` + efecto: el servidor
 * renderiza sin la query y el cliente la lee del navegador, que es exactamente
 * el caso para el que existe este hook. Con un efecto, React avisa (con razón)
 * de la cascada de renders.
 */
function useSampleTimesAllowed(): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => new URLSearchParams(window.location.search).get("demo") !== "0",
    // En el servidor se asume que sí: es el caso de hoy, y así el HTML
    // prerenderizado coincide con lo que el cliente va a dibujar.
    () => true
  );
}


/** Lee un parámetro de la URL sin suscribirse: no cambia sin navegar. */
function useQueryParam(name: string): string | null {
  return useSyncExternalStore(
    noSubscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => null
  );
}

/**
 * "Ahora" en ms, redondeado al minuto para que el snapshot sea estable entre
 * renders. En el servidor y en el primer render del cliente es `null`: el HTML
 * prerenderizado no depende de la hora de quien lo pidió.
 *
 * `?now=2026-10-30T11:07` fija la hora a mano, para poder ver cómo queda la
 * agenda a mitad del evento (mismo espíritu que `?demo=`).
 */
function useNow(): number | null {
  return useSyncExternalStore(
    (onChange) => {
      const id = window.setInterval(onChange, 20_000);
      return () => window.clearInterval(id);
    },
    () => {
      const forced = new URLSearchParams(window.location.search).get("now");
      if (forced) {
        // Sin zona se entiende hora de Buenos Aires, como el resto de la agenda.
        const ms = Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(forced) ? forced : `${forced}-03:00`);
        if (!Number.isNaN(ms)) return ms;
      }
      return Math.floor(Date.now() / 60_000) * 60_000;
    },
    () => null
  );
}

const WIDE_QUERY = "(min-width: 1024px)";

/**
 * Abajo de 1024 la vista es siempre la lista: con siete escenarios cada
 * columna quedaría en ~45px. En el servidor devuelve `false` para que el HTML
 * prerenderizado sea el de mobile, que es el que nunca depende de la grilla.
 */
function useWideScreen(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(WIDE_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false
  );
}

/** Una plenaria toca varias columnas: cuenta en cada una de ellas. */
function touchesStage(k: AgendaTalk, stage: string): boolean {
  const from = Number(k.stage.replace(/^s/i, ""));
  const at = Number(stage.replace(/^s/i, ""));
  return at >= from && at < from + (k.span ?? 1);
}

/**
 * Lista desplegable de filtro. Es un <select> nativo con la apariencia de la
 * pill del sitio: en el teléfono abre el selector del sistema (la mejor
 * interacción posible con el pulgar) y en escritorio el teclado y el lector de
 * pantalla funcionan sin trabajo extra. Cada opción trae su cantidad, así no se
 * ofrece un filtro que no devuelve nada.
 */
function FilterSelect({
  label,
  allLabel,
  accent,
  value,
  onChange,
  options,
}: {
  label: string;
  allLabel: string;
  accent: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options: { value: string; label: string; count: number }[];
}) {
  const on = value !== null;
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="cursor-pointer appearance-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#E6EEF2]"
        style={{
          ...labelStyle,
          colorScheme: "dark",
          fontSize: "clamp(10px, 1vw, 12px)",
          padding: "11px 44px 11px 20px",
          minWidth: 200,
          color: on ? "#171616" : "#E6EEF2",
          background: on ? accent : "transparent",
          border: `1px solid ${on ? accent : "rgba(230,238,242,0.25)"}`,
        }}
      >
        <option value="" style={{ background: "#171616", color: "#E6EEF2" }}>
          {allLabel}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#171616", color: "#E6EEF2" }}>
            {o.label} ({o.count})
          </option>
        ))}
      </select>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
      >
        <path d="M5 9l7 7 7-7" stroke={on ? "#171616" : "#E6EEF2"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

/**
 * Filtro en pills a la vista, sin desplegable (solo escritorio, devolución de
 * la org 15/10/2026): se usa para los temas; el escenario sigue en desplegable.
 * Tocar la pill activa la apaga.
 */
function FilterPills({
  label,
  allLabel,
  accent,
  value,
  onChange,
  options,
}: {
  label: string;
  allLabel: string;
  accent: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options: { value: string; label: string; count: number }[];
}) {
  const pill = (key: string, text: string, color: string, on: boolean, next: string | null) => (
    <button
      key={key}
      type="button"
      onClick={() => onChange(next)}
      aria-pressed={on}
      className="rounded-full transition-colors duration-200"
      style={{
        ...labelStyle,
        fontSize: "clamp(10px, 0.9vw, 12px)",
        padding: "9px 16px",
        whiteSpace: "nowrap",
        color: on ? "#171616" : "#E6EEF2",
        background: on ? color : "transparent",
        border: `1px solid ${on ? color : "rgba(230,238,242,0.25)"}`,
      }}
    >
      {text}
    </button>
  );
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      {pill("all", allLabel, accent, value === null, null)}
      {options.map((o) =>
        pill(o.value, `${o.label} (${o.count})`, accent, value === o.value, value === o.value ? null : o.value)
      )}
    </div>
  );
}

export default function AgendaBrowser({
  talks,
  header,
}: {
  talks: AgendaTalk[];
  header?: React.ReactNode;
}) {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  // El día arranca en el primero que tenga algo cargado, no en oct30 fijo: si
  // la organización todavía no confirmó nada del viernes, entrar a una pantalla
  // vacía parece un error del sitio.
  const daysWithContent = useMemo(
    () => DAYS.filter((d) => talks.some((k) => k.day === d)),
    [talks]
  );
  // `?day=oct30|oct31` (links del cronograma de la home) manda sobre el
  // default; después de elegir a mano, manda la elección.
  const dayParam = useQueryParam("day");
  const [pickedDay, setDay] = useState<Day | null>(null);
  const day: Day = pickedDay ?? (isDay(dayParam) ? dayParam : (daysWithContent[0] ?? DAYS[0]));

  // La agenda son los dos días de conferencia. El jueves (Open Fest) y el
  // domingo (Closing Day) quedaron fuera por decisión de la organización: son
  // solo Experience y no tienen charlas. Su contenido sigue en `PROGRAM`, para
  // la sección de experiencias.
  const dayInfo = PROGRAM[day];
  const [stage, setStage] = useState<string | null>(null);
  const [tag, setTag] = useState<CanonicalTag | null>(null);
  const [query, setQuery] = useState("");

  const sampleAllowed = useSampleTimesAllowed();
  const wideScreen = useWideScreen();
  const now = useNow();

  // Ficha de charla abierta. `undefined` = el usuario todavía no tocó nada y
  // manda el `?talk=` de la URL (link desde la ficha de un speaker); `null` =
  // la cerró.
  const talkParam = useQueryParam("talk");
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  const selectedId = openId === undefined ? talkParam : openId;
  const selected = useMemo(
    () => (selectedId ? (talks.find((k) => k.id === selectedId) ?? null) : null),
    [talks, selectedId]
  );
  const openTalk = useCallback((k: AgendaTalk) => setOpenId(k.id), []);
  const closeTalk = useCallback(() => {
    setOpenId(null);
    if (new URLSearchParams(window.location.search).has("talk")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("talk");
      window.history.replaceState(null, "", url);
    }
  }, []);
  const [view, setView] = useState<"grid" | "list">("grid");

  const needle = norm(query.trim());

  // El índice se arma una vez por idioma, no en cada tecla: son 31 charlas hoy,
  // pero la búsqueda corre en cada keystroke y el abstract es largo.
  const index = useMemo(() => {
    const map = new Map<string, string>();
    for (const k of talks) map.set(k.id, haystack(k, lang));
    return map;
  }, [talks, lang]);

  const ofDay = useMemo(() => talks.filter((k) => k.day === day), [talks, day]);

  // Los escenarios se ofrecen por día: el sábado no usa los mismos que el
  // viernes, y un chip que no devuelve nada es una promesa vacía.
  const stagesOfDay = useMemo(
    () => Array.from(new Set(ofDay.map((k) => k.stage))).sort(compareStages),
    [ofDay]
  );

  const tagsOfDay = useMemo(() => {
    const present = new Set(ofDay.flatMap((k) => k.tags));
    return CANONICAL_TAGS.filter((c) => present.has(c));
  }, [ofDay]);

  const filtered = useMemo(() => {
    const out: AgendaTalk[] = [];
    for (const k of ofDay) {
      // El tema NO oculta: las que no lo tienen se muestran atenuadas
      // (pedido de la org, 15/10/2026), así se ve qué hay fuera del tema.
      const dim = !!tag && !k.tags.includes(tag);
      if (needle && !(index.get(k.id) ?? "").includes(needle)) continue;
      if (stage) {
        // Una plenaria toca varias columnas: con un escenario elegido aparece
        // en cada una de ellas, y ahí ocupa una sola (hay una columna).
        if (!touchesStage(k, stage)) continue;
        out.push({ ...k, stage, span: 1, dim });
      } else {
        out.push({ ...k, dim });
      }
    }
    return out;
  }, [ofDay, stage, tag, needle, index]);

  // Buscar un speaker sin saber qué día habla es lo normal. En vez de mostrar
  // "no hay nada" cuando el match está en el otro día, se avisa y se ofrece
  // saltar — el filtro sigue siendo por día, que es como está pensada la página.
  const otherDayHits = useMemo(() => {
    const other = daysWithContent.find((d) => d !== day);
    if (!needle || !other) return null;
    const n = talks.filter(
      (k) => k.day === other && (index.get(k.id) ?? "").includes(needle)
    ).length;
    return n > 0 ? { day: other, n } : null;
  }, [needle, day, daysWithContent, talks, index]);

  // Agrupado por escenario: sin hora de inicio no hay eje temporal contra el
  // cual alinear filas, así que cada escenario es una columna con su programa.
  // Cuando llegue el horario, estas columnas pasan a alinearse por hora y la
  // estructura de datos ya sirve tal cual.
  const columns = useMemo(() => {
    const by = new Map<string, AgendaTalk[]>();
    for (const k of filtered) {
      const list = by.get(k.stage);
      if (list) list.push(k);
      else by.set(k.stage, [k]);
    }
    return Array.from(by.entries()).sort((a, b) => compareStages(a[0], b[0]));
  }, [filtered]);

  /** Los horarios que sí vienen de la planilla. Hoy: ninguno. */
  const realTimes = useMemo(() => {
    const map = new Map<string, number>();
    for (const k of talks) {
      const m = k.startsAt ? eventMinutes(k.startsAt) : null;
      if (m != null) map.set(k.id, m);
    }
    return map;
  }, [talks]);

  // Los de ejemplo se usan SOLO mientras falte algún horario real del día. El
  // día que la organización los cargue, esta condición se apaga sola y la
  // grilla pasa al cronograma verdadero sin tocar una línea de código.
  const usingSample =
    sampleAllowed && ofDay.some((k) => !realTimes.has(k.id));

  const startTimes = useMemo(
    () => (usingSample ? demoStartTimes(talks, day) : realTimes),
    [usingSample, day, talks, realTimes]
  );

  const scheduled = useMemo<[string, ScheduledTalk[]][]>(
    () =>
      columns.map(([s, list]) => [
        s,
        list
          .filter((k) => startTimes.has(k.id))
          .map((k) => ({ ...k, startMin: startTimes.get(k.id) as number }))
          .sort((a, b) => a.startMin - b.startMin),
      ]),
    [columns, startTimes]
  );

  // La grilla se ofrece solo si TODAS las charlas visibles tienen hora: una
  // grilla a la que le faltan la mitad de las charlas esconde contenido sin
  // avisar, que es peor que no tener grilla.
  const hasSchedule =
    filtered.length > 0 &&
    scheduled.every(([, list], i) => list.length === columns[i][1].length);

  const showGrid = hasSchedule && wideScreen && view === "grid";
  // Línea de tiempo del día (por hora, con el color de cada escenario) en vez
  // de una lista por escenario: es la vista de mobile y también la de "Lista"
  // en pantalla ancha (pedido de la org, 15/10/2026).
  const showTimeline = hasSchedule && (!wideScreen || view === "list");

  // Inicio de la próxima charla de TODO el programa (no solo de lo filtrado):
  // que "próxima" no dependa de qué filtro tenga puesto la persona.
  const nextStart = useMemo(() => {
    if (now == null) return null;
    let best: number | null = null;
    for (const k of talks) {
      const start = k.startsAt ? Date.parse(k.startsAt) : NaN;
      if (Number.isNaN(start) || start <= now) continue;
      if (best == null || start < best) best = start;
    }
    return best;
  }, [talks, now]);

  // Si el día que estaba elegido se queda sin escenario seleccionado válido
  // (pasa al cambiar de día con un filtro puesto), se suelta el filtro.
  function selectDay(next: Day) {
    setDay(next);
    setStage(null);
  }

  return (
    <div className="w-full">
      {/* Banner: fondo full-bleed solo hasta los botones de día; de ahí para
          abajo la agenda queda sobre fondo liso. */}
      <div
        className="relative overflow-hidden -ml-6 sm:-ml-10 w-screen px-6 sm:px-10 pt-32 sm:pt-40 pb-8"
      >
        {/* Loop de fondo (mismo clip de Media Partners, sin texto horneado,
            que sí tendría el video del hero de la home). Va desde el bucket
            público: no se trackean binarios en git. */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" style={{ zIndex: 0, opacity: 0.45 }}>
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/assets/home/hashes.jpg"
            aria-hidden
          >
            <source src={BANNER_VIDEO_SRC} type="video/mp4" />
          </video>
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,0.4) 70%, #000 100%)",
          }}
        />
        <div className="relative w-full max-w-6xl" style={{ zIndex: 2 }}>
          {header}
        </div>
      <div className="relative mt-8 flex flex-wrap gap-2 sm:gap-3" style={{ zIndex: 2 }}>
        {DAYS.map((d) => {
          const on = d === day;
          return (
            <button
              key={d}
              type="button"
              onClick={() => selectDay(d)}
              className="rounded-full transition-colors duration-200"
              style={{
                ...labelStyle,
                fontSize: "clamp(11px, 1.2vw, 15px)",
                padding: "12px 26px",
                flexShrink: 0,
                whiteSpace: "nowrap",
                color: on ? "#171616" : "#E6EEF2",
                background: on ? "#ABF760" : "transparent",
                border: `1px solid ${on ? "#ABF760" : "rgba(230,238,242,0.25)"}`,
              }}
            >
              {DAY_SHORT[d][lang]}
            </button>
          );
        })}
      </div>
      </div>

      {/* Horario y acceso de la jornada elegida: contesta la primera pregunta
          antes de entrar a los escenarios. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span style={{ ...labelStyle, color: "#FF4E01", fontSize: "clamp(10px, 1vw, 12px)" }}>
          {dayInfo.tag[lang]}
        </span>
        <span style={{ ...bodyStyle, color: "#E6EEF2", fontSize: "clamp(12px, 1.15vw, 14px)" }}>
          {dayInfo.hours[lang]}
        </span>
        <span style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(12px, 1.15vw, 14px)" }}>
          {dayInfo.access[lang]}
        </span>
      </div>

      {/* Buscador — pill, misma familia visual que los chips */}
      <div
        className="mt-6 flex items-center gap-3 rounded-full"
        style={{
          maxWidth: 420,
          padding: "11px 18px",
          border: `1px solid ${needle ? "#ABF760" : "rgba(230,238,242,0.18)"}`,
          background: "rgba(255,255,255,0.02)",
          transition: "border-color 200ms",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="7" stroke={needle ? "#ABF760" : "#A5A8B1"} strokeWidth="2" />
          <path d="M16.5 16.5L21 21" stroke={needle ? "#ABF760" : "#A5A8B1"} strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search}
          aria-label={t.search}
          className="w-full bg-transparent outline-none placeholder:text-[#A5A8B1] [&::-webkit-search-cancel-button]:hidden"
          style={{ ...bodyStyle, color: "#E6EEF2", fontSize: "clamp(13px, 1.2vw, 15px)" }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t.clearSearch}
            className="transition-opacity duration-200 hover:opacity-70"
            style={{ ...labelStyle, color: "#A5A8B1", fontSize: 14, lineHeight: 1, flexShrink: 0 }}
          >
            ×
          </button>
        )}
      </div>

      {/* Escenario y tema: dos listas desplegables y no filas de chips. Con 12
          temas la fila se salía de la pantalla y nada indicaba que había más
          hacia los costados; una lista desplegable muestra todo de una vez y
          en mobile abre el selector nativo. */}
      <div className={wideScreen ? "mt-6 flex flex-col items-start gap-3" : "mt-6 flex flex-wrap gap-3"}>
        <FilterSelect
          label={t.stage}
          allLabel={t.allStages}
          accent="#FF4E01"
          value={stage}
          onChange={setStage}
          options={stagesOfDay.map((s) => ({
            value: s,
            label: stageLabel(s, lang),
            count: ofDay.filter((k) => touchesStage(k, s)).length,
          }))}
        />
        {tagsOfDay.length > 0 &&
          (() => {
            const Topic = wideScreen ? FilterPills : FilterSelect;
            return (
              <Topic
                label={t.topic}
                allLabel={t.allTopics}
                accent="#ABF760"
                value={tag}
                onChange={(v) => setTag(v as CanonicalTag | null)}
                options={tagsOfDay.map((c) => ({
                  value: c,
                  label: TAG_LABELS[c][lang],
                  count: ofDay.filter((k) => k.tags.includes(c)).length,
                }))}
              />
            );
          })()}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(12px, 1.1vw, 14px)" }}>
          {stage ? t.count(filtered.length) : t.countIn(filtered.length, columns.length)}
        </p>

        {/* El toggle aparece solo cuando hay grilla que ofrecer. Mostrarlo
            deshabilitado en mobile o sin horarios sería prometer una vista que
            no existe. */}
        {hasSchedule && wideScreen && (
          <div
            className="flex rounded-full"
            style={{ border: "1px solid rgba(230,238,242,0.18)", padding: 3 }}
          >
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className="rounded-full transition-colors duration-200"
                style={{
                  ...labelStyle,
                  fontSize: "clamp(9px, 0.9vw, 11px)",
                  padding: "7px 16px",
                  color: view === v ? "#171616" : "#A5A8B1",
                  background: view === v ? "#E6EEF2" : "transparent",
                }}
              >
                {v === "grid" ? t.grid : t.list}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Los horarios de la demo son inventados: el cartel va pegado a la
          grilla, no en el header, para que no se lea salteado. */}
      {usingSample && showGrid && (
        <div
          className="mt-4 rounded-xl"
          style={{
            border: "1px solid rgba(255,171,11,0.45)",
            background: "rgba(255,171,11,0.07)",
            padding: "14px 18px",
          }}
        >
          <p style={{ ...labelStyle, color: "#FFAB0B", fontSize: "clamp(10px, 1vw, 12px)" }}>
            {t.demoTitle}
          </p>
          <p
            className="mt-2"
            style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(12px, 1.15vw, 14px)", lineHeight: 1.55, maxWidth: "64ch" }}
          >
            {t.demoBody}
          </p>
        </div>
      )}

      {otherDayHits && (
        <button
          type="button"
          onClick={() => selectDay(otherDayHits.day)}
          className="mt-2 rounded-full transition-opacity duration-200 hover:opacity-80"
          style={{
            ...labelStyle,
            color: "#FFAB0B",
            fontSize: "clamp(10px, 1vw, 12px)",
            border: "1px solid rgba(255,171,11,0.4)",
            padding: "8px 16px",
          }}
        >
          {t.otherDay(otherDayHits.n, DAY_SHORT[otherDayHits.day][lang])} →
        </button>
      )}

      {day === HODLWEEN.day && <HodlweenBlock lang={lang} />}

      {filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-start gap-4">
          <p style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(14px, 1.4vw, 18px)" }}>{t.empty}</p>
          <button
            type="button"
            onClick={() => {
              setStage(null);
              setTag(null);
              setQuery("");
            }}
            className="rounded-full transition-opacity duration-200 hover:opacity-80"
            style={{ ...labelStyle, color: "#171616", background: "#ABF760", fontSize: "clamp(11px, 1.05vw, 13px)", padding: "11px 22px" }}
          >
            {t.clear}
          </button>
        </div>
      ) : showGrid ? (
        <div className="mt-8">
          <ScheduleGrid day={day as Day} columns={scheduled} lang={lang} onOpen={openTalk} />
        </div>
      ) : showTimeline ? (
        <div className="mx-auto w-full max-w-3xl">
          <MobileTimeline
            talks={scheduled.flatMap(([, list]) => list)}
            now={usingSample ? null : now}
            nextStart={usingSample ? null : nextStart}
            lang={lang}
            onOpen={openTalk}
          />
        </div>
      ) : (
        <div
          className={
            stage
              ? "mt-8 grid grid-cols-1 gap-6"
              : "mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 items-start"
          }
        >
          {columns.map(([s, list], col) => (
            <section key={s}>
              <header
                className="flex items-baseline justify-between gap-3 pb-3"
                style={{ borderBottom: "1px solid rgba(255,78,1,0.35)" }}
              >
                <div>
                  <h2 style={{ ...labelStyle, color: "#FF4E01", fontSize: "clamp(13px, 1.4vw, 17px)" }}>
                    {stageLabel(s, lang)}
                  </h2>
                  {stageNote(s, lang) && (
                    <p className="mt-1" style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(10px, 1vw, 12px)" }}>
                      {stageNote(s, lang)}
                    </p>
                  )}
                </div>
                <span style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(10px, 1vw, 12px)" }}>
                  {t.talksIn(list.length)}
                </span>
              </header>

              <div className="mt-4 flex flex-col gap-4">
                {list.map((k, i) => (
                  <TalkCard key={k.id} talk={k} index={col * 2 + i} lang={lang} wide={!!stage} onOpen={openTalk} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {selected && <TalkDetail talk={selected} lang={lang} onClose={closeTalk} />}
    </div>
  );
}

/**
 * Evento transversal del sábado: va ARRIBA del día, antes de la grilla (pedido de
 * la org, 16/10). El banner ya trae el nombre, el lugar y la fecha horneados, así
 * que el texto de abajo solo suma lo que el banner no dice: horario y qué es.
 */
function HodlweenBlock({ lang }: { lang: "es" | "en" }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      // Panorámico (~3,5:1), pensado de lado a lado (pedido de la org, 19/10), pero
      // al 90% del ancho de la pantalla y centrado, no al 100% (pedido del 20/10).
      // El margen izquierdo se calcula contra el centro del padre, que es simétrico.
      className="mt-8 w-[90vw] ml-[calc(50%-45vw)] overflow-hidden"
      style={{ borderTop: "1px solid rgba(255,78,1,0.45)", borderBottom: "1px solid rgba(255,78,1,0.45)" }}
    >
      <Image
        src="/assets/home/hodlween-banner-wide.jpg"
        alt="HODLWEEN — Costa Salguero, Buenos Aires — sábado 31 de octubre"
        width={2051}
        height={580}
        sizes="90vw"
        className="block h-auto w-full"
        priority
      />
      <div
        className="flex flex-wrap items-baseline gap-x-4 gap-y-1"
        style={{ background: "rgba(255,78,1,0.08)", padding: "14px 24px" }}
      >
        <span style={{ ...labelStyle, color: "#FF4E01", fontSize: "clamp(10px, 1vw, 12px)" }}>
          {HODLWEEN.tag[lang]} · {HODLWEEN.hours[lang]}
        </span>
        <span style={{ ...bodyStyle, color: "#C4C7CE", fontSize: "clamp(12px, 1.15vw, 14px)" }}>
          {HODLWEEN.lead[lang]}
        </span>
      </div>
    </motion.section>
  );
}

function TalkCard({
  talk,
  index,
  lang,
  wide,
  onOpen,
}: {
  talk: AgendaTalk;
  index: number;
  lang: "es" | "en";
  wide: boolean;
  onOpen: (talk: AgendaTalk) => void;
}) {
  const t = T[lang];

  const start = talk.startsAt ? eventMinutes(talk.startsAt) : null;
  const when =
    start != null ? `${formatMinutes(start)} – ${formatMinutes(start + (talk.durationMin ?? 30))}` : null;
  const people = talk.speakers ?? (talk.speaker ? [talk.speaker] : []);

  const meta = [
    talk.durationMin ? `${talk.durationMin} ${t.minutes}` : null,
    talk.isPanel ? t.panel : null,
    talk.level ? (t.level[talk.level] ?? talk.level) : null,
  ].filter(Boolean) as string[];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: talk.dim ? 0.3 : 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 10) * 0.04, ease: "easeOut" }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a,button")) return;
        onOpen(talk);
      }}
      className="cursor-pointer rounded-2xl"
      style={{
        border: "1px solid rgba(230,238,242,0.14)",
        background: "rgba(255,255,255,0.02)",
        padding: "20px 22px",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {when && (
            <p style={{ ...labelStyle, color: "#FF4E01", fontSize: 10, marginBottom: 6 }}>{when}</p>
          )}
          {/* Texto de la organización: tal cual, sin uppercase. */}
          <h3>
            <button
              type="button"
              onClick={() => onOpen(talk)}
              className="text-left"
              style={{ ...bodyStyle, color: "#E6EEF2", fontSize: "clamp(14px, 1.3vw, 16px)", lineHeight: 1.35 }}
            >
              {talk.title}
            </button>
          </h3>
        </div>
        <AgendaToggle talkId={talk.id} />
      </div>

      {/* El abstract solo cuando hay ancho para leerlo: en las columnas
          angostas convierte la tarjeta en un muro de texto. */}
      {wide && talk.abstract && (
        <p className="mt-3" style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(13px, 1.2vw, 15px)", lineHeight: 1.6 }}>
          {talk.abstract}
        </p>
      )}

      {(talk.whoText ?? talk.speaker?.name) && (
        <div className="mt-4 flex items-start gap-3">
          {people.length > 0 && (
            <span className="flex shrink-0 -space-x-2">
              {people.slice(0, 3).map((p) => (
                <Link
                  key={p.slug}
                  href={`/speakers/${p.slug}`}
                  aria-label={p.name}
                  className="relative block overflow-hidden rounded-full"
                  style={{ width: 34, height: 34, background: "#2A2929", border: "2px solid #000" }}
                >
                  {p.photoUrl ? (
                    <Image src={p.photoUrl} alt={p.name} fill sizes="34px" style={{ objectFit: "cover" }} />
                  ) : (
                    <span
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ ...labelStyle, color: "rgba(230,238,242,0.3)", fontSize: 13 }}
                    >
                      {p.name.slice(0, 1)}
                    </span>
                  )}
                </Link>
              ))}
            </span>
          )}
          <span
            style={{
              ...labelStyle,
              textTransform: "none",
              color: "#E6EEF2",
              fontSize: "clamp(11px, 1vw, 12px)",
              lineHeight: 1.35,
              alignSelf: "center",
            }}
          >
            {talk.whoText ?? talk.speaker?.name}
          </span>
        </div>
      )}
      {talk.mod && (
        <p className="mt-2" style={{ ...bodyStyle, color: "#A5A8B1", fontSize: 12, fontStyle: "italic" }}>
          MOD: {talk.mod}
        </p>
      )}

      {meta.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          {meta.map((m) => (
            <span key={m} style={{ ...labelStyle, color: "#A5A8B1", fontSize: "clamp(9px, 0.9vw, 10px)" }}>
              {m}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
}
