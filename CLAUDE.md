@AGENTS.md

# LABITCONF 26 — Contexto del proyecto

## Fase actual: Pre-landing

Este repo está en su **primera de tres fases**. No asumir que lo que existe es el sitio definitivo.

- **Pre-landing** (actual): pantalla interactiva para el evento — input de razones HODL + fondo animado + moderación
- **Landing** (siguiente): sitio de presentación — speakers, agenda, tickets
- **Sitio completo** (futuro): sitio con toda la información del evento

No agregar secciones, páginas ni features pensando en la landing o el sitio completo. Cada fase se define cuando llega.

## Arquitectura actual

- `app/page.tsx` — pantalla principal (pre-landing): input + WatermarkLayer
- `app/admin/` — panel de moderación protegido por cookie
- `app/api/reasons/` — endpoint POST para recibir razones
- `components/WatermarkLayer.tsx` — fondo animado con 6 carriles y Realtime
- `lib/supabase/` — cliente anon (browser) y service_role (server)
- `lib/db/blocklist.ts` — validación de contenido
- `proxy.ts` — protección de rutas `/admin/*` (Next.js 16: middleware renombrado a proxy)

## Supabase

- Proyecto: `cryexzchtnerqkcchboj`
- Tablas: `reasons` (status enum: pending/approved/rejected), `rate_limit`
- Realtime habilitado en `reasons` con REPLICA IDENTITY FULL
- RLS: lectura pública solo para `status = approved`; escritura solo con service_role

## Cosas a tener en cuenta

- Next.js 16 renombra `middleware.ts` a `proxy.ts` y la función exportada a `proxy`. Leer `node_modules/next/dist/docs/` antes de tocar routing o proxies.
- El panel de admin usa Server Actions (`app/admin/actions.ts`) y no tiene UI de cliente — todo son forms con `action=`.
- `ADMIN_SECRET` en `.env.local` es la contraseña del panel. En producción debe ir en las variables de entorno de Vercel.
