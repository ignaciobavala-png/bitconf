import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const neueMachina = localFont({
  src: [
    {
      path: "../public/assets/tipografias/neue-machina/PPNeueMachina-PlainUltrabold.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/assets/tipografias/neue-machina/PPNeueMachina-PlainBold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/assets/tipografias/neue-machina/PPNeueMachina-PlainMedium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/assets/tipografias/neue-machina/PPNeueMachina-PlainRegular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/tipografias/neue-machina/PPNeueMachina-PlainLight.ttf",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
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
