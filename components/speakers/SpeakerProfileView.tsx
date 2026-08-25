"use client";

import Image from "next/image";
import Link from "next/link";
import { useLangStore } from "@/lib/store/lang";
import { TAG_LABELS } from "@/lib/speakers/tags";
import { DAY_LABELS, isDay, stageLabel } from "@/lib/speakers/schedule";
import type { SpeakerProfile } from "@/lib/speakers/queries";

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
    back: "← Todos los speakers",
    about: "Sobre",
    talks: "Charlas",
    talk: "Charla",
    connect: "Conectá con",
    minutes: "min",
    panel: "Panel",
    level: { general: "General", intermedio: "Intermedio", avanzado: "Avanzado", todos: "Todos los niveles" } as Record<string, string>,
    // La planilla todavía no trae hora de inicio: hay día, escenario y
    // duración, pero no el horario. Se dice explícitamente en vez de dejar un
    // hueco que parezca un error.
    timeTba: "Horario a confirmar",
  },
  en: {
    back: "← All speakers",
    about: "About",
    talks: "Talks",
    talk: "Talk",
    connect: "Connect with",
    minutes: "min",
    panel: "Panel",
    level: { general: "General", intermedio: "Intermediate", avanzado: "Advanced", todos: "All levels" } as Record<string, string>,
    timeTba: "Time to be confirmed",
  },
} as const;

export default function SpeakerProfileView({ speaker }: { speaker: SpeakerProfile }) {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  const socials = [
    speaker.xHandle && { label: `@${speaker.xHandle}`, href: `https://x.com/${speaker.xHandle}` },
    speaker.linkedin && { label: "LinkedIn", href: speaker.linkedin },
    speaker.instagram && { label: `@${speaker.instagram}`, href: `https://instagram.com/${speaker.instagram}` },
    speaker.github && { label: "GitHub", href: `https://github.com/${speaker.github}` },
    speaker.website && { label: "Web", href: speaker.website },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <section className="relative px-6 sm:px-10 pt-32 sm:pt-40 pb-20 sm:pb-28">
      <div className="relative w-full max-w-5xl">
        <Link
          href="/speakers"
          className="inline-block transition-colors duration-200 hover:text-[#ABF760]"
          style={{ ...labelStyle, color: "#A5A8B1", fontSize: "clamp(10px, 1vw, 12px)" }}
        >
          {t.back}
        </Link>

        {/* Retrato deliberadamente contenido: los archivos de origen son 400x400
            y no existe versión más grande, así que un hero a todo ancho se
            vería blando. A este tamaño se ve nítido incluso en pantalla retina. */}
        <div className="mt-8 flex flex-col sm:flex-row gap-8 sm:gap-12 items-start">
          <div
            className="relative shrink-0 overflow-hidden rounded-2xl"
            style={{
              width: "clamp(140px, 26vw, 260px)",
              height: "clamp(140px, 26vw, 260px)",
              background: "rgba(230,238,242,0.05)",
            }}
          >
            {speaker.photoUrl ? (
              <Image
                src={speaker.photoUrl}
                alt={speaker.name}
                fill
                sizes="260px"
                priority
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "linear-gradient(150deg, #2A2D33 0%, #171616 70%)" }}
              >
                <span style={{ ...labelStyle, color: "rgba(230,238,242,0.25)", fontSize: "clamp(40px, 7vw, 72px)" }}>
                  {speaker.name.slice(0, 1)}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(28px, 4.6vw, 56px)", lineHeight: 1.05 }}>
              {speaker.name}
            </h1>

            {speaker.role && (
              <p className="mt-3" style={{ ...bodyStyle, color: "#FF4E01", fontSize: "clamp(14px, 1.5vw, 19px)" }}>
                {speaker.role}
              </p>
            )}

            {(speaker.company || speaker.country) && (
              <p className="mt-1" style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(12px, 1.2vw, 15px)" }}>
                {[speaker.company, speaker.country].filter(Boolean).join(" · ")}
              </p>
            )}

            {speaker.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {speaker.tags.map((c) => (
                  <span
                    key={c}
                    className="rounded-full"
                    style={{
                      ...labelStyle,
                      color: "#ABF760",
                      border: "1px solid rgba(171,247,96,0.45)",
                      fontSize: "clamp(9px, 0.95vw, 11px)",
                      padding: "6px 14px",
                    }}
                  >
                    {TAG_LABELS[c][lang]}
                  </span>
                ))}
              </div>
            )}

            {socials.length > 0 && (
              <div className="mt-6">
                <p style={{ ...labelStyle, color: "#A5A8B1", fontSize: "clamp(9px, 0.95vw, 11px)" }}>
                  {t.connect}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                  {socials.map((s) => (
                    <a
                      key={s.href}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors duration-200 hover:text-[#ABF760]"
                      style={{ ...bodyStyle, color: "#E6EEF2", fontSize: "clamp(12px, 1.15vw, 15px)" }}
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {speaker.bio && (
          <div className="mt-14">
            <h2 style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(14px, 1.5vw, 19px)" }}>
              {t.about} {speaker.name}
            </h2>
            <p
              className="mt-4 whitespace-pre-line"
              style={{ ...bodyStyle, color: "#E6EEF2", fontSize: "clamp(14px, 1.35vw, 18px)", lineHeight: 1.7, maxWidth: "70ch" }}
            >
              {speaker.bio}
            </p>
          </div>
        )}

        {speaker.talks.length > 0 && (
          <div className="mt-14">
            <h2 style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(14px, 1.5vw, 19px)" }}>
              {speaker.talks.length === 1 ? t.talk : t.talks}
            </h2>

            <div className="mt-6 flex flex-col gap-4">
              {speaker.talks.map((talk, i) => (
                <article
                  key={i}
                  className="rounded-2xl"
                  style={{ border: "1px solid rgba(230,238,242,0.14)", background: "rgba(255,255,255,0.02)", padding: "22px 24px" }}
                >
                  <h3 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(14px, 1.5vw, 19px)", lineHeight: 1.25 }}>
                    {talk.title}
                  </h3>

                  {talk.abstract && (
                    <p className="mt-3" style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(13px, 1.2vw, 16px)", lineHeight: 1.6 }}>
                      {talk.abstract}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {talk.day && (
                      <span style={{ ...labelStyle, color: "#FF4E01", fontSize: "clamp(9px, 0.95vw, 11px)" }}>
                        {isDay(talk.day) ? DAY_LABELS[talk.day][lang] : talk.day}
                      </span>
                    )}
                    {talk.stage && (
                      <span style={{ ...labelStyle, color: "#A5A8B1", fontSize: "clamp(9px, 0.95vw, 11px)" }}>
                        {stageLabel(talk.stage, lang)}
                      </span>
                    )}
                    <span style={{ ...labelStyle, color: "#A5A8B1", fontSize: "clamp(9px, 0.95vw, 11px)" }}>
                      {t.timeTba}
                    </span>
                    {talk.durationMin && (
                      <span style={{ ...labelStyle, color: "#A5A8B1", fontSize: "clamp(9px, 0.95vw, 11px)" }}>
                        {talk.durationMin} {t.minutes}
                      </span>
                    )}
                    {talk.isPanel && (
                      <span style={{ ...labelStyle, color: "#A5A8B1", fontSize: "clamp(9px, 0.95vw, 11px)" }}>
                        {t.panel}
                      </span>
                    )}
                    {talk.level && (
                      <span style={{ ...labelStyle, color: "#A5A8B1", fontSize: "clamp(9px, 0.95vw, 11px)" }}>
                        {t.level[talk.level] ?? talk.level}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
