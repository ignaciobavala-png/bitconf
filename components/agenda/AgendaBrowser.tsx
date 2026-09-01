"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
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
  PROGRAM_DAYS,
  compareStages,
  eventMinutes,
  isDay,
  stageLabel,
  type Day,
  type ProgramDay,
} from "@/lib/speakers/schedule";
import { demoStartTimes } from "@/lib/speakers/demo";
import AgendaToggle from "./AgendaToggle";
import ScheduleGrid, { type ScheduledTalk } from "./ScheduleGrid";
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

const T = {
  es: {
    allStages: "Todos los escenarios",
    allTopics: "Todos los temas",
    stage: "Escenario",
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

const CHIP_BASE: React.CSSProperties = {
  ...labelStyle,
  fontSize: "clamp(10px, 1vw, 12px)",
  padding: "9px 18px",
  // Dentro de la tira horizontal, sin esto el flex los aplasta en vez de
  // dejarlos salir del viewport.
  flexShrink: 0,
  whiteSpace: "nowrap",
};

/**
 * En mobile los filtros van en una tira que se desliza, no envueltos en varias
 * filas: con 7 escenarios + 9 temas eran diez renglones de chips antes de la
 * primera charla. De `sm` para arriba entran de sobra y se envuelven como
 * siempre.
 *
 * El scroll es del contenedor, no de la página: el ancho es 100% del padre, así
 * que no genera scroll horizontal en el body.
 */
const FILTER_ROW =
  "flex gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible sm:flex-wrap " +
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

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
      stageLabel(k.stage, lang),
      ...k.tags.map((c) => TAG_LABELS[c][lang]),
    ].join(" ")
  );
}

/**
 * La tira de filtros en mobile se desliza, pero un chip cortado justo en el
 * borde no se lee como "hay más": se lee como que eso es todo. El degradé
 * aparece solo cuando queda algo a la derecha, así una fila que entra completa
 * (los dos tabs de día) no se ve recortada de gusto.
 */
function ScrollRow({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, [children]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <div ref={ref} className={FILTER_ROW}>
        {children}
      </div>
      {more && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0"
          style={{ width: 56, background: "linear-gradient(to right, rgba(23,22,22,0), #171616)" }}
        />
      )}
    </div>
  );
}

/** La query no cambia sin navegar, así que no hay a qué suscribirse. */
const noSubscribe = () => () => {};

/**
 * `?demo=1` — ver lib/speakers/demo.ts.
 *
 * Va por `useSyncExternalStore` y no por `useState` + efecto: el servidor
 * renderiza sin la flag y el cliente la lee del navegador, que es exactamente
 * el caso para el que existe este hook. Con un efecto, React avisa (con razón)
 * de la cascada de renders.
 */
function useDemoFlag(): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => new URLSearchParams(window.location.search).get("demo") === "1",
    () => false
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

function chipStyle(on: boolean, accent: string): React.CSSProperties {
  return {
    ...CHIP_BASE,
    color: on ? "#171616" : "#A5A8B1",
    background: on ? accent : "transparent",
    border: `1px solid ${on ? accent : "rgba(230,238,242,0.18)"}`,
  };
}

