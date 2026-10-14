"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { TAG_LABELS } from "@/lib/speakers/tags";
import {
  DAY_LABELS,
  eventMinutes,
  formatMinutes,
  isDay,
  stageColor,
  stageLabel,
} from "@/lib/speakers/schedule";
import type { AgendaTalk } from "@/lib/speakers/queries";
import AgendaToggle from "./AgendaToggle";

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
    close: "Cerrar",
    minutes: "min",
    panel: "Panel",
    plenary: "Plenaria",
    speakers: "Quién habla",
    moderator: "Modera",
    topics: "Temas",
    profile: "Ver perfil",
    plenaryStages: "Varios escenarios",
  },
  en: {
    close: "Close",
    minutes: "min",
    panel: "Panel",
    plenary: "Plenary",
    speakers: "Speaking",
    moderator: "Moderator",
    topics: "Topics",
    profile: "View profile",
    plenaryStages: "Multiple stages",
  },
} as const;

/** Escenarios que ocupa una charla: una plenaria cruza varias columnas. */
export function stagesOf(talk: Pick<AgendaTalk, "stage" | "span">, lang: "es" | "en"): string {
  const from = Number(talk.stage.replace(/^s/i, ""));
  const n = talk.span ?? 1;
  if (!Number.isFinite(from) || n <= 1) return stageLabel(talk.stage, lang);
  return Array.from({ length: n }, (_, i) => stageLabel(`s${from + i}`, lang)).join(" + ");
}

/**
 * Ficha de una charla: lo que la tarjeta recorta (título completo, quién
 * habla con foto y link, moderador, temas) más el botón de Mi Agenda.
 *
 * Bottom sheet en mobile y modal centrado en pantallas anchas. Va en un portal
 * a `body`: el navbar y las tarjetas tienen `filter`/`backdrop-filter` en algún
 * ancestro, y eso confina a los hijos `position: fixed` a su propia caja.
 */
export default function TalkDetail({
  talk,
  lang,
  onClose,
}: {
  talk: AgendaTalk;
  lang: "es" | "en";
  onClose: () => void;
}) {
  const t = T[lang];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const plenary = (talk.span ?? 1) > 1;
  const color = plenary ? "#E6EEF2" : stageColor(talk.stage);
  const start = talk.startsAt ? eventMinutes(talk.startsAt) : null;
  const dur = talk.durationMin ?? null;
  const when =
    start != null ? `${formatMinutes(start)}${dur ? ` – ${formatMinutes(start + dur)}` : ""}` : null;
  const people = talk.speakers ?? (talk.speaker ? [talk.speaker] : []);
  const who = talk.whoText ?? talk.speaker?.name ?? null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-6"
      style={{ zIndex: 200, background: "rgba(0,0,0,0.72)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={talk.title}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{
          maxWidth: 640,
          maxHeight: "90svh",
          background: "#1D1C1C",
          border: "1px solid rgba(230,238,242,0.14)",
          borderTop: `3px solid ${color}`,
          padding: "26px clamp(20px, 4vw, 34px) 30px",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="absolute right-4 top-4 flex items-center justify-center rounded-full transition-colors duration-200 hover:text-[#ABF760]"
          style={{ width: 36, height: 36, color: "#A5A8B1", border: "1px solid rgba(230,238,242,0.2)" }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pr-12">
          <span className="inline-flex items-center gap-2" style={{ ...labelStyle, color, fontSize: 11 }}>
            <span aria-hidden className="inline-block rounded-full" style={{ width: 8, height: 8, background: color }} />
            {stagesOf(talk, lang)}
          </span>
          {plenary && <span style={{ ...labelStyle, color: "#A5A8B1", fontSize: 10 }}>{t.plenary}</span>}
        </div>

        <h2 className="mt-4" style={{ ...bodyStyle, fontWeight: 500, color: "#F3F7F9", fontSize: "clamp(20px, 3.4vw, 26px)", lineHeight: 1.25 }}>
          {talk.title}
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
          {isDay(talk.day) && (
            <span style={{ ...labelStyle, color: "#FF4E01", fontSize: 11 }}>{DAY_LABELS[talk.day][lang]}</span>
          )}
          {when && <span style={{ ...labelStyle, color: "#E6EEF2", fontSize: 11 }}>{when}</span>}
          {dur && (
            <span style={{ ...labelStyle, color: "#A5A8B1", fontSize: 11 }}>
              {dur} {t.minutes}
            </span>
          )}
          {talk.isPanel && <span style={{ ...labelStyle, color: "#A5A8B1", fontSize: 11 }}>{t.panel}</span>}
        </div>

        {talk.abstract && (
          <p className="mt-5" style={{ ...bodyStyle, color: "#C4C7CE", fontSize: 15, lineHeight: 1.65 }}>
            {talk.abstract}
          </p>
        )}

        {(who || people.length > 0) && (
          <div className="mt-7">
            <p style={{ ...labelStyle, color: "#A5A8B1", fontSize: 10 }}>{t.speakers}</p>
            {people.length > 0 ? (
              <ul className="mt-3 flex flex-col gap-3">
                {people.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/speakers/${p.slug}`} className="group flex items-center gap-3">
                      <span
                        className="relative block shrink-0 overflow-hidden rounded-full"
                        style={{ width: 44, height: 44, background: "#2A2929" }}
                      >
                        {p.photoUrl ? (
                          <Image src={p.photoUrl} alt="" fill sizes="44px" style={{ objectFit: "cover" }} />
                        ) : (
                          <span
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ ...labelStyle, color: "rgba(230,238,242,0.3)", fontSize: 16 }}
                          >
                            {p.name.slice(0, 1)}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block transition-colors duration-200 group-hover:text-[#ABF760]" style={{ ...bodyStyle, fontWeight: 500, color: "#E6EEF2", fontSize: 15 }}>
                          {p.name}
                        </span>
                        <span style={{ ...labelStyle, color: "#A5A8B1", fontSize: 9 }}>{t.profile} →</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            {/* El texto de la organización, literal: incluye a quien no tiene ficha publicada. */}
            {who && !(people.length === 1 && who.trim() === people[0].name.trim()) && (
              <p className="mt-3" style={{ ...bodyStyle, color: "#E6EEF2", fontSize: 14, lineHeight: 1.5 }}>
                {who}
              </p>
            )}
          </div>
        )}

        {talk.mod && (
          <p className="mt-4" style={{ ...bodyStyle, color: "#A5A8B1", fontSize: 13 }}>
            <span style={{ ...labelStyle, fontSize: 10 }}>{t.moderator}: </span>
            {talk.mod}
          </p>
        )}

        {talk.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2" aria-label={t.topics}>
            {talk.tags.map((c) => (
              <span
                key={c}
                className="rounded-full"
                style={{ ...labelStyle, color: "#ABF760", border: "1px solid rgba(171,247,96,0.45)", fontSize: 10, padding: "5px 12px" }}
              >
                {TAG_LABELS[c][lang]}
              </span>
            ))}
          </div>
        )}

        <div className="mt-7 flex justify-end">
          <AgendaToggle talkId={talk.id} />
        </div>
      </div>
    </div>,
    document.body
  );
}
