"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DAY_WINDOW,
  formatMinutes,
  stageColor,
  stageLabel,
  type Day,
} from "@/lib/speakers/schedule";
import AgendaToggle from "./AgendaToggle";
import type { AgendaTalk } from "@/lib/speakers/queries";

/** Una charla que ya tiene hora: la grilla no sabe dibujar las que no la tienen. */
export type ScheduledTalk = AgendaTalk & { startMin: number };

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

/**
 * Escala de la grilla.
 *
 * 4px por minuto deja una charla de 30 min en 120px de alto: entra el título en
 * dos líneas más el speaker. Con la jornada de 09:30 a 18:00 (510 min) la
 * columna mide ~2040px, o sea que el día se recorre scrolleando en vertical.
 * Eso es esperado: lo que el pedido descarta es el scroll HORIZONTAL, para que
 * los siete escenarios se vean de una sola mirada.
 */
const PX_PER_MIN = 5.5;

/**
 * Piso de altura para que una charla corta siga siendo legible. Con las
 * duraciones reales (mínimo 20 min = 80px) nunca se activa; está para que una
 * de 10 min no quede en una banda de 40px ilegible. Al ser menor que el bloque
 * más chico posible, no puede hacer que dos tarjetas se pisen.
 */
const MIN_CARD_H = 64;

/** Separación visual entre una tarjeta y la que arranca justo después. */
const CARD_GAP = 6;

// Medidas del interior de la tarjeta, para repartir el alto disponible.
const PAD_Y = 9;
const TOGGLE_H = 32; // alto de la fila hora + botón de agenda
const COMPACT_BELOW = 100;
const TITLE_MT = 6;
const SPEAKER_H = 42;
const META_H = 19;
const LINE_H = 20;

/** Ancho del eje. Entra "09:30" a 11px sin cortarse. */
const AXIS_W = 58;

/**
 * Aire arriba del cuerpo. Las etiquetas del eje van centradas en su línea
 * (`translateY(-50%)`), así que la primera quedaba cortada a la mitad contra
 * el header sticky.
 */
const TOP_PAD = 14;

/** El navbar es fixed: el header de columnas se pega justo debajo. */
const NAV_OFFSET = 76;

const T = {
  es: { stage: "Escenario", minutes: "min", panel: "Panel", plenary: "Plenaria", to: "a" },
  en: { stage: "Stage", minutes: "min", panel: "Panel", plenary: "Plenary", to: "to" },
} as const;

/** Colchón antes de la primera charla y después de la última. */
const WINDOW_PAD = 30;

const floor30 = (m: number) => Math.floor(m / 30) * 30;
const ceil30 = (m: number) => Math.ceil(m / 30) * 30;

/** Marcas del eje: cada 30 minutos, de la apertura al cierre. */
function ticks(opens: number, closes: number): number[] {
  const out: number[] = [];
  for (let m = Math.ceil(opens / 30) * 30; m <= closes; m += 30) out.push(m);
  return out;
}

