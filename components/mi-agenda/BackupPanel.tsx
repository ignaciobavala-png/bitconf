"use client";

import { useState } from "react";
import { useAgendaStore } from "@/lib/store/agenda";
import { useLangStore } from "@/lib/store/lang";

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
    title: "¿Querés recuperarla en otro teléfono?",
    body: "Tu agenda vive en este dispositivo. Si dejás un mail, podés volver a cargarla en cualquier otro escribiendo ese mismo mail.",
    placeholder: "tu@mail.com",
    save: "Guardar",
    restore: "Recuperar",
    saving: "Guardando…",
    restoring: "Buscando…",
    saved: (n: number) => `Listo. Guardamos ${n} ${n === 1 ? "charla" : "charlas"}.`,
    restored: (n: number) => `Recuperamos ${n} ${n === 1 ? "charla" : "charlas"}.`,
    notFound: "No encontramos ninguna agenda guardada con ese mail.",
    invalid: "Revisá el mail.",
    error: "No se pudo. Probá de nuevo en un momento.",
    privacy: "Guardamos el mail encriptado, solo para encontrar tu agenda. No te vamos a escribir.",
  },
  en: {
    title: "Want it back on another phone?",
    body: "Your agenda lives on this device. Leave an email and you can load it on any other one by typing that same email.",
    placeholder: "you@mail.com",
    save: "Save",
    restore: "Restore",
    saving: "Saving…",
    restoring: "Looking…",
    saved: (n: number) => `Done. We saved ${n} ${n === 1 ? "talk" : "talks"}.`,
    restored: (n: number) => `Restored ${n} ${n === 1 ? "talk" : "talks"}.`,
    notFound: "We couldn't find an agenda saved with that email.",
    invalid: "Check the email.",
    error: "Couldn't do it. Try again in a moment.",
    privacy: "We store the email encrypted, only to find your agenda. We won't write to you.",
  },
} as const;

export default function BackupPanel() {
  const lang = useLangStore((s) => s.lang);
  const t = T[lang];

  const picked = useAgendaStore((s) => s.picked);
  const savedEmail = useAgendaStore((s) => s.savedEmail);
  const setSavedEmail = useAgendaStore((s) => s.setSavedEmail);
  const merge = useAgendaStore((s) => s.merge);

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<null | "save" | "restore">(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const value = email || savedEmail || "";

  async function call(mode: "save" | "restore") {
    if (busy) return;
    setBusy(mode);
    setMsg(null);
    try {
      const res = await fetch("/api/mi-agenda", {
        method: mode === "save" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "save" ? { email: value, talkIds: picked } : { email: value }
        ),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 400) return setMsg({ kind: "err", text: t.invalid });
      if (!res.ok) return setMsg({ kind: "err", text: data?.error ?? t.error });

      if (mode === "save") {
        setSavedEmail(value);
        setMsg({ kind: "ok", text: t.saved(data.saved ?? picked.length) });
      } else if (!data.found) {
        setMsg({ kind: "err", text: t.notFound });
      } else {
        merge(data.talkIds ?? []);
        setSavedEmail(value);
        setMsg({ kind: "ok", text: t.restored((data.talkIds ?? []).length) });
      }
    } catch {
      setMsg({ kind: "err", text: t.error });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section
      className="rounded-2xl"
      style={{ border: "1px solid rgba(230,238,242,0.14)", background: "rgba(255,255,255,0.02)", padding: "22px 24px" }}
    >
      <h2 style={{ ...labelStyle, color: "#E6EEF2", fontSize: "clamp(12px, 1.2vw, 15px)" }}>{t.title}</h2>
      <p className="mt-2" style={{ ...bodyStyle, color: "#A5A8B1", fontSize: "clamp(12px, 1.15vw, 14px)", lineHeight: 1.6, maxWidth: "56ch" }}>
        {t.body}
      </p>

      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={value}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
          className="flex-1 rounded-full outline-none transition-colors duration-200 focus:border-[#ABF760]"
          style={{
            ...bodyStyle,
            background: "rgba(230,238,242,0.04)",
            border: "1px solid rgba(230,238,242,0.18)",
            color: "#E6EEF2",
            fontSize: "clamp(13px, 1.3vw, 15px)",
            padding: "13px 22px",
          }}
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => call("save")}
            disabled={busy !== null || picked.length === 0}
            className="rounded-full transition-opacity duration-200 hover:opacity-85 disabled:opacity-40"
            style={{ ...labelStyle, color: "#171616", background: "#ABF760", fontSize: "clamp(10px, 1vw, 12px)", padding: "13px 24px" }}
          >
            {busy === "save" ? t.saving : t.save}
          </button>
          <button
            type="button"
            onClick={() => call("restore")}
            disabled={busy !== null}
            className="rounded-full transition-opacity duration-200 hover:opacity-85 disabled:opacity-40"
            style={{ ...labelStyle, color: "#E6EEF2", background: "transparent", border: "1px solid rgba(230,238,242,0.25)", fontSize: "clamp(10px, 1vw, 12px)", padding: "13px 24px" }}
          >
            {busy === "restore" ? t.restoring : t.restore}
          </button>
        </div>
      </div>

      {msg && (
        <p className="mt-4" role="status" style={{ ...bodyStyle, color: msg.kind === "ok" ? "#ABF760" : "#FFAB0B", fontSize: "clamp(12px, 1.1vw, 14px)" }}>
          {msg.text}
        </p>
      )}

      <p className="mt-4" style={{ ...bodyStyle, color: "#6E7178", fontSize: "clamp(10px, 1vw, 12px)", lineHeight: 1.5 }}>
        {t.privacy}
      </p>
    </section>
  );
}
