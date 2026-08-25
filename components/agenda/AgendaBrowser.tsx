"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLangStore } from "@/lib/store/lang";
import { CANONICAL_TAGS, TAG_LABELS, type CanonicalTag } from "@/lib/speakers/tags";
import { DAYS, DAY_SHORT, compareStages, stageLabel, type Day } from "@/lib/speakers/schedule";
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
    count: (n: number) => `${n} ${n === 1 ? "charla" : "charlas"}`,
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
    count: (n: number) => `${n} ${n === 1 ? "talk" : "talks"}`,
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
  const [day, setDay] = useState<Day>(daysWithContent[0] ?? DAYS[0]);
  const [stage, setStage] = useState<string | null>(null);
  const [tag, setTag] = useState<CanonicalTag | null>(null);

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
        return true;
      }),
    [ofDay, stage, tag]
  );

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

  // Si el día que estaba elegido se queda sin escenario seleccionado válido
  // (pasa al cambiar de día con un filtro puesto), se suelta el filtro.
  function selectDay(next: Day) {
    setDay(next);
    setStage(null);
  }

  return (
    <div className="w-full">
      {/* Días — son dos, así que van como tabs y no como selector */}
      <div className={FILTER_ROW}>
        {daysWithContent.map((d) => {
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

      {/* Escenarios */}
      <div className={`mt-6 ${FILTER_ROW}`}>
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
      </div>

      {/* Temas */}
      {tagsOfDay.length > 0 && (
        <div className={`mt-3 ${FILTER_ROW}`}>
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
        </div>
      )}

      <p className="mt-6" style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(12px, 1.1vw, 14px)" }}>
        {t.count(filtered.length)}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-start gap-4">
          <p style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(14px, 1.4vw, 18px)" }}>{t.empty}</p>
          <button
            type="button"
            onClick={() => {
              setStage(null);
              setTag(null);
            }}
            className="rounded-full transition-opacity duration-200 hover:opacity-80"
            style={{ ...labelStyle, color: "#171616", background: "#ABF760", fontSize: "clamp(11px, 1.05vw, 13px)", padding: "11px 22px" }}
          >
            {t.clear}
          </button>
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
    </div>
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
      <h3 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(13px, 1.3vw, 16px)", lineHeight: 1.3 }}>
        {talk.title}
      </h3>

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
