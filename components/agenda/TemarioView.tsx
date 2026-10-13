"use client";

import { useState } from "react";
import { useLangStore } from "@/lib/store/lang";
import { DAY_SHORT, HODLWEEN, formatMinutes, stageColor } from "@/lib/speakers/schedule";
import {
  TRACKS,
  TRACK_NAMES,
  sessionsOf,
  tracksOf,
  type Session,
  type TemarioDay,
  type TrackId,
} from "@/lib/agenda/temario";

const DAYS: TemarioDay[] = ["oct30", "oct31"];

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

/** Las plenarias cruzan columnas, así que no tienen color de escenario. */
const PLENARY = "#E6EEF2";

const AXIS_W = 58;
/** El navbar es fixed: el header de columnas se pega justo debajo. */
const NAV_OFFSET = 76;
/** Alto mínimo de una franja de 30 min; crece si el texto lo pide. */
const SLOT_MIN_H = 112;

const trackColor = (id: TrackId) => stageColor(`s${TRACKS.indexOf(id) + 1}`);
const cardColor = (s: Session) => (s.span > 1 ? PLENARY : trackColor(s.track));

const T = {
  es: {
    all: "Todos",
    plenary: "Plenaria",
    mod: "MOD",
    min: "min",
    empty: "No hay sesiones en ese escenario este día.",
    note: "Temario en armado: los horarios y las charlas pueden cambiar.",
  },
  en: {
    all: "All",
    plenary: "Plenary",
    mod: "MOD",
    min: "min",
    empty: "No sessions on that stage this day.",
    note: "Programme in progress: times and talks may change.",
  },
} as const;

