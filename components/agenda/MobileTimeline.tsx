"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { formatMinutes, stageColor } from "@/lib/speakers/schedule";
import AgendaToggle from "./AgendaToggle";
import { stagesOf } from "./TalkDetail";
import type { ScheduledTalk } from "./ScheduleGrid";

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
  es: { now: "Ahora", next: "Próxima", minutes: "min", panel: "Panel" },
  en: { now: "Now", next: "Up next", minutes: "min", panel: "Panel" },
} as const;

type Status = "past" | "live" | "upcoming";

function range(talk: ScheduledTalk): { start: number; end: number } | null {
  const start = talk.startsAt ? Date.parse(talk.startsAt) : NaN;
  if (Number.isNaN(start)) return null;
  return { start, end: start + (talk.durationMin ?? 30) * 60_000 };
}

function statusOf(talk: ScheduledTalk, now: number | null): Status {
  const r = range(talk);
  if (now == null || !r) return "upcoming";
  if (now >= r.end) return "past";
  if (now >= r.start) return "live";
  return "upcoming";
}

/**
 * Agenda de mobile: una sola línea de tiempo del día, mezclando escenarios.
 *
 * Cada charla lleva su escenario como etiqueta (con el color del escenario),
 * porque al ordenar por hora ya no hay columnas que lo digan. La que está en
 * curso y la próxima se marcan; lo que ya pasó se apaga pero sigue ahí.
 *
 * `now` es null en el servidor y en el primer render del cliente: así el HTML
 * prerenderizado es el mismo para todos y la marca de "ya pasó" aparece recién
 * al hidratar, sin mismatch.
 */
