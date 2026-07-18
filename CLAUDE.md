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
- **No hacer push de esta rama, nunca** — la rama es 100% local. Cualquier push al repo dispara un deploy de preview en Vercel (aunque no pase a producción), y no queremos deploys del trabajo en curso en la cuenta del cliente.
- **Routing separado**: la landing nueva vive en `app/home/page.tsx` → ruta `/home`. Así conviven ambas en el mismo deploy de preview sin pisar `/`. Cuando la landing esté lista, se decide si `/home` reemplaza a `/` o cómo se resuelve el corte.
- **Sin Server Components para este maquetado**: `app/home/page.tsx` es un Client Component estático (sin fetch a Supabase ni lógica server) — por ahora es solo maquetado visual sección por sección, arrancando por el hero.
- **Referencia de diseño**: `assets-bitconf/demos-ui/pagina-home.png` (pantalla 1, hero), `assets-bitconf/demos-ui/presentacion.png` (pantalla 2, sección de presentación), `assets-bitconf/demos-ui/tickets.png` (pantalla 3, sección de tickets) y `assets-bitconf/demos-ui/speackers.png` (pantalla 4, carruseles de speakers/stats).

### Paleta oficial (fuente de verdad de color)

Definida por el cliente (`~/Descargas/paleta.jpeg`). Estos son los hex **exactos** — al colorear cualquier elemento de la landing usar siempre uno de estos, no aproximaciones:

| Nombre | HEX | Rol | Uso en la landing |
|---|---|---|---|
| Orange 021 C | `#FF4E01` | Principal — Energía \| Fuerza \| BTC \| Carácter | Naranja de marca: acentos, tinte de figuras punteadas, "Bitcoin"/"Blockchain", badges |
| Alamo del Ser | `#171616` | Principal — Misterio \| Tecnología | Fondo base de todas las secciones |
| Brote | `#ABF760` | Acento — Naturaleza \| Futuro | Verde de CTAs, bordes de botones/cards, hover |
| Lactica | `#E6EEF2` | Acompañamiento — Alma \| Transparencia | Texto claro / blanco de marca |
| Almico | `#FFAB0B` | Acento — Energía \| Calidez \| Hogar | Ámbar secundario — **aún sin uso** en la landing |
| Electric Ekko | `#1311FC` | Acento — Seguridad \| Dinamismo | Azul — **aún sin uso** en la landing |

- La paleta vieja se reemplazó por la exacta (commit de esta rama): `#F7931A → #FF4E01`, `#0D0D0B → #171616`, `#9ACE6A → #ABF760`, `#FCFCFC → #E6EEF2`.
- **No agregar colores fuera de esta tabla.** Almico y Electric Ekko están definidos pero no se usan todavía; introducirlos solo si un elemento nuevo del diseño los pide.
- Excepciones que **no** son colores de paleta y quedan como están: `#A5A8B1` (gris de texto secundario, da jerarquía sobre Lactica) y `#4A6E2D` (verde oscuro de frases estáticas del watermark, variante funcional para diferenciarlas de las de usuario). Los gradientes decorativos de las tarjetas de tickets y placeholders de speakers tampoco son colores de paleta.

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

- Sección `#presentacion` debajo del hero: título "LABITCONF" grande, píldora BTC 3D (`public/assets/home/pildora.png`, de `ASSETS 3D/PILDORA_BTC_FINAL.png`) anclada al **borde derecho de la sección** (fuera del bloque `max-w-6xl`, centrada verticalmente — antes estaba dentro del bloque de texto y pisaba el subtítulo), subtítulo con "Bitcoin"/"Blockchain" en naranja `#FF4E01` (Orange 021 C, ver Paleta oficial) y dos párrafos de copy.
- Fondo full-bleed: `public/assets/home/hashes.jpg` (de `SISTEMA DE FONDOS/ESTATICOS/HORIZONTALES/HASHES_NEGRO.png`) a opacity 0.3 + degradé vertical. La textura pixel que había detrás del título (`labitconf-pixel.png`) **se eliminó de esta sección** (quedaba como un recuadro); el asset sigue en uso en el hero de `/home/comunidad`.
- El contenedor de esta sección usa `w-full max-w-6xl` **sin** `mx-auto`: centrarlo dejaba un margen vacío a la izquierda distinto al padding del navbar (que sí ocupa todo el ancho) — así el título arranca al mismo borde izquierdo que el logo `LABITCONF.`.

### Tickets (pantalla 3) — decisiones tomadas

