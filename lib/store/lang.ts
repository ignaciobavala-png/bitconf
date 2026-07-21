import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "es" | "en";

interface LangState {
  lang: Lang;
  toggleLang: () => void;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      lang: "es",
      toggleLang: () => set({ lang: get().lang === "es" ? "en" : "es" }),
      setLang: (lang) => set({ lang }),
    }),
    { name: "labitconf-lang" }
  )
);