export default function ScheduleGrid({
  day,
  columns,
  lang,
  onOpen,
}: {
  day: Day;
  columns: [string, ScheduledTalk[]][];
  lang: "es" | "en";
  onOpen: (talk: ScheduledTalk) => void;
}) {
  const win = DAY_WINDOW[day];

  // La ventana la fija el contenido, no el horario nominal de la jornada.
  //
  // `DAY_WINDOW` dice 09:30-18:00, pero mientras el programa esté a medio
  // cargar el día real termina mucho antes: con lo de hoy, a las 15:00. Fijar
  // el cierre en 18:00 dejaba 3 horas de grilla vacía — 720px de scroll que no
  // muestran nada. La ventana se recorta a la primera y la última charla (con
  // media hora de colchón para que el bloque no quede pegado al borde) y
  // `DAY_WINDOW` pasa a ser un techo: nunca la agranda de más, pero tampoco la
  // achica si la organización carga algo a las 19:00 — ahí sigue estirándose
  // para afuera, que es lo que hacía antes.
  const all = columns.flatMap(([, list]) => list);
  const starts = all.map((k) => k.startMin);
  const ends = all.map((k) => k.startMin + (k.durationMin ?? 30));
  const first = starts.length ? Math.min(...starts) : win.opens;
  const last = ends.length ? Math.max(...ends) : win.closes;

  // Redondeado a la media hora para que el eje arranque y termine en una marca.
  const opens = floor30(Math.min(first, Math.max(win.opens, first - WINDOW_PAD)));
  const closes = ceil30(Math.max(last, Math.min(win.closes, last + WINDOW_PAD)));

  const totalPx = (closes - opens) * PX_PER_MIN;
  const marks = ticks(opens, closes);

  const template = `${AXIS_W}px repeat(${columns.length}, minmax(0, 1fr))`;

  return (
    <div className="w-full">
      {/* Header de escenarios — sticky, para no perder de vista en qué columna
          se está mirando cuando el día se recorre entero. */}
      <div
        className="sticky z-20 grid gap-2 pb-3"
        style={{
          top: NAV_OFFSET,
          gridTemplateColumns: template,
          background: "#000",
          boxShadow: "0 10px 18px -12px #000",
        }}
      >
        <div aria-hidden />
        {columns.map(([stage]) => {
          const color = stageColor(stage);
          return (
            <div key={stage} className="min-w-0">
              <h2
                className="truncate"
                style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(10px, 0.95vw, 13px)" }}
                title={stageLabel(stage, lang)}
              >
                {stageLabel(stage, lang)}
              </h2>
              <div className="mt-2" style={{ height: 3, background: color, borderRadius: 2 }} />
            </div>
          );
        })}
      </div>

      <div className="relative" style={{ paddingTop: TOP_PAD }}>
        {/* Líneas de media hora, por detrás de todo y solo sobre las columnas
            (arrancan después del eje). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0"
          style={{ left: AXIS_W, top: TOP_PAD }}
        >
          {marks.map((m) => (
            <div
              key={m}
              className="absolute inset-x-0"
              style={{
                top: (m - opens) * PX_PER_MIN,
                height: 1,
                background: m % 60 === 0 ? "rgba(230,238,242,0.13)" : "rgba(230,238,242,0.06)",
              }}
            />
          ))}
        </div>

        <div className="grid gap-2" style={{ gridTemplateColumns: template, height: totalPx }}>
          {/* Eje horario */}
          <div className="relative">
            {marks.map((m) => (
              <span
                key={m}
                className="absolute right-3"
                style={{
                  top: (m - opens) * PX_PER_MIN,
                  transform: "translateY(-50%)",
                  ...bodyStyle,
                  color: m % 60 === 0 ? "#A5A8B1" : "#5C5F66",
                  fontSize: m % 60 === 0 ? 11 : 10,
                  whiteSpace: "nowrap",
                }}
              >
                {formatMinutes(m)}
              </span>
            ))}
          </div>

          {columns.map(([stage, list]) => (
            <div key={stage} className="relative min-w-0">
              {list.map((k) => (
                <GridCard key={k.id} talk={k} stage={stage} opens={opens} lang={lang} onOpen={onOpen} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GridCard({
  talk,
  stage,
  opens,
  lang,
  onOpen,
}: {
  talk: ScheduledTalk;
  stage: string;
  opens: number;
  lang: "es" | "en";
  onOpen: (talk: ScheduledTalk) => void;
}) {
  const t = T[lang];
  const plenary = (talk.span ?? 1) > 1;
  // Las plenarias cruzan columnas, así que no tienen color de escenario.
  const color = plenary ? "#E6EEF2" : stageColor(stage);
  const dur = talk.durationMin ?? 30;
  const height = Math.max(dur * PX_PER_MIN, MIN_CARD_H) - CARD_GAP;

  // Los speakers: el texto de la organización, literal, y si se pudo cruzar con
  // alguien publicado, su foto y link. Las charlas que vienen de la base no
  // traen `whoText` y caen al nombre del speaker.
  const who = talk.whoText ?? talk.speaker?.name ?? null;
  const people = talk.speakers ?? (talk.speaker ? [talk.speaker] : []);

  // Qué entra en la tarjeta se decide midiendo, no con umbrales al ojo: se
  // descuenta todo lo que ocupa lugar —padding, franja de hora, márgenes— y
  // recién ahí se reparte lo que sobra.
  //
  // Las tarjetas de 15 min quedan en ~76px: con el padding y el botón de
  // agenda de 32px casi no sobraba para el título. En modo compacto todo se
  // achica (padding, botón, interlineado) para que el título entre en dos líneas.
  const compact = height < COMPACT_BELOW;
  const padY = compact ? 6 : PAD_Y;
  const rowH = compact ? 26 : TOGGLE_H;
  const titleMt = compact ? 2 : TITLE_MT;
  const lineH = compact ? 17 : LINE_H;
  const showMeta = height >= 190;
  let free = height - padY * 2 - rowH - titleMt - (showMeta ? META_H : 0);

  // Los nombres solo si después de ponerlos quedan al menos dos líneas de
  // título: un título de una línea con los nombres no dice nada.
  const showWho = !compact && !!who && free - SPEAKER_H >= lineH * 2;
  if (showWho) free -= SPEAKER_H;

  const titleLines = Math.max(1, Math.floor(free / lineH));

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: talk.dim ? 0.3 : 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a,button")) return;
        onOpen(talk);
      }}
      className="absolute left-0 cursor-pointer overflow-hidden rounded-xl bg-[#1D1C1C] transition-[background-color,box-shadow] duration-200 hover:z-[5]! hover:opacity-100! hover:bg-[#2A2929] hover:[box-shadow:0_0_0_1px_var(--c),0_10px_28px_-8px_var(--c)]"
      style={{
        top: (talk.startMin - opens) * PX_PER_MIN,
        height,
        // Una plenaria ocupa su columna más las siguientes y los huecos entre
        // ellas (gap-2 = 0.5rem). Pisa la columna vecina, que en esa franja
        // está vacía por construcción del temario.
        width: plenary
          ? `calc(${(talk.span ?? 1) * 100}% + ${((talk.span ?? 1) - 1) * 0.5}rem)`
          : "100%",
        zIndex: plenary ? 2 : 1,
        // Borde completo del color del escenario: individualiza cada tarjeta.
        border: `1.5px solid ${color}`,
        // Opaco a propósito (fondo en la clase, para poder aclararlo en hover):
        // con el translúcido, las líneas de media hora se veían A TRAVÉS de la
        // tarjeta y parecían cortarla.
        ["--c" as string]: color,
        filter: talk.dim ? "grayscale(0.8)" : undefined,
        padding: compact ? "6px 10px" : "9px 11px",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span style={{ ...labelStyle, color, fontSize: 10.5, whiteSpace: "nowrap", lineHeight: `${rowH}px` }}>
          {formatMinutes(talk.startMin)} – {formatMinutes(talk.startMin + dur)}
          {plenary && ` · ${t.plenary}`}
        </span>
        <AgendaToggle talkId={talk.id} size={compact ? 26 : 32} />
      </div>

      {/* El texto de la organización se muestra tal cual: sin uppercase ni
          capitalize. `title` deja leer completo lo que el clamp recorta. */}
      <h3
        className={compact ? "mt-0.5" : "mt-1.5"}
        title={talk.title}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(talk);
          }
        }}
        style={{
          ...bodyStyle,
          // Peso 500 y hasta 15px: con ~100 charlas por día el título es lo
          // que tiene que ganarle al resto de la tarjeta. La altura de la
          // tarjeta no cambia (sale de la duración); `LINE_H` reparte cuántas
          // líneas entran.
          fontWeight: 500,
          color: "#F3F7F9",
          fontSize: "clamp(13px, 1.02vw, 15px)",
          lineHeight: `${lineH}px`,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: titleLines,
          overflow: "hidden",
        }}
      >
        {talk.title}
      </h3>

      {showWho && who && (
        <div className="mt-2 flex items-start gap-2" title={who}>
          {people.length > 0 && (
            <span className="flex shrink-0 -space-x-1.5 pt-0.5">
              {people.slice(0, 3).map((p) => (
                <Link
                  key={p.slug}
                  href={`/speakers/${p.slug}`}
                  aria-label={p.name}
                  className="relative block overflow-hidden rounded-full"
                  style={{
                    width: 20,
                    height: 20,
                    background: "#2A2929",
                    border: "1.5px solid #1D1C1C",
                  }}
                >
                  {p.photoUrl ? (
                    <Image
                      src={p.photoUrl}
                      alt={p.name}
                      fill
                      sizes="20px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <span
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ ...labelStyle, color: "rgba(230,238,242,0.3)", fontSize: 9 }}
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
              color: "#A5A8B1",
              fontSize: 11.5,
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {who}
          </span>
        </div>
      )}

      {showMeta && (
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span style={{ ...labelStyle, color: "#5C5F66", fontSize: 9 }}>
            {dur} {t.minutes}
          </span>
          {talk.mod && (
            <span style={{ ...labelStyle, textTransform: "none", color: "#5C5F66", fontSize: 9 }}>
              MOD: {talk.mod}
            </span>
          )}
          {talk.isPanel && (
            <span style={{ ...labelStyle, color: "#5C5F66", fontSize: 9 }}>{t.panel}</span>
          )}
        </div>
      )}
    </motion.article>
  );
}
