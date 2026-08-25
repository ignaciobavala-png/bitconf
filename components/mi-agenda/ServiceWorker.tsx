"use client";

import { useEffect } from "react";

/**
 * Registra el service worker. Solo en producción: en dev, Turbopack recompila
 * y un SW cacheando el HTML deja el navegador sirviendo builds viejas.
 */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/mi-agenda" }).catch(() => {
      // Sin SW la página funciona igual, solo pierde el offline.
    });
  }, []);
  return null;
}
