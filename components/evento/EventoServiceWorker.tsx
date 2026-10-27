"use client";

import { useEffect } from "react";

/** Registra /evento-sw.js solo en producción (en dev cachearía builds viejas). */
export default function EventoServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/evento-sw.js", { scope: "/evento" }).catch(() => {});
  }, []);
  return null;
}
