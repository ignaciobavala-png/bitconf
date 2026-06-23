@AGENTS.md

# LABITCONF 26 — Contexto del proyecto

## Fase actual: Pre-landing (en producción)

Este repo está en su **primera de tres fases**. No asumir que lo que existe es el sitio definitivo.

- **Pre-landing** (actual): pantalla interactiva para el evento — input de razones HODL + fondo animado + moderación
- **Landing** (siguiente): sitio de presentación — speakers, agenda, tickets
- **Sitio completo** (futuro): sitio con toda la información del evento

No agregar secciones, páginas ni features pensando en la landing o el sitio completo. Cada fase se define cuando llega.

## Deploy

- **Repo**: `ignaciobavala-png/bitconf` (GitHub de Ignacio)
- **Vercel**: cuenta del cliente (`weblabitconf26-1256s-projects`), proyecto `labitconf`
- **URL producción**: `https://labitconf-weblabitconf26-1256s-projects.vercel.app`
- **CI/CD**: GitHub Action en `.github/workflows/deploy.yml` — cada push a `main` despliega automáticamente usando `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID` como secrets de GitHub
- **Variables de entorno**: cargadas en el proyecto de Vercel (Production + Preview)

## Arquitectura actual

- `app/page.tsx` — pantalla principal: input con typewriter en placeholder + WatermarkLayer + vignette central
- `app/admin/` — panel de moderación protegido por cookie
- `app/admin/actions.ts` — Server Actions: `moderateReason`, `deleteReason`, `loginAction`, `logoutAction`, `addStaticPhrase`, `toggleStaticPhrase`
- `app/api/reasons/` — endpoint POST para recibir razones
- `components/WatermarkLayer.tsx` — fondo animado con 10 carriles, tamaños variados, Realtime. Ya NO tiene frases hardcodeadas — todo viene de Supabase
- `lib/supabase/client.ts` — cliente anon browser (lazy singleton con `getSupabaseClient()`)
- `lib/supabase/server.ts` — cliente service_role server (`createServiceClient()`)
- `lib/db/blocklist.ts` — validación de contenido
- `proxy.ts` — protección de rutas `/admin/*`

## Tipografía

- **PP Neue Machina** (local, en `public/assets/tipografias/neue-machina/`)
- Variable CSS: `--font-neue-machina`
- Pesos usados: 900 (Ultrabold) para labels y botones, 300 (Light) para inputs y textos secundarios

## Capas visuales en page.tsx (orden de zIndex)

1. `z=0` — Fondo.png (globo terráqueo, 58vh desde abajo). Container con `width: max(100vw, calc(58vh * 3))` centrado — garantiza que en mobile también se vea solo el horizonte, igual que desktop.
2. `z=auto` — WatermarkLayer (10 carriles scrolling)
3. `z=1` — Vignette central (radial gradient oscuro que tapa frases detrás del HODL)
4. `z=2` — HODL hero image
5. `z=3` — Degradé negro inferior (35% de la pantalla desde abajo)
6. `z=4` — UI overlay unificado: flex column con label + input + botón + status message + footer. Footer ya NO es una capa separada — está dentro de este bloque para evitar colisión en mobile.

## WatermarkLayer

- 10 carriles en `STATIC_LANES` con `y`, `duration`, `fontSize` por carril (sin frases hardcodeadas)
- Todas las frases vienen de Supabase (`reasons` donde `status=approved`)
- `is_static=true` → verde oscuro `#4A6E2D` (frases editoriales, gestionadas desde admin)
- `is_static=false` → verde claro `#9ACE6A` (frases de usuarios)
- Animación fade-in solo para frases de usuario nuevas (no para las estáticas)
- Realtime via Supabase — solo filas con `status=eq.approved`
- El cliente Supabase se inicializa lazy (dentro de `useEffect`, no a nivel módulo)

## Supabase

- Proyecto: `cryexzchtnerqkcchboj`
- Tablas: `reasons` (status enum: pending/approved/rejected), `rate_limit`
- `reasons` columnas relevantes: `text`, `ip_hash` (NOT NULL — usar `'static'` para frases base), `status`, `lane_index`, `is_static` (bool, default false), `flagged`
- Realtime habilitado en `reasons` con REPLICA IDENTITY FULL
- RLS: lectura pública solo para `status = approved`; escritura solo con service_role

## Admin panel

- Protegido por cookie `admin_token` (comparada contra `ADMIN_SECRET`)
- Sección **Razones de usuarios**: muestra solo `is_static=false`, ordenadas por `created_at` desc. Acciones: Aprobar / Rechazar (solo pendientes) + Borrar
- Sección **Frases Base**: muestra solo `is_static=true`. Acciones: Activar/Desactivar (toggle approved↔rejected) + Borrar + Formulario para agregar frase nueva con selector de carril (1-10)
- Horario en timezone `America/Argentina/Buenos_Aires`
- `export const dynamic = "force-dynamic"` — necesario para evitar prerender en build

## Cosas a tener en cuenta

- Next.js 16 renombra `middleware.ts` a `proxy.ts` y la función exportada a `proxy`. Leer `node_modules/next/dist/docs/` antes de tocar routing o proxies.
- El cliente Supabase browser NO debe instanciarse a nivel de módulo — usar siempre `getSupabaseClient()` dentro de funciones/efectos.
- `ADMIN_SECRET` en `.env.local`. En producción está en las variables de Vercel.
- El token de Vercel del cliente fue compartido en conversación — recomendado rotarlo.