- Sección `#tickets` debajo de presentación: título "Tickets" en verde, fondo con textura de "lluvia" de dígitos (`public/assets/home/lluvia.png`, de `ASSETS 2D/LABITCONF_LLUVIA_1.png`), honeybadger 3D abajo a la izquierda (`public/assets/home/honeybadger.png`, de `ASSETS 3D/HONEYBADGER_FINAL.png`), anclado dentro de la sección (`bottom: 1.5rem` — con bottom negativo el `overflow-hidden` le cortaba las piernas).
- Las 3 tarjetas de ticket (General/Business/Experience) **no tienen asset dedicado** en `assets-bitconf/` — se construyeron con markup + gradientes CSS (gris metálico / blanco líquido / holográfico multicolor) replicando la estructura visual del mockup (badge de tier, "HODL" wordmark, nivel 01/02/03, tipo de pase, footer "LABITCONF 2026 — Hodl the future"), no como imagen.
- El grid de cards va en un contenedor propio `mx-auto max-w-4xl` **separado** del título "Tickets" (que sigue en `max-w-6xl` sin centrar, alineado al navbar): si el grid comparte el contenedor del título, en pantallas anchas queda pegado a la izquierda en vez de centrado en toda la sección.

### Speakers (pantalla 4) — decisiones tomadas

- Sección `#speakers`: 4 carriles horizontales en loop infinito (`framer-motion`, patrón derivado de `components/WatermarkLayer.tsx` de la pre-landing), alternando dirección fila por fila (izq/der/izq/der).
- **Loop sin saltos**: el set de cards se repite **x6** (`REPEATS = 6`) y la animación va de `0%` a `-100/REPEATS%`. Duplicar solo x2 (el patrón original) producía un "salto" visible al reiniciar el ciclo porque un set solo (4-5 cards, ~900-1500px) es más angosto que el viewport y quedaban huecos. El `gradientIndex` de cada card usa `i % lane.cards.length` para que todas las copias del set se vean iguales.
- Cada carril mezcla 3 tipos de card, todas pill/cápsula: `photo` (placeholder con gradiente en la paleta del proyecto — **no hay fotos reales de speakers/escenario/público en `assets-bitconf/`**, se reemplazan cuando haya material), `stat` (número grande + label, ej. `+256 Talks`) y `label` (texto de dos líneas, ej. "Attendees" / "LABITCONF '24").
- Fondo: `public/assets/home/pixel-grid.png` (de `ASSETS 2D/PIXEL 1.png`) con `filter: invert(1)` y opacity baja — el asset original es una grilla de puntos gris sobre blanco, se invierte para que quede sutil sobre fondo oscuro.
- Duraciones de carril entre 42-55s para que no se sincronicen visualmente entre sí.

### Comunidad (página `/home/comunidad`) — decisiones tomadas

- Ruta **anidada bajo `/home`** (`app/home/comunidad/page.tsx`): toda la fase 2 vive bajo ese prefijo y se mueve junta cuando llegue el corte final (`/home` → `/`). Se accede desde el link "Comunidad" del navbar.
- **Navbar extraído** a `components/home/Navbar.tsx` (compartido entre `/home` y `/home/comunidad`, links con prefijo `/home#...` para que funcionen desde ambas rutas). El **footer también está extraído y compartido**: `components/home/Footer.tsx` (wordmark HODL con gradiente, blurb, redes, Eventos 2026 y quick links, con `HodlReasonsSection variant="compact"` de fondo) — el footer propio de comunidad con astronauta + iconos wireframe **se eliminó** a pedido del cliente, igual que la sección "Partner universities" del Student Hub (el `LogoMarquee` de la sección Comunidades sí quedó).
- 8 pantallas según mockups (hoy en `~/Descargas/1-9.png`): hero, 3 verticales (Embajadores/Student Hub/Comunidades), grid de embajadores, CTA embajador, Student Hub, CTA hub, Comunidades + logos, CTA comunidad + footer compartido.
- Assets nuevos en `public/assets/home/`: `pildora-dots.png`, `ballena-dots.png`, `honeybadger-dots.png` (figuras punteadas, de `LABITCONF_media (15/16/7)`), `lluvia-naranja.png` (de `LABITCONF_LLUVIA_3.png`), `iconos-wireframe.png` (de `LABITCONF_media (18) 1.png`, recortado con `convert -trim` porque el original trae mucho lienzo negro).
- Las figuras punteadas son grises: se tiñen al naranja `#FF4E01` con la cadena CSS `brightness(0) saturate(100%) invert(...) sepia(...) hue-rotate(...)` (forzar a negro y recolorear) — un `sepia+hue-rotate` directo da oliva, no naranja.
- **Pendientes del cliente**: destino de los 3 botones "Inscribite acá" y del Q&A flotante (hoy `#`), copys reales de Student Hub/Comunidades, fotos de embajadores (solo card placeholder "Axel Becker"), logos de universidades y comunidades (marquee con texto "logo" placeholder).

### Full-bleed por pantalla

