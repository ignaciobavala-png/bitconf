import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const neueMachina = localFont({
  src: [
    {
      path: "../public/assets/tipografias/NEUE MACHINA/PPNeueMachina-PlainUltrabold.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/assets/tipografias/NEUE MACHINA/PPNeueMachina-PlainBold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/assets/tipografias/NEUE MACHINA/PPNeueMachina-PlainMedium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/assets/tipografias/NEUE MACHINA/PPNeueMachina-PlainRegular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/tipografias/NEUE MACHINA/PPNeueMachina-PlainLight.ttf",
      weight: "300",
      style: "normal",
    },
  ],
  variable: "--font-neue-machina",
});

export const metadata: Metadata = {
  title: "LABITCONF 26 — ¿Por qué hodleás?",
  description:
    "La conferencia de Bitcoin más grande de Latinoamérica. 30 y 31 de Octubre, Costa Salguero, Buenos Aires.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${neueMachina.variable} h-full`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
