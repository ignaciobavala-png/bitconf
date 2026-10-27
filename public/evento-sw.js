// Service worker de la app del evento (/evento). Independiente de /sw.js (Mi Agenda).
//
// El día del evento las antenas de Costa Salguero se saturan: al instalar se
// precargan las cuatro pantallas, y después network-first para el HTML y
// cache-first para assets. /api/* nunca se cachea.

const CACHE = "evento-v1";
const SHELL = ["/evento", "/evento/agenda", "/evento/speakers", "/evento/mi-agenda"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // allSettled: si una pantalla falla al precargar no se cae la instalación.
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith("evento-") && k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      if (req.mode === "navigate") {
        try {
          const fresh = await fetch(req);
          if (fresh.ok) cache.put(req, fresh.clone());
          return fresh;
        } catch {
          return (await cache.match(req)) ?? (await cache.match("/evento")) ?? Response.error();
        }
      }
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const fresh = await fetch(req);
        if (fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return Response.error();
      }
    })()
  );
});
