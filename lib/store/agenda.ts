import { create } from "zustand";
import { persist } from "zustand/middleware";

// Mi Agenda — itinerario personal.
//
// Vive PRIMERO en el dispositivo: agregar una charla no pide mail, ni alias, ni
// cuenta, ni conexión. El respaldo es opcional y posterior.

interface AgendaState {
  /** ids de talks elegidos. */
  picked: string[];
  /**
   * Con qué se respaldó —mail o alias, a elección— para no volver a
   * escribirlo. Solo local. El nombre del campo quedó de cuando era solo mail:
   * renombrarlo perdería el valor ya guardado en localStorage de la gente.
   */
  savedEmail: string | null;
  /**
   * Si el store ya se rehidrató desde localStorage.
   *
   * Hace falta porque el server renderiza con `picked: []` y el cliente, un
   * instante después, con lo guardado. Sin esperar esta marca, React tira
   * mismatch de hidratación y el contador parpadea en 0.
   */
  hydrated: boolean;

  toggle: (talkId: string) => void;
  /** Une lo recuperado con lo que ya había en el dispositivo (ver nota abajo). */
  merge: (talkIds: string[]) => void;
  clear: () => void;
  setSavedEmail: (email: string | null) => void;
  setHydrated: () => void;
}

export const useAgendaStore = create<AgendaState>()(
  persist(
    (set) => ({
      picked: [],
      savedEmail: null,
      hydrated: false,

      toggle: (talkId) =>
        set((s) => ({
          picked: s.picked.includes(talkId)
            ? s.picked.filter((id) => id !== talkId)
            : [...s.picked, talkId],
        })),

      // Unión, no reemplazo: si alguien eligió tres charlas en este teléfono y
      // después recupera el respaldo, no puede perder esas tres. El costo es
      // que sacar una charla no se propaga entre dispositivos hasta el
      // siguiente guardado — mal mucho menor que borrarle la selección a
      // alguien sin que lo pida.
      merge: (talkIds) =>
        set((s) => ({ picked: Array.from(new Set([...s.picked, ...talkIds])) })),

      clear: () => set({ picked: [] }),
      setSavedEmail: (email) => set({ savedEmail: email }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "labitconf-mi-agenda",
      // Solo se persiste lo que es dato. `hydrated` es estado de UI: guardarlo
      // dejaría la marca en true antes de que la hidratación real ocurra.
      partialize: (s) => ({ picked: s.picked, savedEmail: s.savedEmail }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);
