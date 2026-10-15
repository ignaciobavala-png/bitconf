"use client";

import { useAgendaStore } from "@/lib/store/agenda";
import { useLangStore } from "@/lib/store/lang";

const T = {
  es: { add: "Agregar a mi agenda", remove: "Quitar de mi agenda", in: "En mi agenda" },
  en: { add: "Add to my agenda", remove: "Remove from my agenda", in: "In my agenda" },
} as const;

/**
 * Botón de agregar/quitar una charla del itinerario.
 *
 * No pide mail ni cuenta: escribe en localStorage y listo. El respaldo por mail
 * es un paso aparte y opcional, en /mi-agenda.
 *
 * Hasta que el store se rehidrata se dibuja el estado "no agregado": el
 * servidor no puede saber qué tiene guardado este dispositivo, y pintar el
 * estado real antes de tiempo produce mismatch de hidratación.
 */
export default function AgendaToggle({ talkId, size = 32 }: { talkId: string; size?: number }) {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  const hydrated = useAgendaStore((s) => s.hydrated);
  const on = useAgendaStore((s) => s.picked.includes(talkId)) && hydrated;
  const toggle = useAgendaStore((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={() => toggle(talkId)}
      aria-pressed={on}
      aria-label={on ? t.remove : t.add}
      title={on ? t.remove : t.add}
      className="flex shrink-0 items-center justify-center rounded-full transition-colors duration-200"
      style={{
        width: size,
        height: size,
        background: on ? "#ABF760" : "transparent",
        border: `1px solid ${on ? "#ABF760" : "rgba(230,238,242,0.25)"}`,
        color: on ? "#171616" : "#A5A8B1",
      }}
    >
      {/* Agendita: tildada cuando la charla ya está en el itinerario. */}
      <svg viewBox="0 0 24 24" width={size <= 26 ? 13 : 16} height={size <= 26 ? 13 : 16} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <line x1="8" y1="3" x2="8" y2="7" />
        <line x1="16" y1="3" x2="16" y2="7" />
        <line x1="3.5" y1="10" x2="20.5" y2="10" />
        {on && <polyline points="8.5 15 11 17.5 15.5 13" />}
      </svg>
    </button>
  );
}
