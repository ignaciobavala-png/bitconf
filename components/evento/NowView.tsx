"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAgendaStore } from "@/lib/store/agenda";
import { useLangStore, type Lang } from "@/lib/store/lang";
import {
  DAY_LABELS,
  EVENT_TZ,
  compareStages,
  formatMinutes,
  isDay,
  stageLabel,
  type Day,
} from "@/lib/speakers/schedule";
import type { AgendaTalk } from "@/lib/speakers/queries";

// Paleta oficial: Brote (en vivo / agregar), Orange 021 C (lo que viene),
// Almico (lo tuyo), Lactica (texto).
const GREEN = "#ABF760";
const ORANGE = "#FF4E01";
const AMBER = "#FFAB0B";
const TEXT = "#E6EEF2";
const MUTED = "#A5A8B1";
const CARD = "#1D1C1C";

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
    title: "Ahora",
    live: "En vivo",
    endsIn: (m: string) => `termina en ${m}`,
    yourNext: "Tu próxima charla",
    yourLive: "Estás en esta charla",
    soon: "Por venir",
    soonSub: "Lo que arranca primero",
    stages: "Por escenario",
    nothing: "Sin charlas ahora",
    nextUp: "Sigue",
    all: "Todos",
    mine: "Mi agenda",
    mineEmpty: "No elegiste charlas para hoy todavía.",
    nudgeTitle: "Armá tu recorrido",
    nudgeBody: "Tocá + en las charlas que quieras ver y las vas a tener acá, con el aviso de cuánto falta.",
    nudgeCta: "Ver la agenda",
    before: "El evento todavía no empezó",
    beforeSub: "Estas son las primeras charlas.",
    after: "Terminaron las charlas de hoy",
    afterSub: "Mañana seguimos.",
    add: "Agregar a mi agenda",
    remove: "Sacar de mi agenda",
    simulated: "Hora simulada",
    now: "ahora",
    inMin: (m: string) => `en ${m}`,
    min: "min",
    stage: "Escenario",
  },
  en: {
    title: "Now",
    live: "Live",
    endsIn: (m: string) => `ends in ${m}`,
    yourNext: "Your next talk",
    yourLive: "You're in this talk",
    soon: "Coming up",
    soonSub: "What starts first",
    stages: "By stage",
    nothing: "No talks right now",
    nextUp: "Up next",
    all: "All",
    mine: "My agenda",
    mineEmpty: "You haven't picked talks for today yet.",
    nudgeTitle: "Plan your route",
    nudgeBody: "Tap + on the talks you want to see and they'll show up here with a countdown.",
    nudgeCta: "See the agenda",
    before: "The event hasn't started yet",
    beforeSub: "These are the first talks.",
    after: "Today's talks are over",
    afterSub: "See you tomorrow.",
    add: "Add to my agenda",
    remove: "Remove from my agenda",
    simulated: "Simulated time",
    now: "now",
    inMin: (m: string) => `in ${m}`,
    min: "min",
    stage: "Stage",
  },
};

type TT = (typeof T)[Lang];

const startMs = (x: AgendaTalk) => new Date(x.startsAt!).getTime();
const endMs = (x: AgendaTalk) => startMs(x) + (x.durationMin ?? 30) * 60000;

/** Parte de un tiempo largo: días y horas restantes (las horas pueden ser 0). */
function dayParts(min: number, lang: Lang): { days: string; hours: string | null } {
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const dayWord = lang === "es" ? (d === 1 ? "día" : "días") : d === 1 ? "day" : "days";
  return { days: `${d} ${dayWord}`, hours: h > 0 ? `${h} h` : null };
}

