import type { MetadataRoute } from "next";

/**
 * Manifest de la PWA "Mi Agenda".
 *
 * `start_url` y `scope` apuntan a /mi-agenda y no a la home: la app instalada
 * es la agenda del día del evento, no el sitio entero. Con ese scope, abrir la
 * app va directo al itinerario y los links al sitio salen al navegador.
 *
 * Una URL independiente de verdad (mi.labitconf.com) implicaría DNS en la
 * cuenta del cliente. No hace falta: instalada, la PWA abre en `standalone`
 * —sin barra de direcciones, con su propio ícono— así que ya se comporta como
 * una app aparte. El subdominio se puede agregar después sin tocar código.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mi Agenda — LABITCONF 26",
    short_name: "Mi Agenda",
    description:
      "Tu itinerario de LABITCONF 26. Funciona sin conexión el día del evento.",
    start_url: "/mi-agenda",
    scope: "/mi-agenda",
    display: "standalone",
    orientation: "portrait",
    background_color: "#171616",
    theme_color: "#171616",
    lang: "es-AR",
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/pwa/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
