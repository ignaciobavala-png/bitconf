import { loginAction } from "@/app/admin/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0D0D0B",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-ibm-plex-mono), monospace",
      }}
    >
      <div
        style={{
          border: "2px solid #4A6E2D",
          borderRadius: "16px",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxSizing: "border-box",
        }}
      >
        <div>
          <p style={{ color: "#9ACE6A", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>
            LABITCONF 26
          </p>
          <h1
            style={{
              color: "#FCFCFC",
              fontSize: "24px",
              fontWeight: 900,
              margin: "8px 0 0",
              fontFamily: "var(--font-barlow), sans-serif",
              textTransform: "uppercase",
            }}
          >
            Panel Admin
          </h1>
        </div>

        <form action={loginAction} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            type="password"
            name="password"
            placeholder="contraseña..."
            required
            autoFocus
            style={{
              background: "transparent",
              border: "2px solid #4A6E2D",
              borderRadius: "9999px",
              padding: "12px 20px",
              color: "#FCFCFC",
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: "14px",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            style={{
              background: "#9ACE6A",
              border: "none",
              borderRadius: "9999px",
              padding: "12px 24px",
              color: "#0D0D0B",
              fontFamily: "var(--font-barlow), sans-serif",
              fontWeight: 900,
              fontSize: "14px",
              textTransform: "uppercase",
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            ENTRAR →
          </button>
        </form>

        {params.error && (
          <p style={{ color: "#E3551C", fontSize: "12px", margin: 0, textAlign: "center" }}>
            Contraseña incorrecta.
          </p>
        )}
      </div>
    </main>
  );
}
