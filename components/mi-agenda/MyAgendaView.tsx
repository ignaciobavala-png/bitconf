"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAgendaStore } from "@/lib/store/agenda";
import { useLangStore } from "@/lib/store/lang";
import { DAYS, DAY_LABELS, compareStages, stageLabel, isDay } from "@/lib/speakers/schedule";
import AgendaToggle from "@/components/agenda/AgendaToggle";
import BackupPanel from "./BackupPanel";
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
    title: "Mi agenda",
    count: (n: number) => `${n} ${n === 1 ? "charla elegida" : "charlas elegidas"}`,
    emptyTitle: "Todavía no elegiste ninguna charla",
    emptyBody: "Entrá a la agenda y tocá el + en las que quieras ver. Se guardan en este dispositivo, sin cuenta ni mail.",
    goAgenda: "Ir a la agenda",
    addMore: "Agregar más charlas",
    timeTba: "Horario a confirmar",
    minutes: "min",
    offline: "Funciona sin conexión: si la abriste una vez, la vas a poder ver el día del evento aunque no haya señal.",
  },
  en: {
    title: "My agenda",
    count: (n: number) => `${n} ${n === 1 ? "talk picked" : "talks picked"}`,
    emptyTitle: "You haven't picked any talks yet",
    emptyBody: "Go to the agenda and tap + on the ones you want. They're saved on this device, no account or email needed.",
    goAgenda: "Go to the agenda",
    addMore: "Add more talks",
    timeTba: "Time to be confirmed",
    minutes: "min",
    offline: "Works offline: if you've opened it once, you'll be able to see it on event day even with no signal.",
  },
} as const;

export default function MyAgendaView({ talks }: { talks: AgendaTalk[] }) {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  const hydrated = useAgendaStore((s) => s.hydrated);
  const picked = useAgendaStore((s) => s.picked);

  // Se agrupa por día y escenario, igual que /agenda. El itinerario no tiene
  // orden propio: el orden que importa es el del evento.
  const grouped = useMemo(() => {
    const set = new Set(picked);
    const mine = talks.filter((k) => set.has(k.id));
    return DAYS.map((d) => {
      const ofDay = mine.filter((k) => k.day === d);
      const byStage = new Map<string, AgendaTalk[]>();
      for (const k of ofDay) {
        const list = byStage.get(k.stage);
        if (list) list.push(k);
        else byStage.set(k.stage, [k]);
      }
      return {
        day: d,
        stages: Array.from(byStage.entries()).sort((a, b) => compareStages(a[0], b[0])),
        total: ofDay.length,
      };
    }).filter((g) => g.total > 0);
  }, [talks, picked]);

  // Antes de la hidratación no se sabe qué eligió esta persona. Se dibuja el
  // esqueleto en vez del estado vacío, para no mostrarle "no elegiste nada" a
  // alguien que sí eligió.
  const total = hydrated ? picked.length : 0;

  return (
    <div className="w-full">
      <h1 style={{ ...labelStyle, color: "#ABF760", fontSize: "clamp(34px, 6.5vw, 76px)", lineHeight: 1.02 }}>
        {t.title}
      </h1>

      {hydrated && (
        <p className="mt-3" style={{ ...labelStyle, color: "#FF4E01", fontSize: "clamp(11px, 1.05vw, 13px)" }}>
          {t.count(total)}
        </p>
      )}

      <p className="mt-4" style={{ ...bodyStyle, color: "#6E7178", fontSize: "clamp(11px, 1.05vw, 13px)", lineHeight: 1.5, maxWidth: "52ch" }}>
        {t.offline}
      </p>

      {hydrated && total === 0 ? (
        <div className="mt-10">
          <p style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(14px, 1.5vw, 18px)" }}>{t.emptyTitle}</p>
          <p className="mt-3" style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(13px, 1.25vw, 15px)", lineHeight: 1.6, maxWidth: "50ch" }}>
            {t.emptyBody}
          </p>
          <Link
            href="/agenda"
            className="mt-6 inline-block rounded-full transition-opacity duration-200 hover:opacity-85"
            style={{ ...labelStyle, color: "#171616", background: "#ABF760", fontSize: "clamp(11px, 1.05vw, 13px)", padding: "13px 26px" }}
          >
            {t.goAgenda}
          </Link>
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-10">
          {grouped.map((g) => (
            <section key={g.day}>
              <h2 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(14px, 1.5vw, 19px)" }}>
                {isDay(g.day) ? DAY_LABELS[g.day][lang] : g.day}
              </h2>

              <div className="mt-5 flex flex-col gap-6">
                {g.stages.map(([stage, list]) => (
                  <div key={stage}>
                    <h3
                      className="pb-2"
                      style={{ ...labelStyle, color: "#FF4E01", fontSize: "clamp(11px, 1.1vw, 13px)", borderBottom: "1px solid rgba(255,78,1,0.3)" }}
                    >
                      {stageLabel(stage, lang)}
                    </h3>
                    <div className="mt-3 flex flex-col gap-3">
                      {list.map((k) => (
                        <article
                          key={k.id}
                          className="rounded-2xl flex items-start justify-between gap-3"
                          style={{ border: "1px solid rgba(230,238,242,0.14)", background: "rgba(255,255,255,0.02)", padding: "16px 18px" }}
                        >
                          <div className="min-w-0">
                            <h4 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(12px, 1.2vw, 15px)", lineHeight: 1.3 }}>
                              {k.title}
                            </h4>
                            {k.speaker && (
                              <Link
                                href={`/speakers/${k.speaker.slug}`}
                                className="mt-1.5 inline-block transition-colors duration-200 hover:text-[#ABF760]"
                                style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(11px, 1.05vw, 13px)" }}
                              >
                                {k.speaker.name}
                              </Link>
                            )}
                            <p className="mt-1.5" style={{ ...labelStyle, color: "#6E7178", fontSize: "clamp(9px, 0.9vw, 10px)" }}>
                              {[t.timeTba, k.durationMin ? `${k.durationMin} ${t.minutes}` : null].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          <AgendaToggle talkId={k.id} />
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {hydrated && (
            <Link
              href="/agenda"
              className="self-start rounded-full transition-colors duration-200 hover:border-[#ABF760]"
              style={{ ...labelStyle, color: "#E6EEF2", border: "1px solid rgba(230,238,242,0.25)", fontSize: "clamp(11px, 1.05vw, 13px)", padding: "13px 26px" }}
            >
              {t.addMore}
            </Link>
          )}
        </div>
      )}

      <div className="mt-12">
        <BackupPanel />
      </div>
    </div>
  );
}
