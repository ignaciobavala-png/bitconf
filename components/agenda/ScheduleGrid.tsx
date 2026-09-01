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
const PX_PER_MIN = 4;

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
const TIME_H = 20;
const TITLE_MT = 6;
const SPEAKER_H = 28;
const META_H = 19;
const LINE_H = 16;

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
  es: { stage: "Escenario", minutes: "min", panel: "Panel", to: "a" },
  en: { stage: "Stage", minutes: "min", panel: "Panel", to: "to" },
} as const;

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
}: {
  day: Day;
  columns: [string, ScheduledTalk[]][];
  lang: "es" | "en";
}) {
  const win = DAY_WINDOW[day];

  // La ventana se estira si alguna charla se sale de ella: si la organización
  // carga algo a las 19:00, tiene que verse, no quedar fuera del contenedor.
  const all = columns.flatMap(([, list]) => list);
  const opens = Math.min(win.opens, ...all.map((k) => k.startMin));
  const closes = Math.max(
    win.closes,
    ...all.map((k) => k.startMin + (k.durationMin ?? 30))
  );

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
          background: "#171616",
          boxShadow: "0 10px 18px -12px #171616",
        }}
      >
        <div aria-hidden />
        {columns.map(([stage]) => {
          const color = stageColor(stage);
          return (
            <div key={stage} className="min-w-0">
              <h2
                className="truncate"
                style={{ ...labelStyle, color, fontSize: "clamp(10px, 0.95vw, 13px)" }}
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
                <GridCard key={k.id} talk={k} stage={stage} opens={opens} lang={lang} />
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
}: {
  talk: ScheduledTalk;
  stage: string;
  opens: number;
  lang: "es" | "en";
}) {
  const t = T[lang];
  const color = stageColor(stage);
  const dur = talk.durationMin ?? 30;
  const height = Math.max(dur * PX_PER_MIN, MIN_CARD_H) - CARD_GAP;

  // Qué entra depende del alto real del bloque, no del gusto: en una charla de
  // 20 minutos el speaker con foto empuja el título fuera de la tarjeta.
  // Qué entra en la tarjeta se decide midiendo, no con umbrales al ojo: en un
  // bloque de 30 min (114px) el título a tres líneas empujaba el nombre del
  // speaker fuera del borde. Se descuenta todo lo que ocupa lugar —padding,
  // franja de hora, márgenes— y recién ahí se reparte lo que sobra.
  const showMeta = height >= 150;

  let free = height - PAD_Y * 2 - TIME_H - TITLE_MT - (showMeta ? META_H : 0);

  // El speaker solo si después de ponerlo quedan al menos dos líneas de
  // título: un título de una línea con la cara del speaker no dice nada.
  const showSpeaker = free - SPEAKER_H >= LINE_H * 2;
  if (showSpeaker) free -= SPEAKER_H;

  const titleLines = Math.max(1, Math.floor(free / LINE_H));

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute inset-x-0 overflow-hidden rounded-xl"
      style={{
        top: (talk.startMin - opens) * PX_PER_MIN,
        height,
        border: "1px solid rgba(230,238,242,0.12)",
        borderLeftWidth: 3,
        borderLeftColor: color,
        // Opaco a propósito: es el mismo valor que rgba(255,255,255,0.025)
        // sobre Alamo, resuelto a un sólido. Con el translúcido, las líneas de
        // media hora se veían A TRAVÉS de la tarjeta y parecían cortarla.
        background: "#1D1C1C",
        padding: "9px 11px",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span style={{ ...labelStyle, color, fontSize: 9.5, whiteSpace: "nowrap" }}>
          {formatMinutes(talk.startMin)} – {formatMinutes(talk.startMin + dur)}
        </span>
        <AgendaToggle talkId={talk.id} />
      </div>

      <h3
        className="mt-1.5"
        style={{
          ...labelStyle,
          color: "#E6EEF2",
          fontSize: "clamp(10.5px, 0.82vw, 12.5px)",
          lineHeight: 1.28,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: titleLines,
          overflow: "hidden",
        }}
      >
        {talk.title}
      </h3>

      {showSpeaker && talk.speaker && (
        <Link
          href={`/speakers/${talk.speaker.slug}`}
          className="group mt-2 flex items-center gap-2"
        >
          <span
            className="relative shrink-0 overflow-hidden rounded-full"
            style={{ width: 20, height: 20, background: "rgba(230,238,242,0.06)" }}
          >
            {talk.speaker.photoUrl ? (
              <Image
                src={talk.speaker.photoUrl}
                alt={talk.speaker.name}
                fill
                sizes="20px"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{ ...labelStyle, color: "rgba(230,238,242,0.3)", fontSize: 9 }}
              >
                {talk.speaker.name.slice(0, 1)}
              </span>
            )}
          </span>
          <span
            className="truncate transition-colors duration-200 group-hover:text-[#ABF760]"
            style={{ ...bodyStyle, color: "#A5A8B1", fontSize: 10.5 }}
          >
            {talk.speaker.name}
          </span>
        </Link>
      )}

      {showMeta && (
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span style={{ ...labelStyle, color: "#5C5F66", fontSize: 9 }}>
            {dur} {t.minutes}
          </span>
          {talk.isPanel && (
            <span style={{ ...labelStyle, color: "#5C5F66", fontSize: 9 }}>{t.panel}</span>
          )}
        </div>
      )}
    </motion.article>
  );
}
