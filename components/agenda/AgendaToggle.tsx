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
export default function AgendaToggle({ talkId }: { talkId: string }) {
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
        width: 32,
        height: 32,
        background: on ? "#ABF760" : "transparent",
        border: `1px solid ${on ? "#ABF760" : "rgba(230,238,242,0.25)"}`,
        color: on ? "#171616" : "#A5A8B1",
      }}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {on ? <polyline points="20 6 9 17 4 12" /> : <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>}
      </svg>
    </button>
  );
}
