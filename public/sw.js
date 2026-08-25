// Service worker de "Mi Agenda".
//
// Escrito a mano a propósito: la doc de Next recomienda Serwist para offline,
// pero Serwist necesita configuración de webpack y este proyecto compila con
// Turbopack. Lo que hace falta acá es corto y no justifica cambiar el bundler.
//
// POR QUÉ IMPORTA EL OFFLINE: el día del evento hay miles de personas en Costa
// Salguero saturando las antenas. Justo cuando alguien necesita mirar a qué
// escenario va, es cuando peor anda el celular. Con esto, la agenda que ya vio
// una vez sigue estando.

const CACHE = "mi-agenda-v1";

// Cache-first para lo que no cambia (assets con hash en el nombre) y
// network-first para el HTML, que sí cambia con cada deploy.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(["/mi-agenda"])).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // El respaldo por mail nunca se cachea: una respuesta vieja mostraría un
  // itinerario que ya no es el guardado.
  if (url.pathname.startsWith("/api/")) return;

  const isDocument = req.mode === "navigate";

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);

      if (isDocument) {
        // Network-first: si hay señal se ve lo último; si no, lo guardado.
        try {
          const fresh = await fetch(req);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          return (await cache.match(req)) ?? (await cache.match("/mi-agenda")) ?? Response.error();
        }
      }

      // Cache-first para assets.
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
