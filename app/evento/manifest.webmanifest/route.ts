/**
 * Manifest de la app del evento (/evento).
 *
 * Es independiente del de "Mi Agenda" (app/manifest.ts): scope y start_url en
 * /evento, así la app instalada puede navegar Ahora / Agenda / Speakers / Mi
 * agenda sin salir de la ventana standalone. El manifest viejo no se toca.
 */
export const dynamic = "force-static";

export function GET() {
  const manifest = {
    name: "LABITCONF 26 — App del evento",
    short_name: "LABITCONF",
    description: "Agenda, speakers y tu itinerario de LABITCONF 26, también sin conexión.",
    id: "/evento",
    start_url: "/evento",
    scope: "/evento",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "es-AR",
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