/** 7 → "7 min", 65 → "1 h 05", 3800 → "2 días 15 h". Más de un día nunca se dice en horas. */
function spanL(lang: Lang, min: number): string {
  if (min >= 1440) {
    const { days, hours } = dayParts(min, lang);
    return hours ? `${days} ${hours}` : days;
  }
  if (min < 60) return `${Math.max(min, 1)} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

function clockOf(iso: string): string {
  const d = new Date(iso);
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: EVENT_TZ, hour: "2-digit", hourCycle: "h23" }).format(d));
  const m = Number(new Intl.DateTimeFormat("en-GB", { timeZone: EVENT_TZ, minute: "2-digit" }).format(d));
  return formatMinutes(h * 60 + m);
}

function whoOf(x: AgendaTalk): string | null {
  return x.whoText ?? x.speaker?.name ?? null;
}

/** Avatares apilados de quienes hablan (hasta 3). */
function Faces({ talk, size }: { talk: AgendaTalk; size: number }) {
  const people = (talk.speakers?.length ? talk.speakers : talk.speaker ? [talk.speaker] : [])
    .filter((p) => p.photoUrl)
    .slice(0, 3);
  if (people.length === 0) return null;
  return (
    <div className="flex shrink-0 items-center">
      {people.map((p, i) => (
        <Image
          key={p.slug}
          src={p.photoUrl!}
          alt={p.name}
          width={size}
          height={size}
          className="rounded-full object-cover"
          style={{
            width: size,
            height: size,
            marginLeft: i === 0 ? 0 : -size * 0.3,
            border: "2px solid #000",
          }}
        />
      ))}
    </div>
  );
}

function AddButton({ id, t, big = false }: { id: string; t: TT; big?: boolean }) {
  const picked = useAgendaStore((s) => s.picked);
  const hydrated = useAgendaStore((s) => s.hydrated);
  const toggle = useAgendaStore((s) => s.toggle);
  const on = hydrated && picked.includes(id);
  const size = big ? 44 : 38;
  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-label={on ? t.remove : t.add}
      aria-pressed={on}
      className="grid shrink-0 place-items-center rounded-full transition-colors active:scale-95"
      style={{
        width: size,
        height: size,
        background: on ? AMBER : "transparent",
        border: `1.5px solid ${on ? AMBER : "rgba(230,238,242,0.35)"}`,
        color: on ? "#000" : TEXT,
      }}
    >
      {on ? (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10.5l4 4 8-9" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M10 4v12M4 10h12" />
        </svg>
      )}
    </button>
  );
}

function LiveDot({ color }: { color: string }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: color }} />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: color }} />
    </span>
  );
}

/** Tarjeta grande: la charla que viene (o la tuya). Es el foco de la pantalla. */
function HeroCard({
  talk,
  now,
  t,
  lang,
  kicker,
  live,
}: {
  talk: AgendaTalk;
  now: number;
  t: TT;
  lang: Lang;
  kicker: string;
  live: boolean;
}) {
  const mins = Math.ceil((startMs(talk) - now) / 60000);
  const urgent = !live && mins <= 10;
  const accent = live ? GREEN : urgent ? ORANGE : AMBER;
  const who = whoOf(talk);
  const progress = live ? Math.min(100, Math.max(0, ((now - startMs(talk)) / (endMs(talk) - startMs(talk))) * 100)) : 0;
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-5"
      style={{
        background: `radial-gradient(120% 90% at 100% 0%, ${accent}26 0%, transparent 60%), ${CARD}`,
        border: `1.5px solid ${accent}`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[11px]" style={{ ...labelStyle, color: accent }}>
          {(live || urgent) && <LiveDot color={accent} />}
          {kicker}
        </span>
        <span className="text-[11px]" style={{ ...labelStyle, color: MUTED }}>
          {stageLabel(talk.stage, lang)}
        </span>
      </div>

      <div className="mt-4 flex items-end gap-3">
        {(() => {
          const big = live ? t.live : mins <= 0 ? t.now : t.inMin(spanL(lang, mins));
          // "EN 2 DÍAS 15 H" no entra a 44px en un celular: baja el cuerpo, no el texto.
          return (
            <span className="whitespace-nowrap leading-none" style={{ ...labelStyle, color: accent, fontSize: big.length > 11 ? 30 : 44 }}>
              {big}
            </span>
          );
        })()}
      </div>
      <p className="mt-1 text-sm" style={{ ...bodyStyle, color: MUTED }}>
        {clockOf(talk.startsAt!)} · {talk.durationMin ?? 30} {t.min}
        {live && ` · ${t.endsIn(spanL(lang, Math.max(1, Math.ceil((endMs(talk) - now) / 60000))))}`}
      </p>

      {live && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(230,238,242,0.14)" }}>
          <div className="h-full rounded-full transition-[width] duration-1000" style={{ width: `${progress}%`, background: accent }} />
        </div>
      )}

      <h3 className="mt-5 text-[20px] leading-tight" style={{ ...labelStyle, textTransform: "none", color: TEXT }}>
        {talk.title}
      </h3>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Faces talk={talk} size={40} />
          {who && (
            <span className="min-w-0 text-[13px] leading-snug" style={{ ...bodyStyle, color: TEXT }}>
              {who}
            </span>
          )}
        </div>
        <AddButton id={talk.id} t={t} big />
      </div>
    </div>
  );
}

/** Fila compacta para la lista "Por venir". */
function SoonRow({ talk, now, t, lang }: { talk: AgendaTalk; now: number; t: TT; lang: Lang }) {
  const mins = Math.max(0, Math.ceil((startMs(talk) - now) / 60000));
  const urgent = mins <= 10;
  const who = whoOf(talk);
  return (
    <div className="flex items-center gap-3 rounded-2xl p-3.5" style={{ background: CARD, border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="w-[72px] shrink-0 text-center">
        <div className="whitespace-nowrap text-[15px] leading-none" style={{ ...labelStyle, color: urgent ? ORANGE : TEXT }}>
          {mins === 0 ? (
            t.now
          ) : mins >= 1440 ? (
            <>
              {dayParts(mins, lang).days}
              {dayParts(mins, lang).hours && (
                <>
                  <br />
                  {dayParts(mins, lang).hours}
                </>
              )}
            </>
          ) : (
            spanL(lang, mins)
          )}
        </div>
        <div className="mt-1 text-[11px]" style={{ ...bodyStyle, color: MUTED }}>
          {clockOf(talk.startsAt!)}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px]" style={{ ...labelStyle, color: AMBER }}>
          {stageLabel(talk.stage, lang)}
        </p>
        <p className="mt-0.5 text-[14px] leading-snug" style={{ ...labelStyle, textTransform: "none", color: TEXT }}>
          {talk.title}
        </p>
        {who && (
          <p className="mt-0.5 truncate text-[12px]" style={{ ...bodyStyle, color: MUTED }}>
            {who}
          </p>
        )}
      </div>
      <AddButton id={talk.id} t={t} />
    </div>
  );
}

/** Tarjeta del escenario: en vivo (con barra) + la que sigue, remarcada. */
function StageBlock({
  stage,
  live,
  next,
  now,
  t,
  lang,
}: {
  stage: string;
  live?: AgendaTalk;
  next?: AgendaTalk;
  now: number;
  t: TT;
  lang: Lang;
}) {
  const progress = live ? Math.min(100, Math.max(0, ((now - startMs(live)) / (endMs(live) - startMs(live))) * 100)) : 0;
  const nextMins = next ? Math.max(0, Math.ceil((startMs(next) - now) / 60000)) : 0;
  return (
    <section className="overflow-hidden rounded-3xl" style={{ background: CARD, border: "1px solid rgba(255,255,255,0.08)" }}>
      <h3 className="px-4 pt-4 text-[13px]" style={{ ...labelStyle, color: TEXT }}>
        {stageLabel(stage, lang)}
      </h3>

      {live ? (
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center gap-2 text-[11px]" style={{ ...labelStyle, color: GREEN }}>
            <LiveDot color={GREEN} />
            {t.live} · {t.endsIn(spanL(lang, Math.max(1, Math.ceil((endMs(live) - now) / 60000))))}
          </div>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] leading-snug" style={{ ...labelStyle, textTransform: "none", color: TEXT }}>
                {live.title}
              </p>
              {whoOf(live) && (
                <p className="mt-1 text-[12px]" style={{ ...bodyStyle, color: MUTED }}>
                  {whoOf(live)}
                </p>
              )}
            </div>
            <Faces talk={live} size={34} />
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(230,238,242,0.14)" }}>
            <div className="h-full rounded-full transition-[width] duration-1000" style={{ width: `${progress}%`, background: GREEN }} />
          </div>
        </div>
      ) : (
        !next && (
          <p className="px-4 pt-2 pb-4 text-sm" style={{ ...bodyStyle, color: MUTED }}>
            {t.nothing}
          </p>
        )
      )}

      {next && (
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{
            background: `linear-gradient(90deg, ${ORANGE}22, transparent 80%)`,
            borderTop: live ? "1px solid rgba(255,255,255,0.08)" : undefined,
            marginTop: live ? 0 : 8,
          }}
        >
          <div className="w-[56px] shrink-0">
            <div className="text-[11px]" style={{ ...labelStyle, color: ORANGE }}>
              {t.nextUp}
            </div>
            <div className="mt-0.5 text-[15px] leading-none" style={{ ...labelStyle, color: TEXT }}>
              {clockOf(next.startsAt!)}
            </div>
            <div className="mt-1 text-[11px]" style={{ ...bodyStyle, color: MUTED }}>
              {nextMins === 0 ? t.now : t.inMin(spanL(lang, nextMins))}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] leading-snug" style={{ ...labelStyle, textTransform: "none", color: TEXT }}>
              {next.title}
            </p>
            {whoOf(next) && (
              <p className="mt-0.5 truncate text-[12px]" style={{ ...bodyStyle, color: MUTED }}>
                {whoOf(next)}
              </p>
            )}
          </div>
          <AddButton id={next.id} t={t} />
        </div>
      )}
    </section>
  );
}

export default function NowView({ talks }: { talks: AgendaTalk[] }) {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];
  const picked = useAgendaStore((s) => s.picked);
  const hydrated = useAgendaStore((s) => s.hydrated);

  // null hasta montar: el server no sabe qué hora es para quien mira.
  const [now, setNow] = useState<number | null>(null);
  const [simulated, setSimulated] = useState(false);
  const [filter, setFilter] = useState<string>("all"); // "all" | "mine" | sN

  useEffect(() => {
    // ?t=2026-10-30T11:00 simula la hora para probar la pantalla antes del evento.
    const raw = new URLSearchParams(window.location.search).get("t");
    const fake = raw ? new Date(raw.includes("-03:00") || raw.endsWith("Z") ? raw : `${raw}:00-03:00`).getTime() : NaN;
    if (Number.isFinite(fake)) {
      setSimulated(true);
      setNow(fake);
      return;
    }
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  const scheduled = useMemo(() => talks.filter((x) => x.startsAt), [talks]);

  const view = useMemo(() => {
    if (now == null) return null;
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: EVENT_TZ }).format(new Date(now));
    let dayTalks = scheduled.filter((x) => x.startsAt!.startsWith(today));
    let phase: "live" | "before" | "after" = "live";
    let dayKey: string = today;
    if (dayTalks.length === 0) {
      const first = scheduled.reduce((a, b) => (startMs(a) <= startMs(b) ? a : b), scheduled[0]);
      phase = first && now < startMs(first) ? "before" : "after";
      if (phase === "before" && first) {
        dayKey = first.startsAt!.slice(0, 10);
        dayTalks = scheduled.filter((x) => x.startsAt!.startsWith(dayKey));
      }
    } else {
      if (now < Math.min(...dayTalks.map(startMs))) phase = "before";
      else if (now >= Math.max(...dayTalks.map(endMs))) phase = "after";
    }

    const upcoming = dayTalks.filter((x) => startMs(x) > now).sort((a, b) => startMs(a) - startMs(b));
    const liveNow = dayTalks.filter((x) => startMs(x) <= now && now < endMs(x));
    const stages = Array.from(new Set(dayTalks.map((x) => x.stage))).sort(compareStages);
    const rows = stages.map((s) => {
      const own = dayTalks.filter((x) => x.stage === s).sort((a, b) => startMs(a) - startMs(b));
      return {
        stage: s,
        live: own.find((x) => startMs(x) <= now && now < endMs(x)),
        next: own.find((x) => startMs(x) > now),
      };
    });
    const dayId = dayTalks[0]?.day;
    return { phase, upcoming, liveNow, rows, stages, dayId };
  }, [now, scheduled]);

  const mineIds = useMemo(() => new Set(hydrated ? picked : []), [picked, hydrated]);

  const clock =
    now == null
      ? ""
      : new Intl.DateTimeFormat("es-AR", { timeZone: EVENT_TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(now));

  // Lo tuyo: en curso primero, si no la próxima por hora.
  const mineNow = view && now != null ? view.liveNow.filter((x) => mineIds.has(x.id))[0] : undefined;
  const mineNext = view ? view.upcoming.find((x) => mineIds.has(x.id)) : undefined;
  const hero = mineNow ?? mineNext;
  const heroIsLive = !!mineNow;

  const dayLabel =
    view?.dayId && isDay(view.dayId) ? DAY_LABELS[view.dayId as Day][lang] : null;

  const chips = view ? ["all", "mine", ...view.stages] : [];
  const chipLabel = (c: string) => (c === "all" ? t.all : c === "mine" ? t.mine : stageLabel(c, lang));

  // Con filtro de escenario o "mi agenda" la vista es una sola lista.
  const filteredUpcoming =
    view == null
      ? []
      : filter === "mine"
        ? view.upcoming.filter((x) => mineIds.has(x.id))
        : view.upcoming;

  return (
    <div className="px-4 pt-8 pb-6">
      {/* Cabecera: hora grande + día */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[34px] leading-none" style={{ ...labelStyle, color: TEXT }}>
            {t.title}
          </h1>
          {dayLabel && (
            <p className="mt-2 text-xs" style={{ ...bodyStyle, color: MUTED }}>
              {dayLabel}
            </p>
          )}
        </div>
        <span className="text-[34px] leading-none tabular-nums" style={{ ...labelStyle, color: GREEN }}>
          {clock}
        </span>
      </div>
      {simulated && (
        <p className="mt-2 text-xs" style={{ ...bodyStyle, color: AMBER }}>
          {t.simulated}
        </p>
      )}

      {view?.phase === "before" && (
        <div className="mt-5 rounded-2xl px-4 py-3" style={{ background: CARD, border: `1px solid ${ORANGE}66` }}>
          <p className="text-sm" style={{ ...labelStyle, color: TEXT }}>{t.before}</p>
          <p className="mt-1 text-xs" style={{ ...bodyStyle, color: MUTED }}>{t.beforeSub}</p>
        </div>
      )}
      {view?.phase === "after" && (
        <div className="mt-5 rounded-2xl px-4 py-3" style={{ background: CARD, border: "1px solid rgba(255,255,255,0.12)" }}>
          <p className="text-sm" style={{ ...labelStyle, color: TEXT }}>{t.after}</p>
          <p className="mt-1 text-xs" style={{ ...bodyStyle, color: MUTED }}>{t.afterSub}</p>
        </div>
      )}

      {now != null && view && view.phase !== "after" && (
        <>
          {/* Foco: la charla que viene (la tuya si ya elegiste) */}
          <div className="mt-6">
            {hero ? (
              <HeroCard
                talk={hero}
                now={now}
                t={t}
                lang={lang}
                kicker={heroIsLive ? t.yourLive : t.yourNext}
                live={heroIsLive}
              />
            ) : hydrated && view.upcoming[0] ? (
              <div className="flex flex-col gap-3">
                <HeroCard talk={view.upcoming[0]} now={now} t={t} lang={lang} kicker={t.soon} live={false} />
                <Link
                  href="/evento/agenda"
                  className="flex items-center justify-between rounded-2xl px-4 py-3.5"
                  style={{ background: CARD, border: `1px dashed ${AMBER}88` }}
                >
                  <span>
                    <span className="block text-[13px]" style={{ ...labelStyle, color: AMBER }}>{t.nudgeTitle}</span>
                    <span className="mt-1 block text-[12px] leading-snug" style={{ ...bodyStyle, color: MUTED }}>{t.nudgeBody}</span>
                  </span>
                  <span className="ml-3 shrink-0 text-[11px]" style={{ ...labelStyle, color: AMBER }}>{t.nudgeCta} →</span>
                </Link>
              </div>
            ) : null}
          </div>

          {/* Filtros */}
          <div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            {chips.map((c) => {
              const on = filter === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  className="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[11px]"
                  style={{
                    ...labelStyle,
                    background: on ? GREEN : "transparent",
                    color: on ? "#000" : TEXT,
                    border: `1px solid ${on ? GREEN : "rgba(230,238,242,0.3)"}`,
                  }}
                >
                  {chipLabel(c)}
                </button>
              );
            })}
          </div>

          {/* Por venir (todos / mi agenda) */}
          {(filter === "all" || filter === "mine") && (
            <section className="mt-6">
              <h2 className="text-[13px]" style={{ ...labelStyle, color: TEXT }}>
                {t.soon}
              </h2>
              <p className="mt-1 text-xs" style={{ ...bodyStyle, color: MUTED }}>
                {t.soonSub}
              </p>
              <div className="mt-3 flex flex-col gap-2.5">
                {filteredUpcoming.length === 0 ? (
                  <p className="text-sm" style={{ ...bodyStyle, color: MUTED }}>
                    {filter === "mine" ? t.mineEmpty : t.nothing}
                  </p>
                ) : (
                  filteredUpcoming.slice(0, filter === "mine" ? 20 : 5).map((x) => (
                    <SoonRow key={x.id} talk={x} now={now} t={t} lang={lang} />
                  ))
                )}
              </div>
            </section>
          )}

          {/* Por escenario */}
          {filter !== "mine" && (
            <section className="mt-8">
              {filter === "all" && (
                <h2 className="mb-3 text-[13px]" style={{ ...labelStyle, color: TEXT }}>
                  {t.stages}
                </h2>
              )}
              <div className="flex flex-col gap-3">
                {view.rows
                  .filter((r) => filter === "all" || r.stage === filter)
                  .map((r) => (
                    <StageBlock key={r.stage} stage={r.stage} live={view.phase === "live" ? r.live : undefined} next={r.next} now={now} t={t} lang={lang} />
                  ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
