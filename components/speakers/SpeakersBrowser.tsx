"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLangStore } from "@/lib/store/lang";
import { CANONICAL_TAGS, TAG_LABELS, type CanonicalTag } from "@/lib/speakers/tags";
import type { SpeakerCard } from "@/lib/speakers/queries";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const T = {
  es: {
    search: "¿Qué speaker estás buscando?",
    all: "Todos",
    empty: "No encontramos speakers con ese criterio.",
    clear: "Limpiar filtros",
    count: (n: number) => `${n} ${n === 1 ? "speaker" : "speakers"}`,
  },
  en: {
    search: "Which speaker are you looking for?",
    all: "All",
    empty: "No speakers match that search.",
    clear: "Clear filters",
    count: (n: number) => `${n} ${n === 1 ? "speaker" : "speakers"}`,
  },
} as const;

/** Quita acentos y mayúsculas para que "Bavala" encuentre a "Bávala". */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export default function SpeakersBrowser({ speakers }: { speakers: SpeakerCard[] }) {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<CanonicalTag | null>(null);

  // Solo se ofrecen los filtros que efectivamente tienen a alguien detrás: con
  // 23 speakers publicados, mostrar los 9 chips fijos dejaría varios que no
  // devuelven nada.
  const availableTags = useMemo(() => {
    const present = new Set(speakers.flatMap((s) => s.tags));
    return CANONICAL_TAGS.filter((c) => present.has(c));
  }, [speakers]);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return speakers.filter((s) => {
      if (tag && !s.tags.includes(tag)) return false;
      if (!q) return true;
      return fold([s.name, s.role, s.company, s.country].filter(Boolean).join(" ")).includes(q);
    });
  }, [speakers, query, tag]);

  return (
    <div className="w-full">
      {/* Buscador */}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.search}
        aria-label={t.search}
        className="w-full rounded-full outline-none transition-colors duration-200 focus:border-[#ABF760]"
        style={{
          fontFamily: "var(--font-neue-machina), sans-serif",
          fontWeight: 300,
          background: "rgba(230,238,242,0.04)",
          border: "1px solid rgba(230,238,242,0.18)",
          color: "#E6EEF2",
          fontSize: "clamp(14px, 1.4vw, 17px)",
          padding: "16px 26px",
        }}
      />

      {/* Filtros por tema */}
      <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setTag(null)}
          className="rounded-full transition-colors duration-200"
          style={{
            ...labelStyle,
            fontSize: "clamp(10px, 1vw, 12px)",
            padding: "9px 18px",
            color: tag === null ? "#171616" : "#A5A8B1",
            background: tag === null ? "#ABF760" : "transparent",
            border: `1px solid ${tag === null ? "#ABF760" : "rgba(230,238,242,0.18)"}`,
          }}
        >
          {t.all}
        </button>

        {availableTags.map((c) => {
          const on = tag === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setTag(on ? null : c)}
              className="rounded-full transition-colors duration-200"
              style={{
                ...labelStyle,
                fontSize: "clamp(10px, 1vw, 12px)",
                padding: "9px 18px",
                color: on ? "#171616" : "#A5A8B1",
                background: on ? "#ABF760" : "transparent",
                border: `1px solid ${on ? "#ABF760" : "rgba(230,238,242,0.18)"}`,
              }}
            >
              {TAG_LABELS[c][lang]}
            </button>
          );
        })}
      </div>

      <p
        className="mt-6"
        style={{
          fontFamily: "var(--font-neue-machina), sans-serif",
          fontWeight: 300,
          color: "#A5A8B1",
          fontSize: "clamp(12px, 1.1vw, 14px)",
        }}
      >
        {t.count(filtered.length)}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-start gap-4">
          <p
            style={{
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontWeight: 300,
              color: "#A5A8B1",
              fontSize: "clamp(14px, 1.4vw, 18px)",
            }}
          >
            {t.empty}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setTag(null);
            }}
            className="rounded-full transition-opacity duration-200 hover:opacity-80"
            style={{
              ...labelStyle,
              color: "#171616",
              background: "#ABF760",
              fontSize: "clamp(11px, 1.05vw, 13px)",
              padding: "11px 22px",
            }}
          >
            {t.clear}
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((s, i) => (
            <SpeakerTile key={s.slug} speaker={s} index={i} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}

function SpeakerTile({
  speaker,
  index,
  lang,
}: {
  speaker: SpeakerCard;
  index: number;
  lang: "es" | "en";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      // El stagger se corta a los 12 items: con la grilla completa, escalonar
      // todo hacía que los últimos tardaran segundos en aparecer.
      transition={{ duration: 0.45, delay: Math.min(index, 12) * 0.04, ease: "easeOut" }}
    >
      <Link href={`/speakers/${speaker.slug}`} className="group block">
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{ aspectRatio: "1 / 1", background: "rgba(230,238,242,0.05)" }}
        >
          {speaker.photoUrl ? (
            <Image
              src={speaker.photoUrl}
              alt={speaker.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="transition-transform duration-500 group-hover:scale-105"
              style={{ objectFit: "cover" }}
            />
          ) : (
            // Placeholder para los speakers cuya foto todavía no cargó la
            // organización. Mismo gradiente que las cards de la home.
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "linear-gradient(150deg, #2A2D33 0%, #171616 70%)" }}
            >
              <span style={{ ...labelStyle, color: "rgba(230,238,242,0.25)", fontSize: "clamp(24px, 4vw, 40px)" }}>
                {speaker.name.slice(0, 1)}
              </span>
            </div>
          )}
        </div>

        <h3
          className="mt-3 transition-colors duration-200 group-hover:text-[#ABF760]"
          style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(12px, 1.25vw, 16px)", lineHeight: 1.2 }}
        >
          {speaker.name}
        </h3>

        {speaker.role && (
          <p
            className="mt-1"
            style={{
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontWeight: 300,
              color: "#FF4E01",
              fontSize: "clamp(11px, 1.05vw, 13px)",
              lineHeight: 1.35,
            }}
          >
            {speaker.role}
          </p>
        )}

        {(speaker.company || speaker.country) && (
          <p
            className="mt-0.5"
            style={{
              fontFamily: "var(--font-neue-machina), sans-serif",
              fontWeight: 300,
              color: "#A5A8B1",
              fontSize: "clamp(10px, 1vw, 12px)",
            }}
          >
            {[speaker.company, speaker.country].filter(Boolean).join(" · ")}
          </p>
        )}

        {speaker.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {speaker.tags.slice(0, 2).map((c) => (
              <span
                key={c}
                className="rounded-full"
                style={{
                  ...labelStyle,
                  color: "#A5A8B1",
                  border: "1px solid rgba(230,238,242,0.15)",
                  fontSize: "9px",
                  padding: "3px 9px",
                }}
              >
                {TAG_LABELS[c][lang]}
              </span>
            ))}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
