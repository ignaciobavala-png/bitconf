export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { moderateReason, logoutAction, deleteReason, addStaticPhrase, toggleStaticPhrase } from "@/app/admin/actions";

type Reason = {
  id: string;
  text: string;
  status: "pending" | "approved" | "rejected";
  flagged: boolean;
  lane_index: number;
  is_static: boolean;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#A5A8B1",
  approved: "#9ACE6A",
  rejected: "#E3551C",
};

export default async function AdminPage() {
  const supabase = createServiceClient();

  const { data: reasons } = await supabase
    .from("reasons")
    .select("id, text, status, flagged, lane_index, is_static, created_at")
    .order("created_at", { ascending: false });

  const all = (reasons ?? []) as Reason[];
  const userReasons = all.filter((r) => !r.is_static);
  const staticPhrases = all.filter((r) => r.is_static);
  const pending = userReasons.filter((r) => r.status === "pending");
  const approved = userReasons.filter((r) => r.status === "approved");
  const rejected = userReasons.filter((r) => r.status === "rejected");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0D0D0B",
        padding: "40px 24px",
        fontFamily: "var(--font-neue-machina), sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ color: "#9ACE6A", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 8px" }}>
              LABITCONF 26 — MODERACIÓN
            </p>
            <h1 style={{ color: "#FCFCFC", fontSize: "28px", fontWeight: 900, margin: 0, fontFamily: "var(--font-neue-machina), sans-serif", textTransform: "uppercase" }}>
              Panel Admin
            </h1>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "2px solid #4A6E2D",
                borderRadius: "9999px",
                padding: "8px 20px",
                color: "#A5A8B1",
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              salir
            </button>
          </form>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {[
            { label: "Pendientes", count: pending.length, color: "#A5A8B1" },
            { label: "Aprobadas", count: approved.length, color: "#9ACE6A" },
            { label: "Rechazadas", count: rejected.length, color: "#E3551C" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                border: `2px solid ${s.color}22`,
                borderRadius: "12px",
                padding: "16px 24px",
                flex: 1,
                minWidth: "120px",
              }}
            >
              <p style={{ color: s.color, fontSize: "28px", fontWeight: 900, margin: "0 0 4px", fontFamily: "var(--font-neue-machina), sans-serif" }}>
                {s.count}
              </p>
              <p style={{ color: "#A5A8B1", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Lista usuarios */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {userReasons.length === 0 && (
            <p style={{ color: "#A5A8B1", fontSize: "14px" }}>No hay razones todavía.</p>
          )}
          {userReasons.map((reason) => (
            <div
              key={reason.id}
              style={{
                border: `2px solid ${reason.status === "pending" ? "#4A6E2D" : reason.status === "approved" ? "#9ACE6A33" : "#E3551C33"}`,
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              {/* Texto */}
              <div style={{ flex: 1, minWidth: "200px" }}>
                <p style={{
                  color: reason.flagged ? "#E3551C" : "#FCFCFC",
                  fontSize: "15px",
                  margin: "0 0 6px",
                  fontFamily: "var(--font-neue-machina), sans-serif",
                  fontWeight: 700,
                }}>
                  {reason.flagged ? "⚠ " : ""}{reason.text}
                </p>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{
                    color: STATUS_COLORS[reason.status],
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}>
                    {STATUS_LABELS[reason.status]}
                  </span>
                  <span style={{ color: "#4A6E2D", fontSize: "11px" }}>
                    lane {reason.lane_index} · {new Date(reason.created_at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" })}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {reason.status === "pending" && (
                  <>
                    <form action={moderateReason.bind(null, reason.id, "approved")}>
                      <button
                        type="submit"
                        style={{
                          background: "#9ACE6A",
                          border: "none",
                          borderRadius: "9999px",
                          padding: "8px 18px",
                          color: "#0D0D0B",
                          fontFamily: "var(--font-neue-machina), sans-serif",
                          fontWeight: 900,
                          fontSize: "12px",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          letterSpacing: "0.05em",
                        }}
                      >
                        ✓ Aprobar
                      </button>
                    </form>
                    <form action={moderateReason.bind(null, reason.id, "rejected")}>
                      <button
                        type="submit"
                        style={{
                          background: "transparent",
                          border: "2px solid #E3551C",
                          borderRadius: "9999px",
                          padding: "6px 16px",
                          color: "#E3551C",
                          fontFamily: "var(--font-neue-machina), sans-serif",
                          fontWeight: 900,
                          fontSize: "12px",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          letterSpacing: "0.05em",
                        }}
                      >
                        ✕ Rechazar
                      </button>
                    </form>
                  </>
                )}
                <form action={deleteReason.bind(null, reason.id)}>
                  <button
                    type="submit"
                    style={{
                      background: "transparent",
                      border: "2px solid #4A6E2D",
                      borderRadius: "9999px",
                      padding: "6px 16px",
                      color: "#4A6E2D",
                      fontFamily: "var(--font-neue-machina), sans-serif",
                      fontWeight: 700,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      letterSpacing: "0.05em",
                    }}
                  >
                    borrar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
        {/* Frases Base */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p style={{ color: "#4A6E2D", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 4px" }}>
                Frases base
              </p>
              <p style={{ color: "#A5A8B1", fontSize: "12px", margin: 0 }}>
                {staticPhrases.filter(p => p.status === "approved").length} activas · {staticPhrases.filter(p => p.status === "rejected").length} desactivadas
              </p>
            </div>
          </div>

          {/* Formulario agregar frase base */}
          <form
            action={addStaticPhrase}
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              border: "2px dashed #4A6E2D",
              borderRadius: "12px",
              padding: "16px 20px",
            }}
          >
            <input
              name="text"
              placeholder="nueva frase base..."
              required
              style={{
                flex: 1,
                minWidth: "160px",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid #4A6E2D",
                color: "#FCFCFC",
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontSize: "14px",
                outline: "none",
                padding: "4px 0",
              }}
            />
            <select
              name="lane_index"
              required
              style={{
                background: "#0D0D0B",
                border: "1px solid #4A6E2D",
                borderRadius: "8px",
                color: "#A5A8B1",
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontSize: "12px",
                padding: "4px 8px",
              }}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={i}>Carril {i + 1}</option>
              ))}
            </select>
            <button
              type="submit"
              style={{
                background: "#4A6E2D",
                border: "none",
                borderRadius: "9999px",
                padding: "8px 18px",
                color: "#0D0D0B",
                fontFamily: "var(--font-neue-machina), sans-serif",
                fontWeight: 900,
                fontSize: "12px",
                textTransform: "uppercase",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              + Agregar
            </button>
          </form>

          {/* Lista de frases base */}
          {staticPhrases.map((phrase) => (
            <div
              key={phrase.id}
              style={{
                border: `2px solid ${phrase.status === "approved" ? "#4A6E2D44" : "#A5A8B122"}`,
                borderRadius: "12px",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                opacity: phrase.status === "approved" ? 1 : 0.5,
              }}
            >
              <div style={{ flex: 1, minWidth: "200px" }}>
                <p style={{
                  color: phrase.status === "approved" ? "#FCFCFC" : "#A5A8B1",
                  fontSize: "14px",
                  margin: "0 0 4px",
                  fontFamily: "var(--font-neue-machina), sans-serif",
                }}>
                  {phrase.text}_//
                </p>
                <span style={{ color: "#4A6E2D", fontSize: "11px" }}>
                  carril {phrase.lane_index + 1}
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <form action={toggleStaticPhrase.bind(null, phrase.id, phrase.status as "approved" | "rejected")}>
                  <button
                    type="submit"
                    style={{
                      background: "transparent",
                      border: `2px solid ${phrase.status === "approved" ? "#A5A8B1" : "#9ACE6A"}`,
                      borderRadius: "9999px",
                      padding: "6px 16px",
                      color: phrase.status === "approved" ? "#A5A8B1" : "#9ACE6A",
                      fontFamily: "var(--font-neue-machina), sans-serif",
                      fontWeight: 700,
                      fontSize: "11px",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {phrase.status === "approved" ? "desactivar" : "activar"}
                  </button>
                </form>
                <form action={deleteReason.bind(null, phrase.id)}>
                  <button
                    type="submit"
                    style={{
                      background: "transparent",
                      border: "2px solid #E3551C44",
                      borderRadius: "9999px",
                      padding: "6px 16px",
                      color: "#E3551C",
                      fontFamily: "var(--font-neue-machina), sans-serif",
                      fontWeight: 700,
                      fontSize: "11px",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      letterSpacing: "0.05em",
                    }}
                  >
                    borrar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