export default function TemarioView() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];
  const [day, setDay] = useState<TemarioDay>("oct30");
  const [track, setTrack] = useState<TrackId | null>(null);

  const sessions = sessionsOf(day);
  const listed = track ? sessions.filter((s) => tracksOf(s).includes(track)) : sessions;

  return (
    <div className="w-full">
      <div className="flex gap-2 sm:gap-3">
        {DAYS.map((d) => {
          const on = d === day;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setDay(d)}
              aria-pressed={on}
              className="rounded-full transition-colors duration-200"
              style={{
                ...labelStyle,
                fontSize: "clamp(10px, 1vw, 12px)",
                padding: "9px 18px",
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

      <p className="mt-4" style={{ ...bodyStyle, color: "#A5A8B1", fontSize: 13 }}>
        {t.note}
      </p>

      {/* Desktop: la grilla del boceto, las seis columnas a la vez. */}
      <div className="mt-8 hidden lg:block">
        <Grid sessions={sessions} t={t} />
      </div>

      {/* Mobile: seis columnas no entran, así que va la lista con el filtro. */}
      <div className="mt-8 lg:hidden">
        <div
          className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
        >
          {[null, ...TRACKS].map((id) => {
            const on = id === track;
            const color = id ? trackColor(id) : "#E6EEF2";
            return (
              <button
                key={id ?? "all"}
                type="button"
                onClick={() => setTrack(id)}
                aria-pressed={on}
                className="shrink-0 rounded-full transition-colors duration-200"
                style={{
                  ...labelStyle,
                  fontSize: 10,
                  padding: "8px 14px",
                  whiteSpace: "nowrap",
                  color: on ? "#171616" : color,
                  background: on ? color : "transparent",
                  border: `1px solid ${on ? color : "rgba(230,238,242,0.25)"}`,
                }}
              >
                {id ? TRACK_NAMES[id] : t.all}
              </button>
            );
          })}
        </div>

        <ul className="mt-6 flex flex-col gap-3">
          {listed.map((s) => (
            <li key={s.id}>
              <Card s={s} t={t} withTime />
            </li>
          ))}
          {listed.length === 0 && (
            <li style={{ ...bodyStyle, color: "#A5A8B1", fontSize: 14 }}>{t.empty}</li>
          )}
        </ul>
      </div>

      {day === HODLWEEN.day && (
        <div
          className="mt-8 rounded-2xl"
          style={{ border: "1px solid rgba(255,78,1,0.5)", padding: "20px 24px" }}
        >
          <p style={{ ...labelStyle, color: "#FF4E01", fontSize: 10 }}>{HODLWEEN.tag[lang]}</p>
          <p className="mt-1" style={{ ...labelStyle, color: "#E6EEF2", fontSize: 20 }}>
            {HODLWEEN.title[lang]} · {HODLWEEN.hours[lang]}
          </p>
          <p className="mt-2" style={{ ...bodyStyle, color: "#A5A8B1", fontSize: 14 }}>
            {HODLWEEN.lead[lang]}
          </p>
        </div>
      )}
    </div>
  );
}

function Grid({ sessions, t }: { sessions: Session[]; t: (typeof T)["es"] | (typeof T)["en"] }) {
  const opens = Math.min(...sessions.map((s) => s.start));
  const closes = Math.max(...sessions.map((s) => s.start + s.dur));
  const rows = (closes - opens) / 30;
  const template = `${AXIS_W}px repeat(${TRACKS.length}, minmax(0, 1fr))`;

  return (
    <div>
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
        {TRACKS.map((id) => (
          <div key={id} className="min-w-0">
            <h2
              className="truncate"
              style={{ ...labelStyle, color: trackColor(id), fontSize: "clamp(10px, 0.95vw, 13px)" }}
            >
              {TRACK_NAMES[id]}
            </h2>
            <div className="mt-2" style={{ height: 3, background: trackColor(id), borderRadius: 2 }} />
          </div>
        ))}
      </div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: template,
          gridTemplateRows: `repeat(${rows}, minmax(${SLOT_MIN_H}px, auto))`,
        }}
      >
        {Array.from({ length: rows }, (_, i) => {
          const m = opens + i * 30;
          return (
            <span
              key={m}
              style={{
                gridColumn: 1,
                gridRow: i + 1,
                ...bodyStyle,
                color: m % 60 === 0 ? "#A5A8B1" : "#5C5F66",
                fontSize: m % 60 === 0 ? 12 : 11,
                paddingTop: 10,
              }}
            >
              {formatMinutes(m)}
            </span>
          );
        })}

        {sessions.map((s) => {
          const row = (s.start - opens) / 30 + 1;
          const col = TRACKS.indexOf(s.track) + 2;
          return (
            <div
              key={s.id}
              className="min-w-0"
              style={{
                gridColumn: `${col} / span ${s.span}`,
                gridRow: `${row} / span ${s.dur / 30}`,
              }}
            >
              <Card s={s} t={t} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Card({
  s,
  t,
  withTime = false,
}: {
  s: Session;
  t: (typeof T)["es"] | (typeof T)["en"];
  withTime?: boolean;
}) {
  const color = cardColor(s);
  const names = tracksOf(s)
    .map((id) => TRACK_NAMES[id])
    .join(" + ");

  return (
    <article
      className="h-full rounded-xl"
      style={{
        border: "1px solid rgba(230,238,242,0.12)",
        borderLeftWidth: 3,
        borderLeftColor: color,
        background: "#1D1C1C",
        padding: "10px 12px",
      }}
    >
      {withTime && (
        <p style={{ ...labelStyle, color, fontSize: 9.5 }}>
          {formatMinutes(s.start)} – {formatMinutes(s.start + s.dur)} · {names}
        </p>
      )}
      {!withTime && s.span > 1 && (
        <p style={{ ...labelStyle, color, fontSize: 9 }}>{t.plenary}</p>
      )}

      {/* Los textos son de la organización: se muestran tal cual, sin
          capitalize ni uppercase. */}
      <h3
        className={withTime || s.span > 1 ? "mt-1.5" : ""}
        style={{ ...bodyStyle, color: "#E6EEF2", fontSize: "clamp(11.5px, 0.9vw, 13.5px)", lineHeight: 1.35 }}
      >
        {s.title}
      </h3>

      {s.who && (
        <p
          className="mt-2"
          style={{ ...labelStyle, textTransform: "none", color: "#A5A8B1", fontSize: 11, lineHeight: 1.4 }}
        >
          {s.who}
        </p>
      )}
      {s.mod && (
        <p className="mt-1" style={{ ...bodyStyle, color: "#A5A8B1", fontSize: 11, fontStyle: "italic" }}>
          {t.mod}: {s.mod}
        </p>
      )}
    </article>
  );
}
