"use client";

import type { Lang } from "@/lib/store/lang";

const pillStyle: React.CSSProperties = {
  fontFamily: "var(--font-neue-machina), sans-serif",
  fontWeight: 900,
  fontSize: "clamp(10px, 0.8vw, 12px)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  textDecoration: "none",
  padding: "8px 17px",
  whiteSpace: "nowrap",
  background: "rgba(13,13,11,0.72)",
  backdropFilter: "blur(6px)",
};

interface LangToggleProps {
  lang: Lang;
  onToggle: () => void;
  className?: string;
}

export default function LangToggle({ lang, onToggle, className }: LangToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center border-2 rounded-full cursor-pointer transition-colors duration-200 border-[#4A6E2D] hover:border-[#9ACE6A] ${className ?? ""}`}
      style={pillStyle}
    >
      <span style={{ color: lang === "es" ? "#FCFCFC" : "#4A6E2D" }}>ES</span>
      <span style={{ color: "#4A6E2D", margin: "0 4px" }}>/</span>
      <span style={{ color: lang === "en" ? "#FCFCFC" : "#4A6E2D" }}>EN</span>
    </button>
  );
}