Hero, Presentación y Tickets usan `minHeight: 100vh` + `flex flex-col justify-center` — cada sección ocupa la pantalla completa (patrón "1:1 screen") para dar más presencia, en vez de alturas ajustadas al contenido.

### Ubicación (Costa Salguero) — decisiones tomadas

- Sección `#ubicacion`: título, dos párrafos, botón "Abrir en Google Maps" y grid de 2 (placeholder de foto con gradiente + iframe de Google Maps embebido con filtro grayscale).
- Fondo: `public/assets/home/hexmap.jpg` (de `SISTEMA DE FONDOS/ESTATICOS/HORIZONTALES/HEXMAP_NEGRO.png` — puntos tipo mapa, elegido por afinidad temática con "ubicación") a opacity 0.55 + degradé de legibilidad.
- Ballena naranja 3D a la derecha, tamaño `min(48vw, 640px)` (se duplicó del original a pedido), centrada verticalmente a `2rem` del borde.

### Sistema de animaciones (componentes compartidos)

- `components/home/Reveal.tsx` — entrada al scrollear: fade + y 28px→0, **una sola vez** (`viewport.once`), 0.7s ease-out, prop `delay` para stagger (cards escalonadas con `i * 0.12`). Acepta `className`/`style` para **sustituir** contenedores existentes (items de grid/flex) sin alterar el layout. Aplicado a todo el contenido de `/home` y `/home/comunidad` (títulos, párrafos, cards, CTAs) — no a fondos ni decoraciones.
- `components/home/Floating.tsx` — flotación idle infinita para decoraciones 3D: `y` + rotación leve en loop `mirror` easeInOut. Aplicado a honeybadger (5s), astronauta (7s), ballena naranja (6s), píldora de presentación (6s) y las 3 píldoras de comunidad (5-6.5s) — duraciones distintas a propósito para que no se sincronicen. La rotación fija de cada píldora va en el `transform` de la `<Image>` interna; el wrapper solo oscila.
- **Cuidado con `overflow-hidden` + decoraciones con `bottom` negativo**: cortaba las piernas del honeybadger y el astronauta. Las decoraciones 3D van como hijas directas de la `<section>` ancladas con offsets positivos (`bottom: 1.5-2rem`), no colgando fuera del contenedor de contenido.

### Títulos de sección — tamaño uniforme

- Los títulos son PNG (texto con estilo horneado) en `public/assets/home/titulos/`, versiones `-trim` **recortadas al texto** con `convert -trim +repage`. Los originales (lienzo 1000x500 con alturas de texto dispares: TICKETS 155px vs STUDENT HUB 67px) se **borraron del repo** — cada título se veía de un tamaño distinto.
- Se renderizan con altura fija `TITLE_H = clamp(40px, 5.5vw, 68px)` (const definida en cada página) vía `<Image fill>` + `objectFit: contain` + `objectPosition: left center`, dentro de un wrapper `relative w-full` — así todos tienen la misma altura de letra y los largos se achican solos en viewports angostos.
- Si se regeneran los recortes, **usar nombre de archivo nuevo** (caché de imágenes de Next, ver "Cosas a tener en cuenta").

### Q&A flotante (widget compartido)

- `components/home/QaChatWidget.tsx` — burbuja "Q&A" fija abajo a la derecha en `/home` y `/home/comunidad`, abre un chat de preguntas frecuentes.
- Backend en `app/api/qa-chat/route.ts` con AI SDK (`@ai-sdk/react` + `useChat` + `DefaultChatTransport`) y Groq (`@ai-sdk/groq`) como provider.

### Fondos disponibles (fuera del repo)

Además de `assets-bitconf/` (2D/3D), hay un banco de fondos en `~/Escritorio/assets bitconf/SISTEMA DE FONDOS/` (ESTATICOS/HORIZONTALES y VERTICALES): variantes negro/naranja de ballena, astronauta, honeybadger, píldora, hashes, hexmap, lluvia bit, iconos. Ya usados: `HEXMAP_NEGRO` (ubicación) y `HASHES_NEGRO` (presentación). Se copian comprimidos a JPG (`convert -quality 82`, son fondos opacos sin alfa) en `public/assets/home/`.

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
- `is_static=false` → verde claro `#9ACE6A` (frases de usuarios) — nota: la pre-landing (`WatermarkLayer.tsx`, producción) mantiene la paleta previa; la unificación a Brote `#ABF760` es solo en la landing de la rama `homepage`
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
- El optimizador de imágenes de Next cachea por URL: si se **regenera** un asset de `public/` con el mismo nombre, el dev server/navegador puede seguir sirviendo la versión vieja (ni `rm -rf .next/cache/images` alcanza por el caché del browser). Lo práctico es renombrar el archivo.
