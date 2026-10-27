"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLangStore } from "@/lib/store/lang";
import { DAY_SHORT, compareStages, stageLabel, isDay } from "@/lib/speakers/schedule";
import type { SpeakerCard } from "@/lib/speakers/queries";
import ScreenTitle from "./ScreenTitle";

const GREEN = "#ABF760";
const AMBER = "#FFAB0B";
const TEXT = "#E6EEF2";
const MUTED = "#A5A8B1";

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

/** Cuándo y dónde habla alguien, sacado del cruce con la agenda. */
export type SpeakerSlot = { day: string; stage: string; at: string };

const T = {
  es: {
    title: "Speakers",
    search: "Buscar speaker",
    allDays: "Todos los días",
    allStages: "Todos los escenarios",
    day: "Día",
    stage: "Escenario",
    empty: "No encontramos speakers con ese criterio.",
    clear: "Limpiar filtros",
    count: (n: number) => `${n} ${n === 1 ? "speaker" : "speakers"}`,
  },
  en: {
    title: "Speakers",
    search: "Search speakers",
    allDays: "All days",
    allStages: "All stages",
    day: "Day",
    stage: "Stage",
    empty: "No speakers match that search.",
    clear: "Clear filters",
    count: (n: number) => `${n} ${n === 1 ? "speaker" : "speakers"}`,
  },
} as const;

const fold = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-[12px]"
      style={{
        ...labelStyle,
        background: on ? GREEN : "transparent",
        color: on ? "#000" : TEXT,
        border: `1px solid ${on ? GREEN : "rgba(230,238,242,0.3)"}`,
      }}
    >
      {children}
    </button>
  );
}

const strip: React.CSSProperties = { scrollbarWidth: "none" };
const stripClass = "-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden";

export default function EventoSpeakers({
  speakers,
  slots,
}: {
  speakers: SpeakerCard[];
  slots: Record<string, SpeakerSlot[]>;
}) {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];
  const [query, setQuery] = useState("");
  const [day, setDay] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);

  const days = useMemo(
    () => Array.from(new Set(Object.values(slots).flat().map((x) => x.day))).filter(isDay).sort(),
    [slots]
  );
  // Solo los escenarios que tienen a alguien (y, con día elegido, ese día).
  const stages = useMemo(
    () =>
      Array.from(
        new Set(
          Object.values(slots)
            .flat()
            .filter((x) => !day || x.day === day)
            .map((x) => x.stage)
        )
      ).sort(compareStages),
    [slots, day]
  );

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return speakers.filter((s) => {
      const own = slots[s.slug] ?? [];
      if (day && !own.some((x) => x.day === day && (!stage || x.stage === stage))) return false;
      if (!day && stage && !own.some((x) => x.stage === stage)) return false;
      if (!q) return true;
      return fold([s.name, s.role, s.company, s.country].filter(Boolean).join(" ")).includes(q);
    });
  }, [speakers, slots, query, day, stage]);

  const filtering = !!(query || day || stage);

  return (
    <div className="px-4 pt-8 pb-6">
      <ScreenTitle
        right={
          <span className="text-[13px]" style={{ ...bodyStyle, color: MUTED }}>
            {t.count(filtered.length)}
          </span>
        }
      >
        {t.title}
      </ScreenTitle>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.search}
        aria-label={t.search}
        className="mt-6 w-full rounded-full outline-none focus:border-[#ABF760]"
        style={{ ...bodyStyle, background: "#1A1A1A", border: "1px solid rgba(230,238,242,0.22)", color: TEXT, fontSize: 16, padding: "14px 22px" }}
      />

      {days.length > 0 && (
        <div className="mt-4">
          <div className={stripClass} style={strip}>
            <Chip on={day === null} onClick={() => { setDay(null); setStage(null); }}>{t.allDays}</Chip>
            {days.map((d) => (
              <Chip key={d} on={day === d} onClick={() => { setDay(day === d ? null : d); setStage(null); }}>
                {isDay(d) ? DAY_SHORT[d][lang] : d}
              </Chip>
            ))}
          </div>
          {stages.length > 0 && (
            <div className={`${stripClass} mt-2`} style={strip}>
              <Chip on={stage === null} onClick={() => setStage(null)}>{t.allStages}</Chip>
              {stages.map((s) => (
                <Chip key={s} on={stage === s} onClick={() => setStage(stage === s ? null : s)}>
                  {stageLabel(s, lang)}
                </Chip>
              ))}
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-10">
          <p className="text-[15px]" style={{ ...bodyStyle, color: MUTED }}>{t.empty}</p>
          <button
            type="button"
            onClick={() => { setQuery(""); setDay(null); setStage(null); }}
            className="mt-4 rounded-full px-5 py-3 text-[12px]"
            style={{ ...labelStyle, background: GREEN, color: "#000" }}
          >
            {t.clear}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4">
          {filtered.map((s) => {
            const own = (slots[s.slug] ?? []).filter((x) => (!day || x.day === day) && (!stage || x.stage === stage));
            const first = own[0];
            return <Tile key={s.slug} speaker={s} slot={first} lang={lang} showSlot={filtering || !!first} />;
          })}
        </div>
      )}
    </div>
  );
}

function Tile({ speaker, slot, lang, showSlot }: { speaker: SpeakerCard; slot?: SpeakerSlot; lang: "es" | "en"; showSlot: boolean }) {
  const sub = [speaker.role, speaker.company].filter(Boolean).join(" · ");
  return (
    <Link href={`/speakers/${speaker.slug}`} className="block min-w-0">
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "1 / 1", background: "rgba(230,238,242,0.05)" }}>
        {speaker.photoUrl ? (
          <Image src={speaker.photoUrl} alt={speaker.name} fill sizes="33vw" style={{ objectFit: "cover", objectPosition: "center 20%" }} />
        ) : (
          <div className="absolute inset-0 grid place-items-center" style={{ background: "linear-gradient(150deg, #2A2D33 0%, #171616 70%)" }}>
            <span style={{ ...labelStyle, color: "rgba(230,238,242,0.25)", fontSize: 26 }}>{speaker.name.slice(0, 1)}</span>
          </div>
        )}
      </div>
      {/* Alturas fijas: nombre a 2 renglones y cargo a 2, así las filas de la
          grilla arrancan y terminan a la misma altura. */}
      <p className="mt-2 line-clamp-2 text-[11px] leading-tight" style={{ ...labelStyle, color: TEXT, minHeight: "2.4em" }}>
        {speaker.name}
      </p>
      <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug" style={{ ...bodyStyle, color: MUTED, minHeight: "2.7em" }}>
        {sub}
      </p>
      {showSlot && (
        <p className="mt-1 truncate text-[10px]" style={{ ...labelStyle, color: AMBER, minHeight: "1.2em" }}>
          {slot ? `${isDay(slot.day) ? DAY_SHORT[slot.day][lang].split(" ")[0] : slot.day} ${slot.at}` : ""}
        </p>
      )}
    </Link>
  );
}
