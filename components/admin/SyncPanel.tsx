import { syncSpeakersNow } from "@/app/admin/actions";
import { hoursSince, isStale, STALE_AFTER_HOURS, type SyncRun } from "@/lib/speakers/runs";

const CARD: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "12px",
  padding: "20px 22px",
  background: "rgba(255,255,255,0.02)",
};

function ago(iso: string): string {
  const h = hoursSince(iso);
  if (h < 1) return `hace ${Math.max(1, Math.round(h * 60))} min`;
  if (h < 24) return `hace ${Math.round(h)} h`;
  return `hace ${Math.round(h / 24)} d`;
}

function Stat({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div>
      <p style={{ color: warn ? "#FFAB0B" : "#FCFCFC", fontSize: "20px", fontWeight: 900, margin: 0 }}>{value}</p>
      <p style={{ color: "#A5A8B1", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", margin: "4px 0 0" }}>
        {label}
      </p>
    </div>
  );
}

/**
 * Estado del sync con la planilla de la organización.
 *
 * Resuelve el punto ciego: hasta ahora, si el sync se rompía nadie se enteraba
 * hasta que alguien notaba que la página mostraba datos viejos.
 *
 * La alerta se calcula sobre la última corrida EXITOSA y no sobre la presencia
 * de filas con error: si la función se pasa del límite de tiempo, Vercel la
 * mata sin que llegue a escribir nada. La ausencia es el único síntoma.
 */
export default function SyncPanel({ lastOk, runs }: { lastOk: SyncRun | null; runs: SyncRun[] }) {
  const stale = isStale(lastOk);

  // Tres estados, no dos:
  //   · atrasado        → hace demasiado que no hay una corrida exitosa
  //   · último fallo    → hay una exitosa reciente PERO la última intentona
  //                       falló. No es una emergencia, pero tampoco "al día":
  //                       mostrar un semáforo verde arriba de una fila FALLO
  //                       es engañoso.
  //   · al día
  const lastRunFailed = runs.length > 0 && !runs[0].ok;
  const level: "stale" | "warn" | "ok" = stale ? "stale" : lastRunFailed ? "warn" : "ok";

  const TONE = {
    stale: { color: "#E3551C", border: "rgba(227,85,28,0.5)", bg: "rgba(227,85,28,0.08)", title: "⚠ El sync está atrasado" },
    warn:  { color: "#FFAB0B", border: "rgba(255,171,11,0.45)", bg: "rgba(255,171,11,0.07)", title: "⚠ La última corrida falló" },
    ok:    { color: "#9ACE6A", border: "rgba(154,206,106,0.35)", bg: "rgba(154,206,106,0.06)", title: "✓ El sync está al día" },
  }[level];

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ color: "#FCFCFC", fontSize: "18px", fontWeight: 900, margin: 0, textTransform: "uppercase" }}>
          Sync de speakers
        </h2>
        <form action={syncSpeakersNow}>
          <button
            type="submit"
            style={{
              background: "#9ACE6A", color: "#0D0D0B", border: "none", borderRadius: "999px",
              padding: "10px 20px", fontSize: "11px", fontWeight: 900, letterSpacing: "0.1em",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Sincronizar ahora
          </button>
        </form>
      </div>

      <div
        style={{
          ...CARD,
          borderColor: TONE.border,
          background: TONE.bg,
        }}
      >
        <p style={{ color: TONE.color, fontSize: "12px", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
          {TONE.title}
        </p>
        <p style={{ color: "#A5A8B1", fontSize: "12px", margin: "8px 0 0", lineHeight: 1.6 }}>
          {lastOk
            ? `Última corrida exitosa ${ago(lastOk.finishedAt)}.`
            : "Todavía no hay ninguna corrida exitosa registrada."}
          {stale &&
            ` El cron corre cada 6 h: más de ${STALE_AFTER_HOURS} h sin éxito significa que se salteó al menos una entera.`}
          {level === "warn" && " Los datos publicados siguen siendo los de esa corrida; si el próximo intento también falla, se atrasa."}
        </p>
      </div>

      {lastOk && (
        <div style={CARD}>
          <p style={{ color: "#A5A8B1", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>
            Última corrida exitosa
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "18px" }}>
            <Stat label="Speakers" value={lastOk.read ?? "—"} />
            <Stat label="Charlas" value={lastOk.talks ?? "—"} />
            <Stat label="Fotos nuevas" value={lastOk.photos.mirrored ?? "—"} />
            <Stat label="Fotos omitidas" value={lastOk.photos.skipped ?? "—"} warn={(lastOk.photos.skipped ?? 0) > 5} />
            <Stat label="Duración" value={lastOk.ms ? `${(lastOk.ms / 1000).toFixed(1)}s` : "—"} warn={(lastOk.ms ?? 0) > 120_000} />
          </div>

          {lastOk.warnings.length > 0 && (
            <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <p style={{ color: "#FFAB0B", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
                Avisos de la última corrida
              </p>
              {lastOk.warnings.map((w, i) => (
                <p key={i} style={{ color: "#A5A8B1", fontSize: "12px", margin: "0 0 4px", lineHeight: 1.5 }}>
                  · {w}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* El deterioro se ve comparando corridas, no en una sola */}
      {runs.length > 1 && (
        <div style={CARD}>
          <p style={{ color: "#A5A8B1", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>
            Últimas corridas
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {runs.map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "baseline", gap: "12px", fontSize: "12px", flexWrap: "wrap" }}>
                <span style={{ color: r.ok ? "#9ACE6A" : "#E3551C", fontWeight: 900, minWidth: "48px" }}>
                  {r.ok ? "OK" : "FALLO"}
                </span>
                <span style={{ color: "#A5A8B1", minWidth: "80px" }}>{ago(r.finishedAt)}</span>
                <span style={{ color: "#6E7178", minWidth: "56px" }}>{r.trigger}</span>
                <span style={{ color: "#6E7178" }}>
                  {r.ok
                    ? `${r.read ?? "—"} speakers · ${r.talks ?? "—"} charlas · ${r.photos.skipped ?? 0} fotos omitidas · ${r.ms ? (r.ms / 1000).toFixed(1) + "s" : "—"}`
                    : r.error}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
