"use client";

/** Título de pantalla de la app: mismo cuerpo y margen en Ahora, Agenda, Speakers y Mi agenda. */
export default function ScreenTitle({
  children,
  right,
  size = 34,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
  size?: number;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h1
        className="leading-none"
        style={{
          fontFamily: "var(--font-neue-machina), sans-serif",
          fontWeight: 900,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#E6EEF2",
          fontSize: size,
        }}
      >
        {children}
      </h1>
      {right}
    </div>
  );
}