export default function MobileTimeline({
  talks,
  now,
  nextStart,
  lang,
  onOpen,
}: {
  talks: ScheduledTalk[];
  now: number | null;
  /** Inicio de la próxima charla del evento (ms), calculado sobre todo el programa. */
  nextStart: number | null;
  lang: "es" | "en";
  onOpen: (talk: ScheduledTalk) => void;
}) {
  const t = T[lang];

  // Por hora de inicio; a igual hora, por escenario.
  const groups = useMemo(() => {
    const sorted = [...talks].sort(
      (a, b) =>
        a.startMin - b.startMin ||
        Number(a.stage.replace(/^s/i, "")) - Number(b.stage.replace(/^s/i, ""))
    );
    const by = new Map<number, ScheduledTalk[]>();
    for (const k of sorted) {
      const list = by.get(k.startMin);
      if (list) list.push(k);
      else by.set(k.startMin, [k]);
    }
    return Array.from(by.entries());
  }, [talks]);

  // Primer grupo que todavía no terminó del todo: a ese se baja el scroll.
  const anchorMin = useMemo(() => {
    if (now == null) return null;
    const hit = groups.find(([, list]) => list.some((k) => statusOf(k, now) !== "past"));
    return hit ? hit[0] : null;
  }, [groups, now]);
  const dayHasPast = now != null && talks.some((k) => statusOf(k, now) === "past");

  // Baja una sola vez por montaje. Solo si el día ya empezó: si todo está por
  // venir, el principio de la lista ES la próxima charla.
  const scrolled = useRef(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrolled.current || !dayHasPast || !anchorRef.current) return;
    scrolled.current = true;
    anchorRef.current.scrollIntoView({ block: "start" });
  }, [dayHasPast, anchorMin]);

  return (
    <div className="mt-8 flex flex-col gap-7">
      {groups.map(([startMin, list]) => {
        const isAnchor = startMin === anchorMin && dayHasPast;
        return (
          <section key={startMin} ref={isAnchor ? anchorRef : undefined} style={{ scrollMarginTop: 96 }}>
            <div className="flex items-center gap-3">
              <span style={{ ...labelStyle, color: "#E6EEF2", fontSize: 20, lineHeight: 1 }}>
                {formatMinutes(startMin)}
              </span>
              <span aria-hidden className="h-px flex-1" style={{ background: "rgba(230,238,242,0.14)" }} />
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {list.map((k) => (
                <TimelineCard
                  key={k.id}
                  talk={k}
                  status={statusOf(k, now)}
                  isNext={nextStart != null && range(k)?.start === nextStart}
                  lang={lang}
                  labels={t}
                  onOpen={onOpen}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TimelineCard({
  talk,
  status,
  isNext,
  lang,
  labels,
  onOpen,
}: {
  talk: ScheduledTalk;
  status: Status;
  isNext: boolean;
  lang: "es" | "en";
  labels: (typeof T)[keyof typeof T];
  onOpen: (talk: ScheduledTalk) => void;
}) {
  const plenary = (talk.span ?? 1) > 1;
  const color = plenary ? "#E6EEF2" : stageColor(talk.stage);
  const past = status === "past";
  const dim = !!talk.dim;
  const live = status === "live";
  const highlight = live ? "#FF4E01" : isNext && status === "upcoming" ? "#ABF760" : null;
  const people = talk.speakers ?? (talk.speaker ? [talk.speaker] : []);
  const who = talk.whoText ?? talk.speaker?.name ?? null;

  return (
    <article
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a,button")) return;
        onOpen(talk);
      }}
      className="cursor-pointer rounded-2xl bg-[#1D1C1C] transition-[background-color,box-shadow] duration-200 hover:opacity-100! hover:bg-[#2A2929] hover:[box-shadow:0_0_0_1px_var(--c),0_10px_28px_-8px_var(--c)]"
      style={{
        ["--c" as string]: highlight ?? color,
        // Borde completo del color del escenario; "en vivo" / "siguiente" lo pisan.
        border: `1.5px solid ${highlight ?? color}`,
        padding: "14px 16px",
        // Lo que ya pasó se apaga, sin esconderse: alguien puede querer leer
        // qué se perdió.
        opacity: dim ? 0.3 : past ? 0.42 : 1,
        filter: past || dim ? "grayscale(0.85)" : undefined,
        transition: "opacity 300ms",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
          {/* Etiqueta de escenario: en la línea de tiempo es lo único que dice dónde es. */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full"
            style={{
              ...labelStyle,
              color,
              fontSize: 9.5,
              padding: "4px 10px",
              border: `1px solid ${color}`,
              whiteSpace: "nowrap",
            }}
          >
            <span aria-hidden className="inline-block rounded-full" style={{ width: 6, height: 6, background: color }} />
            {stagesOf(talk, lang)}
          </span>
          {highlight && (
            <span style={{ ...labelStyle, color: highlight, fontSize: 9.5 }}>
              {live ? labels.now : labels.next}
            </span>
          )}
        </div>
        <AgendaToggle talkId={talk.id} />
      </div>

      <h3 className="mt-2.5">
        <button
          type="button"
          onClick={() => onOpen(talk)}
          className="text-left"
          style={{ ...bodyStyle, fontWeight: 500, color: "#F3F7F9", fontSize: 15, lineHeight: 1.35 }}
        >
          {talk.title}
        </button>
      </h3>

      {who && (
        <div className="mt-3 flex items-center gap-2.5">
          {people.length > 0 && (
            <span className="flex shrink-0 -space-x-2">
              {people.slice(0, 3).map((p) => (
                <span
                  key={p.slug}
                  className="relative block overflow-hidden rounded-full"
                  style={{ width: 26, height: 26, background: "#2A2929", border: "2px solid #1D1C1C" }}
                >
                  {p.photoUrl ? (
                    <Image src={p.photoUrl} alt="" fill sizes="26px" style={{ objectFit: "cover" }} />
                  ) : (
                    <span
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ ...labelStyle, color: "rgba(230,238,242,0.3)", fontSize: 10 }}
                    >
                      {p.name.slice(0, 1)}
                    </span>
                  )}
                </span>
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

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        {talk.durationMin ? (
          <span style={{ ...labelStyle, color: "#6F727A", fontSize: 9 }}>
            {talk.durationMin} {labels.minutes}
          </span>
        ) : null}
        {talk.isPanel && <span style={{ ...labelStyle, color: "#6F727A", fontSize: 9 }}>{labels.panel}</span>}
      </div>
    </article>
  );
}
