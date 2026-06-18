import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html
      lang="es"
      className={`${barlow.variable} ${ibmPlexMono.variable} ${inter.variable} h-full`}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
