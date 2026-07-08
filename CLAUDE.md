@AGENTS.md

# LABITCONF 26 — Contexto del proyecto

## Fase actual: Pre-landing (en producción)

Este repo está en su **primera de tres fases**. No asumir que lo que existe es el sitio definitivo.

- **Pre-landing** (actual): pantalla interactiva para el evento — input de razones HODL + fondo animado + moderación
- **Landing** (siguiente): sitio de presentación — speakers, agenda, tickets
- **Sitio completo** (futuro): sitio con toda la información del evento

No agregar secciones, páginas ni features pensando en la landing o el sitio completo. Cada fase se define cuando llega.

## Rama `homepage` — landing definitiva (en desarrollo, aislada)

Desarrollo de la **fase 2 (Landing)** arrancó en la rama `homepage`. Reglas de esta etapa:

- **No mergear a `main` hasta que la landing esté terminada**. Se trabaja aislada; `main`/producción sigue sirviendo la pre-landing (`app/page.tsx` en `/`) sin tocarse.
- **Routing separado**: la landing nueva vive en `app/home/page.tsx` → ruta `/home`. Así conviven ambas en el mismo deploy de preview sin pisar `/`. Cuando la landing esté lista, se decide si `/home` reemplaza a `/` o cómo se resuelve el corte.
- **Sin Server Components para este maquetado**: `app/home/page.tsx` es un Client Component estático (sin fetch a Supabase ni lógica server) — por ahora es solo maquetado visual sección por sección, arrancando por el hero.
- **Referencia de diseño**: `assets-bitconf/demos-ui/pagina-home.png` (pantalla 1, hero), `assets-bitconf/demos-ui/presentacion.png` (pantalla 2, sección de presentación) y `assets-bitconf/demos-ui/tickets.png` (pantalla 3, sección de tickets).

### Carpeta `assets-bitconf/`

- Vive en la raíz del repo pero está en `.gitignore` — **no se trackea** (son ~58MB de material de diseño: `ASSETS 2D/`, `ASSETS 3D/`, `demos-ui/`).
- Sirve como banco de referencia: siempre que haya similitud lógica entre un elemento del mockup y un asset de esa carpeta, se reutiliza (ej. el hero usa `ASSETS 3D/HODL_3D_2.png`, el fondo usa `ASSETS 3D/BALLENA_FINAL.png`).
- Los assets que sí se usan en la página se copian — **comprimidos con `convert` (ImageMagick)**, nunca el original de 5-9MB — a `public/assets/home/` (esta sí trackeada en git, siguiendo la convención ya usada en `public/assets/diseños/`).

### Hero (pantalla 1) — decisiones tomadas

- Logo `LABITCONF.` + nav links (`¿Por qué hodleás?` / `Comunidad` / `Sé parte`) agrupados a la **izquierda**; botón `Tickets` a la derecha.
- Ballena de fondo (`public/assets/home/ballena.png`) con filtro `grayscale(1) brightness(3)` y opacity ~0.45 para que se vea blanca y visible, no un watermark apagado.
- HODL 3D (`public/assets/home/hodl-3d.png`) ya trae el badge de fecha/lugar/logo horneado en el render, mismo patrón que la pre-landing en producción.
- Navbar pasado a `fixed` (persiste durante todo el scroll) — así queda igual en el hero y en las secciones siguientes, tal como se ve en ambos mockups.

### Presentación (pantalla 2) — decisiones tomadas

- Sección `#presentacion` debajo del hero: título "LABITCONF" grande con textura pixel de fondo (`public/assets/home/labitconf-pixel.png`, de `ASSETS 2D/LABITCONF_pixel.png`), píldora BTC arriba a la derecha (`public/assets/home/pildora.png`, de `ASSETS 3D/PILDORA_BTC_FINAL.png`), subtítulo con "Bitcoin"/"Blockchain" en naranja `#F7931A` (naranja estándar de Bitcoin — no había un naranja definido aún en la paleta del proyecto) y dos párrafos de copy.
- El contenedor de esta sección usa `w-full max-w-6xl` **sin** `mx-auto`: centrarlo dejaba un margen vacío a la izquierda distinto al padding del navbar (que sí ocupa todo el ancho) — así el título arranca al mismo borde izquierdo que el logo `LABITCONF.`.

### Tickets (pantalla 3) — decisiones tomadas

- Sección `#tickets` debajo de presentación: título "Tickets" en verde, fondo con textura de "lluvia" de dígitos (`public/assets/home/lluvia.png`, de `ASSETS 2D/LABITCONF_LLUVIA_1.png`), honeybadger 3D abajo a la izquierda (`public/assets/home/honeybadger.png`, de `ASSETS 3D/HONEYBADGER_FINAL.png`).
- Las 3 tarjetas de ticket (General/Business/Experience) **no tienen asset dedicado** en `assets-bitconf/` — se construyeron con markup + gradientes CSS (gris metálico / blanco líquido / holográfico multicolor) replicando la estructura visual del mockup (badge de tier, "HODL" wordmark, nivel 01/02/03, tipo de pase, footer "LABITCONF 2026 — Hodl the future"), no como imagen.
- El grid de cards va en un contenedor propio `mx-auto max-w-4xl` **separado** del título "Tickets" (que sigue en `max-w-6xl` sin centrar, alineado al navbar): si el grid comparte el contenedor del título, en pantallas anchas queda pegado a la izquierda en vez de centrado en toda la sección.

### Full-bleed por pantalla

Hero, Presentación y Tickets usan `minHeight: 100vh` + `flex flex-col justify-center` — cada sección ocupa la pantalla completa (patrón "1:1 screen") para dar más presencia, en vez de alturas ajustadas al contenido.

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