export default function AgendaBrowser({ talks }: { talks: AgendaTalk[] }) {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  // El día arranca en el primero que tenga algo cargado, no en oct30 fijo: si
  // la organización todavía no confirmó nada del viernes, entrar a una pantalla
  // vacía parece un error del sitio.
  const daysWithContent = useMemo(
    () => DAYS.filter((d) => talks.some((k) => k.day === d)),
    [talks]
  );
  const [day, setDay] = useState<ProgramDay>(daysWithContent[0] ?? DAYS[0]);

  // El jueves y el domingo no tienen escenarios: son jornadas de programa
  // propio (Open Fest y Closing Day), y la planilla ni siquiera puede
  // referenciarlas. Cuando el día elegido es uno de esos, la página muestra
  // el programa en vez de filtros que no filtrarían nada.
  const dayInfo = PROGRAM[day];
  const [stage, setStage] = useState<string | null>(null);
  const [tag, setTag] = useState<CanonicalTag | null>(null);
  const [query, setQuery] = useState("");

  const demo = useDemoFlag();
  const wideScreen = useWideScreen();
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

  const filtered = useMemo(
    () =>
      ofDay.filter((k) => {
        if (stage && k.stage !== stage) return false;
        if (tag && !k.tags.includes(tag)) return false;
        if (needle && !(index.get(k.id) ?? "").includes(needle)) return false;
        return true;
      }),
    [ofDay, stage, tag, needle, index]
  );

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

  // Hora de arranque de cada charla: la real de la planilla, o la de ejemplo
  // cuando se pidió la demo. Si una charla no aparece en este mapa, es que no
  // tiene horario y no se puede ubicar en la grilla.
  const startTimes = useMemo(() => {
    if (demo && isDay(day)) return demoStartTimes(talks, day);
    const map = new Map<string, number>();
    for (const k of talks) {
      const m = k.startsAt ? eventMinutes(k.startsAt) : null;
      if (m != null) map.set(k.id, m);
    }
    return map;
  }, [talks, demo, day]);

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

  const showGrid = hasSchedule && wideScreen && view === "grid" && isDay(day);

  // Si el día que estaba elegido se queda sin escenario seleccionado válido
  // (pasa al cambiar de día con un filtro puesto), se suelta el filtro.
  function selectDay(next: ProgramDay) {
    setDay(next);
    setStage(null);
  }

  return (
    <div className="w-full">
      {/* Las cuatro jornadas del programa, no solo las dos con charlas: el
          jueves y el domingo son parte de la agenda aunque no tengan grilla. */}
      <ScrollRow>
        {PROGRAM_DAYS.map((d) => {
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
      </ScrollRow>

      {/* Horario y acceso de la jornada elegida: cambian día a día (el jueves
          y el domingo son solo Experience) y contestan la primera pregunta. */}
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

      {dayInfo.program ? (
        <ProgramDayBlock info={dayInfo.program} lang={lang} />
      ) : (
      <>
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

      {/* Escenarios */}
      <ScrollRow className="mt-6">
        <button
          type="button"
          onClick={() => setStage(null)}
          className="rounded-full transition-colors duration-200"
          style={chipStyle(stage === null, "#FF4E01")}
        >
          {t.allStages}
        </button>
        {stagesOfDay.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStage(stage === s ? null : s)}
            className="rounded-full transition-colors duration-200"
            style={chipStyle(stage === s, "#FF4E01")}
          >
            {stageLabel(s, lang)}
          </button>
        ))}
      </ScrollRow>

      {/* Temas */}
      {tagsOfDay.length > 0 && (
        <ScrollRow className="mt-3">
          <button
            type="button"
            onClick={() => setTag(null)}
            className="rounded-full transition-colors duration-200"
            style={chipStyle(tag === null, "#ABF760")}
          >
            {t.allTopics}
          </button>
          {tagsOfDay.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setTag(tag === c ? null : c)}
              className="rounded-full transition-colors duration-200"
              style={chipStyle(tag === c, "#ABF760")}
            >
              {TAG_LABELS[c][lang]}
            </button>
          ))}
        </ScrollRow>
      )}

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
      {demo && showGrid && (
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
          <ScheduleGrid day={day as Day} columns={scheduled} lang={lang} />
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
                <h2 style={{ ...labelStyle, color: "#FF4E01", fontSize: "clamp(13px, 1.4vw, 17px)" }}>
                  {stageLabel(s, lang)}
                </h2>
                <span style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(10px, 1vw, 12px)" }}>
                  {t.talksIn(list.length)}
                </span>
              </header>

              <div className="mt-4 flex flex-col gap-4">
                {list.map((k, i) => (
                  <TalkCard key={k.id} talk={k} index={col * 2 + i} lang={lang} wide={!!stage} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {day === HODLWEEN.day && <HodlweenBlock lang={lang} />}
      </>
      )}
    </div>
  );
}

/**
 * Jornada sin grilla: el jueves y el domingo. No hay escenarios que elegir, así
 * que en vez de filtros vacíos se muestra qué pasa ese día.
 */
function ProgramDayBlock({
  info,
  lang,
}: {
  info: NonNullable<(typeof PROGRAM)[ProgramDay]["program"]>;
  lang: "es" | "en";
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-8 rounded-2xl"
      style={{
        border: "1px solid rgba(230,238,242,0.14)",
        background: "rgba(255,255,255,0.02)",
        padding: "26px 28px",
        maxWidth: "62ch",
      }}
    >
      <h2 style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(16px, 1.9vw, 24px)", lineHeight: 1.2 }}>
        {info.title[lang]}
      </h2>
      <p
        className="mt-3"
        style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(13px, 1.25vw, 16px)", lineHeight: 1.6 }}
      >
        {info.lead[lang]}
      </p>
      <ul className="mt-6 flex flex-col gap-3">
        {info.items.map((it) => (
          <li key={it.en} className="flex items-baseline gap-3">
            <span aria-hidden style={{ color: "#FF4E01", fontSize: 11, flexShrink: 0 }}>
              ●
            </span>
            <span style={{ ...bodyStyle, color: "#E6EEF2", fontSize: "clamp(13px, 1.2vw, 15px)", lineHeight: 1.5 }}>
              {it[lang]}
            </span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}

/** Evento transversal del sábado: va al pie del día, fuera de los escenarios. */
function HodlweenBlock({ lang }: { lang: "es" | "en" }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-10 rounded-2xl"
      style={{
        border: "1px solid rgba(255,78,1,0.45)",
        background: "rgba(255,78,1,0.06)",
        padding: "24px 26px",
      }}
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <span style={{ ...labelStyle, color: "#FF4E01", fontSize: "clamp(10px, 1vw, 12px)" }}>
          {HODLWEEN.tag[lang]}
        </span>
        <span style={{ ...bodyStyle, color: "#E6EEF2", fontSize: "clamp(12px, 1.15vw, 14px)" }}>
          {HODLWEEN.hours[lang]}
        </span>
      </div>
      <h2
        className="mt-3"
        style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(20px, 2.6vw, 34px)", lineHeight: 1.1 }}
      >
        {HODLWEEN.title[lang]}
      </h2>
      <p
        className="mt-3"
        style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(13px, 1.25vw, 16px)", lineHeight: 1.6, maxWidth: "52ch" }}
      >
        {HODLWEEN.lead[lang]}
      </p>
    </motion.section>
  );
}

function TalkCard({
  talk,
  index,
  lang,
  wide,
}: {
  talk: AgendaTalk;
  index: number;
  lang: "es" | "en";
  wide: boolean;
}) {
  const t = T[lang];

  const meta = [
    talk.durationMin ? `${talk.durationMin} ${t.minutes}` : null,
    talk.isPanel ? t.panel : null,
    talk.level ? (t.level[talk.level] ?? talk.level) : null,
  ].filter(Boolean) as string[];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 10) * 0.04, ease: "easeOut" }}
      className="rounded-2xl"
      style={{
        border: "1px solid rgba(230,238,242,0.14)",
        background: "rgba(255,255,255,0.02)",
        padding: "20px 22px",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(13px, 1.3vw, 16px)", lineHeight: 1.3 }}>
          {talk.title}
        </h3>
        <AgendaToggle talkId={talk.id} />
      </div>

      {/* El abstract solo cuando hay ancho para leerlo: en las columnas
          angostas convierte la tarjeta en un muro de texto. */}
      {wide && talk.abstract && (
        <p className="mt-3" style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(13px, 1.2vw, 15px)", lineHeight: 1.6 }}>
          {talk.abstract}
        </p>
      )}

      {talk.speaker && (
        <Link
          href={`/speakers/${talk.speaker.slug}`}
          className="group mt-4 flex items-center gap-3"
        >
          <span
            className="relative shrink-0 overflow-hidden rounded-full"
            style={{ width: 34, height: 34, background: "rgba(230,238,242,0.06)" }}
          >
            {talk.speaker.photoUrl ? (
              <Image
                src={talk.speaker.photoUrl}
                alt={talk.speaker.name}
                fill
                sizes="34px"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{ ...labelStyle, color: "rgba(230,238,242,0.3)", fontSize: 13 }}
              >
                {talk.speaker.name.slice(0, 1)}
              </span>
            )}
          </span>
          <span
            className="transition-colors duration-200 group-hover:text-[#ABF760]"
            style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(10px, 1vw, 12px)", lineHeight: 1.25 }}
          >
            {talk.speaker.name}
          </span>
        </Link>
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
