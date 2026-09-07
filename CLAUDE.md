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

> **Histórico.** Esta página se eliminó al armar la sección MÁS de fase 2: su
> contenido vive ahora en `/mas/hub`, `/mas/embajadores` y `/mas/comunidades`,
> y `/comunidad` redirige a `/mas`. Ver "MÁS (`/mas`) — decisiones tomadas".

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

## FASE 2 — Mapa web definitivo (PDF "FASE 2 - WEB 15.08")

El cliente entregó el mapa de arquitectura de la fase 2: la web pasa de landing de
una página a **4 secciones + una capa transversal**.

- Nav: izquierda `LABITCONF | SPEAKERS | AGENDA | MÁS ▾`; derecha `COMPRAR TICKET |
  CHATEÁ CON BI | ¿POR QUÉ HODLEÁS? | ES/EN`.
- Resumen de la arquitectura: LABITCONF = descubrir · SPEAKERS = conocer ·
  AGENDA = planificar · MÁS = participar · BI = ayudarte · ¿POR QUÉ HODLEÁS? = pertenecer.
- Rama de trabajo: **`fase-2`** (salió de `main` el 2026-08-25).
- Deck para reuniones con la organización:
  `~/Escritorio/LABITCONF-2026-arquitectura-fase-2.html` (13 láminas, autocontenido).

### Etapas

| # | Etapa | Estado |
|---|---|---|
| 00 | Cambios acotados en la home (accesos rápidos + copy nuevo) | listo |
| 01 | Modelo de datos speakers/charlas + sync | listo |
| 02 | Página de speakers (`/speakers`, `/speakers/[slug]`) | listo |
| 03 | Página de agenda (`/agenda`) | listo (sin horarios) |
| 04 | Mi Agenda (local + respaldo por mail, PWA) | listo |
| 05 | Sección MÁS (Hub, embajadores, comunidades, voluntarios) | maquetada; falta material del cliente |
| 06 | Bi con datos reales de agenda | pendiente |
| 07 | Sponsors + FAQ | falta contenido |

### Accesos rápidos de la home (`#accesos`)

Sección entre el hero y la presentación con las 6 burbujas de intención del mapa.
Va **antes** de "¿Qué es LABITCONF?" a propósito: quien ya sabe a qué vino no tiene
que scrollear la presentación entera.

- `Bi` se abre desde afuera del widget con el evento `bi:open` / `openBiChat()`
  (`components/home/QaChatWidget.tsx`). El mapa define a Bi como capa transversal,
  así que cualquier sección puede abrirlo sin levantar el estado a la página.
- "Quiero ver la agenda" apunta a `PENDING_LINK` hasta que exista `/agenda`.

## MÁS (`/mas`) — decisiones tomadas

"MÁS = participar" del mapa de fase 2. Cuatro páginas propias bajo `/mas`, no
un one-pager con anchors.

- **Una ruta por item** (`/mas/hub`, `/mas/embajadores`, `/mas/comunidades`,
  `/mas/voluntarios`) más el índice `/mas`. Solo el Hub ya son cuatro bloques
  más el Student Demo Day: como sección de una página única quedaba un scroll
  interminable, y `/comunidad#student-hub` no es un link que alguien mande por
  WhatsApp. Deja lugar además para `/mas/sponsors` y `/mas/faq`, que el mapa
  visual del PDF cuelga del mismo nodo.
- **`/comunidad` se eliminó**: su contenido se repartió entre Hub, Embajadores
  y Comunidades. El link viejo va a **308 → `/mas`** desde `next.config.ts`
  (los anchors no llegan al servidor, así que no se pueden redirigir de a uno).
  Los accesos rápidos de la home apuntan ahora a `/mas/hub` y `/mas/comunidades`.
- **Navbar con dropdown `MÁS ▾`** (`components/home/Navbar.tsx`). El panel
  arranca pegado al botón con `padding-top`, no `margin`: un hueco entre ambos
  cierra el menú antes de que se llegue a clickear. Abre por hover **y** por
  click, porque en touch no hay hover. En mobile los cuatro items van
  desplegados como grupo, no detrás de otro tap.
- **`components/mas/ui.tsx`** centraliza lo que antes estaba copiado en cada
  sección de `/comunidad`: `MasSection` (fondo parallax + degradé + contenedor),
  `CopyCard`, `InlineCta`, `Chips`, `FeatureGrid`, `LogoPlaceholderGrid`,
  títulos. Son cinco páginas: repetir el markup por sección no escalaba.
- **Solo el hero de cada página es `tall` (100vh).** El patrón "1:1 screen" de
  la home no aplica acá: estos bloques son cortos y forzar pantalla completa en
  cada uno deja huecos enormes.
- Las decoraciones 3D van por la prop `decoration` de `MasSection`, que las
  monta como hijas de la `<section>` y no del bloque de texto — el astronauta
  de Voluntarios, puesto adentro, se montaba encima del párrafo.
- **`components/mas/MasNav.tsx`** — tira de cross-links al pie con los otros
  tres items. Va abajo y no como tabs fijas arriba: el navbar ya es `fixed` y
  una segunda barra fija le come media pantalla al mobile.
- **Los CTA sin formulario se dibujan apagados**, no linkeando a `#`.
  `lib/mas/links.ts` tiene el mapa de destinos: `null` = pendiente de la
  organización. Un botón muerto que parece activo es peor que uno que dice
  "formulario a confirmar".
- **Las categorías de Comunidades son etiquetas, no filtros.** El PDF pide
  filtros, pero no hay ni una comunidad cargada: un filtro que no filtra es una
  promesa vacía. Cuando llegue el listado se convierten en filtro real (mismo
  criterio que `/agenda`).
- **El título del Hub va como texto, no como el PNG existente**: el asset
  `titulos/student-hub-*-trim.png` dice "HUB DE ESTUDIANTES" y el PDF fija
  **"THE UNIVERSITY HUB"** como nombre de marca. Falta el PNG nuevo. Voluntarios
  y el índice `/mas` tampoco tienen asset de título.

### Pendientes de MÁS (material del cliente)

- **Formularios**: Hub ("Quiero sumarme"), postular universidad, Student Demo
  Day y voluntarios. Embajadores y Comunidades ya tienen su `forms.gle`.
- **Embajadores**: foto, nombre y "universo HODL" de los 6. Hoy las fichas son
  los íconos placeholder con el sello "Próximamente".
- **Logos**: universidades asociadas y comunidades asociadas (grillas punteadas).
- **Voluntarios**: los cuatro roles del listado son una propuesta a validar con
  la organización; el PDF no los enumera.
- **Títulos PNG**: "The University Hub" (nombre nuevo), "Voluntarios" y "Más".
- Del mapa visual del PDF faltan además **Sponsors**, **FAQ** y **Postulate
  como speaker** como páginas de MÁS (etapa 07).

## Feedback de la organización (03/09/2026) — qué se hizo y qué falta

Cinco pedidos. Tres implementados (commit `857339c`), dos frenados a la espera
de material y definiciones del cliente.

### Qubit (ex Bi)

- El asistente pasa a llamarse **Qubit** ("el asistente personal al cuadrado").
  Cambian los componentes (`QubitFace`, `QubitText`), el evento transversal
  (`qubit:open`) y el system prompt de `app/api/qa-chat/route.ts`. El PNG del
  asset (`bi-anteojos.png`) **no se renombró**: la cara sigue siendo la ₿
  oficial girada, que es identidad válida más allá del nombre.
- **Se presenta siempre al abrir**: el saludo es un primer mensaje del
  asistente, no el placeholder gris del estado vacío. Es la diferencia entre
  leerse como asistente propio y como chatbot genérico, que era el pedido.
- El botón lleva la palabra **CHATEÁ** a la vista (voseo, como el resto del
  sitio) y se contrae al círculo cuando el panel está abierto: ahí el label ya
  no informa nada y el título del panel lo repite.
- **Pendiente**: la organización pidió "explorar visualmente cómo presentarlo".
  Lo hecho es la variante mínima; falta llevarles 2-3 opciones.
- **Cuidado**: en `/agenda` el botón, ahora más ancho, se superpone con el
  toggle Grilla/Lista de abajo a la derecha.

### `LogoMarquee` — un solo componente para TODOS los logos

`components/home/LogoMarquee.tsx`. Pedido explícito: donde haya logos
(sponsors, partners, universidades, comunidades) nunca una fila estática,
siempre la barra en movimiento continuo, y **el mismo componente en todas las
secciones** — no una solución por sección.

- Mismo patrón de loop que los carriles de speakers de la home: el set se
  repite **x6** y la animación recorre `100/REPEATS`%. Con x2 salta, porque
  pocos logos son más angostos que el viewport.
- `LogoPlaceholderGrid` de `/mas` (la grilla estática de huecos que el feedback
  señalaba) pasó a ser `LogoStrip`, que es un envoltorio de este componente.
- Sin `items` dibuja huecos punteados. **Falta el material**: ni un logo
  cargado, ni de universidades ni de comunidades ni de sponsors.

### Mi Agenda como CTA, no como pestaña

- Sale de `LEFT_LINKS` del navbar y pasa a `components/home/MyAgendaButton.tsx`:
  solapa vertical fija sobre el **borde derecho**, a media altura, en todo el
  sitio menos `/mi-agenda`.
- Va al borde y no apilada sobre la burbuja de Qubit porque el panel del chat
  se abre desde abajo a la derecha y taparía el botón justo cuando se usa. Por
  eso además queda en `zIndex` menor que el del chat.
- **Absorbió a `AgendaCounter`** (borrado), que hacía lo mismo pero solo dentro
  de `/agenda` y solo después de elegir la primera charla.

### Identificación: alias O mail

- Un solo campo. El `@` decide cómo se valida: con arroba tiene que ser un mail
  bien formado, sin arroba un alias de **6 caracteres mínimo** sin espacios. Así
  un mail tipeado a medias no pasa como alias raro.
- `lib/itinerary/rules.ts` es **puro a propósito** (sin `crypto`): lo comparten
  el formulario y la ruta, así la validación es la misma de los dos lados.
  `lib/itinerary/identity.ts` queda solo con el hasheo.
- La columna sigue llamándose `email_hash` y el hash es el mismo sha256 con sal:
  no hubo migración.
- El riesgo aceptado: **el alias es adivinable y el mail no**. La contención es
  el rate limit por IP que ya existía, y el peor caso no es destructivo —
  `merge()` es unión, así que dos personas con el mismo alias mezclan agendas,
  no se borran. El formulario avisa que elijan uno difícil de adivinar.
- El copy de privacidad se reescribió para decir lo que el código hace de
  verdad: no se guarda el dato en claro, se guarda una huella ilegible. El
  anterior ("la información no se guarda") era literalmente falso.

### Frenados

- **EXPERIENCIAS (pestaña nueva)**: sacar jueves y domingo de la agenda y
  llevarlos a una sección propia junto con el Hackathon del Hub y los Side
  Events. **El código ya está a medio camino**: `PROGRAM` en
  `lib/speakers/schedule.ts` tiene el Open Fest y el Closing Day escritos a
  mano en ES/EN, separados de `DAYS` (los dos días con charlas). Falta definir
  si Experiencias es pestaña propia del navbar o cuelga de MÁS, qué pasa con
  HODLween (misma naturaleza, no lo nombraron), y llega material: link de Luma
  del Hackathon, listado de side events y formulario de postulación.
- **Full width**: hoy todo el sitio es `max-w-6xl`, y eso venía de los mockups
  aprobados. Antes de rehacerlo hay que decirles que "full width" no es "texto
  sin límite de ancho" (200 caracteres por línea es ilegible) y esperar la
  estructura de pestañas que ellos mismos dijeron que iban a mandar: rehacer el
  layout antes de saber qué contenido lleva cada pestaña es trabajo que se tira.

## Agenda (`/agenda`) — decisiones tomadas

Come de las mismas tablas que speakers (`getAgenda()` en `lib/speakers/queries.ts`),
con la misma RLS y el mismo `revalidate = 3600`. No hay modelo de datos nuevo.

- **Día como tabs, escenario y tema como filtros — no un wizard de tres pasos.**
  El día 31 tiene escenarios con una sola charla: obligar a elegir día → escenario
  → cronograma lleva a pantallas de un item en tres clicks. El default muestra el
  día completo con todos los escenarios; filtrar es opcional.
- El día inicial es **el primero que tenga contenido**, no `oct30` fijo: si la
  organización todavía no confirmó nada del viernes, entrar a una pantalla vacía
  parece un error del sitio.
- Los chips de escenario y de tema se calculan **por día**: el sábado no usa los
  mismos escenarios que el viernes, y un chip que no devuelve nada es una promesa
  vacía. Cambiar de día suelta el filtro de escenario.
- **Sin hora de inicio no hay grilla horaria.** Cada escenario es una columna con
  su programa (`md:grid-cols-2 xl:grid-cols-3`), no filas alineadas contra un eje
  de tiempo que no existe. `getAgenda()` ya ordena por `day → stage → starts_at`:
  cuando llegue el horario, la misma query devuelve el cronograma real.
- El aviso de "horarios a confirmar" va **una vez en el header**, no en cada
  tarjeta: repetirlo 31 veces convierte el dato en ruido. Usa Almico `#FFAB0B`
  (primer uso de ese color de la paleta en el sitio).
- El abstract solo se muestra con el filtro de escenario puesto (columna a ancho
  completo). En las columnas angostas convierte la tarjeta en un muro de texto.
- **Filtros en tira horizontal en mobile** (`overflow-x-auto`, `sm:flex-wrap`):
  con 7 escenarios + 9 temas eran diez renglones de chips antes de la primera
  charla. Verificado que no genera scroll horizontal de página (body 390/390).
- `lib/speakers/schedule.ts` centraliza días y escenarios. La ficha de speaker
  importa de ahí: las etiquetas estaban duplicadas en los dos componentes.
- `STAGE_NAMES` está **vacío a propósito** y cae a "Escenario N". Cuando la
  organización mande los nombres reales, se llena ese objeto y cambia en todo el
  sitio a la vez.

### Grilla horaria (`ScheduleGrid`) — decisiones tomadas

La organización pasó como referencia el schedule de **Nerdearla 2026** y pidió
dos cosas: **todos los escenarios de izquierda a derecha en una misma pantalla**
(sin scroll horizontal) y **el eje de horarios en la barra lateral izquierda,
respetando la duración**.

- **"Sin scroll" es horizontal, no vertical.** Con el eje respetando duración,
  el alto lo fija la jornada: 09:30→18:00 son 510 min, y a una escala legible
  la columna mide ~2040px. Meter eso en una pantalla daría bloques de 47px,
  donde no entra ni el título.
- `PX_PER_MIN = 4` — una charla de 30 min queda en 120px: entra el título en
  dos líneas más el speaker. `MIN_CARD_H = 64` es un piso que con las
  duraciones reales (mínimo 20 min = 80px) nunca se activa, así que **no puede
  hacer que dos tarjetas se pisen**.
- **La grilla sale del `max-w-6xl`** y va a `max-w-[1600px]` (solo ella; el
  header se queda). Con 7 escenarios dentro de 1152px cada columna queda en
  **145px** y no entra un título; a 1600px son ~209px.
- **Se diseñó para 7 columnas, no 6.** El s5 no aparece en la planilla pero
  existe: el día que carguen algo ahí no hay que rehacer el layout.
- **Mobile no tiene grilla.** A 390px, siete columnas dan ~45px cada una. Abajo
  de 1024 la vista es siempre la lista, igual que la referencia — que también
  tiene el toggle **Grilla/Lista**, replicado acá.
- El toggle **aparece solo cuando hay grilla que ofrecer**. Mostrarlo apagado
  en mobile o sin horarios es prometer una vista que no existe.
- **La grilla exige que TODAS las charlas visibles tengan hora** (`hasSchedule`).
  Una grilla a la que le faltan la mitad de las charlas esconde contenido sin
  avisar, que es peor que no tener grilla.
- **Color por escenario, no por tema** (el mockup pinta por track). La paleta
  tiene 6 colores pero Alamo es el fondo: como acento quedan **5** para 7
  escenarios. La segunda vuelta de `STAGE_ACCENTS` reusa los mismos hex
  mezclados con el fondo al 60% — es el mismo color más apagado, no uno nuevo.
  `stageColor()` asigna por **número** de escenario, no por orden de aparición:
  así el escenario 6 es del mismo color los dos días, que es lo que hace que el
  color sirva para ubicarse.
- **El fondo de la tarjeta es opaco (`#1D1C1C`)**, no `rgba(255,255,255,0.025)`:
  con el translúcido, las líneas de media hora se veían **a través** de la
  tarjeta y parecían cortarla. Es el mismo valor resuelto a sólido.
- **Qué entra en la tarjeta se mide, no se estima**: se descuentan padding,
  franja de hora y márgenes, y lo que sobra se reparte en líneas de título
  (`WebkitLineClamp`). Con umbrales al ojo, en un bloque de 30 min el título a
  tres líneas empujaba el nombre del speaker fuera del borde.
- `EVENT_TZ` fija la hora en Buenos Aires y **no se usa la del navegador**:
  quien abre la agenda desde Madrid tiene que leer el horario del evento. (La
  referencia sí tiene selector de zona porque es híbrida con streaming.)

### `?demo=1` — horarios de ejemplo

`lib/speakers/demo.ts` encadena las charlas de cada escenario desde la apertura
usando la duración real. **No entra a la página pública**: se activa solo con
`?demo=1`, se calcula en el browser, nunca toca la base, y la vista muestra un
cartel ámbar avisando que los horarios son inventados.

Existe porque sin él la grilla no se puede ni probar ni mostrar, y porque sirve
para llevarle a la organización una demo funcionando **a la misma reunión donde
se les pide el horario real**.

**Lo que la demo dejó a la vista**: con las 24 charlas del viernes encadenadas,
el día se termina a las 14:00 y **de 14:00 a 18:00 la grilla queda vacía**.
Ocupación real sobre los 510 min de jornada: escenario 1 → 210 min (59% vacío),
escenario 4 → 80 min (84%), sábado escenario 1 → 30 min (94%). La vista de
columnas disimulaba eso; la grilla lo expone. Es el mejor argumento para pedir
los horarios y el resto del programa.

### Pendientes de la agenda

- **Hora de inicio** — es el bloqueo principal. Sin eso no hay cronograma.
- **Nombres de los escenarios**: la planilla manda `s1`..`s7` y nada más.
  "Escenario 3" no ayuda a elegir, que es justamente para lo que sirve el filtro.
- **Falta el s5**: hay confirmadas en s1, s2, s3, s4, s6 y s7. El 5 no aparece.
- **26 de 31 charlas tienen `panel = si`.** Puede ser real (LABITCONF programa
  muchos paneles) o que en el formulario la casilla se leyera como "acepto que
  sea panel". Confirmar antes de que el badge "Panel" quede en el 84% de las
  tarjetas.
- Volumen: entre 1,5 y 3,5 h por escenario por día es poco para dos días. Los 42
  en revisión y 18 disponibles probablemente se repartan ahí.

## Mi Agenda (`/mi-agenda`) — decisiones tomadas

Itinerario personal + PWA instalable para el día del evento.

### Local primero, sin cuenta

El itinerario vive en `localStorage` vía `lib/store/agenda.ts` (zustand +
`persist`). Tocar el `+` en una charla no pide mail, ni cuenta, ni conexión.
El respaldo por mail es un paso aparte y opcional.

- `partialize` deja afuera `hydrated`: es estado de UI y persistirlo dejaría la
  marca en `true` antes de que la hidratación real ocurra.
- Todo lo que depende del store espera `hydrated` antes de dibujar. El servidor
  renderiza con `picked: []` y el cliente un instante después con lo guardado:
  sin esa espera hay mismatch de hidratación y el contador parpadea en 0.
- `merge()` es **unión, no reemplazo**. Si alguien eligió tres charlas en este
  teléfono y después recupera el respaldo, no puede perderlas. El costo es que
  "sacar una charla" no se propaga entre dispositivos hasta el siguiente
  guardado — mal mucho menor que borrarle la selección a alguien.

### Recuperación por mail, sin verificar

Decisión del equipo: mismo patrón que el rescate de QR de otro proyecto —
escribís el mail y vuelve tu itinerario, sin link de confirmación ni contraseña.
El reparo planteado (alguien puede probar mails para averiguar **quién va** al
evento, y este es público de Bitcoin) se cubre con dos cosas que no agregan
fricción:

1. **El mail se guarda hasheado** (`sha256(mail + RATE_LIMIT_SALT)`, ver
   `lib/itinerary/email.ts`). La búsqueda funciona igual porque se hashea lo que
   escribe el usuario. La tabla **nunca contiene la lista de asistentes**, ni
   para nosotros ni para quien se lleve un dump.
   **Contrapartida**: así no se les puede escribir después. Si el cliente quiere
   mandar mails, necesita una casilla de opt-in explícita y una columna aparte.
2. **Rate limit por IP** (8 en 10 min) reusando la tabla `rate_limit` que ya
   existía para las razones. Una persona real escribe su mail una o dos veces y
   nunca lo nota; probar miles se vuelve inviable.

`lib/db/itineraries.sql` — la tabla **no tiene policy de lectura para anon**: un
select directo contra PostgREST devuelve vacío aunque se tenga la anon key (que
es pública por definición). Todo pasa por `app/api/mi-agenda/route.ts`, que
corre con service_role. Verificado: anon lee `[]` y su insert da error 42501.

### La identidad de las charlas tuvo que cambiar antes

`talks.source_key` era **`speakerKey#<índice>`**. Si la organización reordenaba
las charlas de un speaker en la planilla, la que era la #0 pasaba a ser la #1 y
el upsert **reescribía la misma fila con otro contenido**: mismo uuid, adentro
otra charla.

Mientras nada guardara referencias a `talks.id` no se notaba. Con Mi Agenda sí:
un itinerario guardado apuntaría de golpe a una charla distinta. Por eso la
clave pasó a derivarse del **título normalizado** (`talkKey()` en
`lib/speakers/source.ts`). Se re-sincronizó: 93 charlas, 93 claves únicas, cero
con el formato viejo.

Corolario: si le cambian el título a una charla, la fila se borra por huérfana y
se crea otra. La API **filtra los ids que ya no existen** (`keepLiveTalks`) — se
pierde ese item del itinerario, no se rompe la página.

### PWA

- `app/manifest.ts` (API nativa de Next). `start_url` y `scope` en `/mi-agenda`,
  no en la home: la app instalada es la agenda del evento, no el sitio entero.
- **No se usó Serwist**, que es lo que recomienda la doc de Next para offline:
  necesita configuración de webpack y este proyecto compila con Turbopack. El
  service worker (`public/sw.js`) está escrito a mano y es corto.
- Estrategia: network-first para el HTML (cambia en cada deploy), cache-first
  para assets, y **`/api/*` nunca se cachea** (una respuesta vieja mostraría un
  itinerario que ya no es el guardado).
- El SW **solo se registra en producción**: en dev, cacheando el HTML deja el
  navegador sirviendo builds viejas mientras Turbopack recompila.
- Por qué importa el offline: el día del evento hay miles de personas en Costa
  Salguero saturando las antenas. Justo cuando alguien necesita mirar a qué
  escenario va es cuando peor anda el celular.
- **No hace falta subdominio.** Instalada, la PWA abre en `standalone` —sin
  barra de direcciones, con su propio ícono—, así que ya se comporta como una
  app aparte. Un `mi.labitconf.com` implicaría DNS en la cuenta del cliente y se
  puede agregar después sin tocar código.

### Pendientes

- El **dashboard** todavía no muestra nada de esto. Lo que le falta, en orden:
  estado del último sync (hoy solo se ve pegándole al endpoint a mano), botón de
  sincronizar ahora, panel de faltantes exportable para la organización, y
  **qué charlas se guarda la gente** — que es planificación de capacidad: dice
  qué sala se va a desbordar semanas antes del evento.
- Falta el acceso a `/mi-agenda` desde la home (hoy solo navbar y el contador
  flotante de `/agenda`).

## Panel de sync en el admin — el punto ciego resuelto

**El problema**: si el sync se rompía, nadie se enteraba hasta que alguien
notaba que la página mostraba datos viejos. `syncSpeakers()` arma un reporte
completo y lo devuelve, pero quien llama es el cron de Vercel, que no lee la
respuesta: a las 3 de la mañana ese JSON se generaba y se tiraba.

- `lib/db/sync-runs.sql` — tabla `sync_runs`, una fila por corrida. Columnas y
  no un `jsonb` suelto para poder preguntar "¿desde cuándo sube
  `photos_skipped`?". Son 4 filas por día, no hay nada que optimizar.
- `lib/speakers/runs.ts` — `recordRun` / `recordFailure` / `getLastOkRun` /
  `getRecentRuns` / `isStale`.
- **El registro vive en la ruta, no dentro de `syncSpeakers()`.** Así la función
  sigue siendo pura, y desde el `catch` se puede escribir la fila del fallo —
  que es la que más importa.
- **La alerta va por AUSENCIA, no por filas con error.** Si la función se pasa
  de los 300 s, Vercel la mata sin que llegue a escribir nada: no hay fila, ni
  siquiera con `ok=false`. Por eso el panel pregunta "¿cuándo fue la última
  exitosa?" y no "¿hay fallidas?". `STALE_AFTER_HOURS = 12` (el cron es cada 6,
  así que 12 significa que se salteó una entera).
- **Tres estados, no dos**: `atrasado` / `la última falló pero hay una exitosa
  reciente` / `al día`. Un semáforo verde arriba de una fila FALLO es engañoso.
- Los números grandes salen de la **última corrida exitosa**, no de la más
  reciente: si la última falló, sus contadores vienen en null y el bloque entero
  se ve como "— — —", que parece un error del panel.
- Botón **"sincronizar ahora"** (`syncSpeakersNow` en `app/admin/actions.ts`).
  Llama a `syncSpeakers()` directo en vez de hacer fetch a la ruta: ya estamos
  autenticados por cookie. Requiere `maxDuration = 300` en `app/admin/page.tsx`
  porque la Server Action corre el sync completo.
- El panel va **antes** de la moderación de razones: si el sync se rompió,
  importa más que cualquier razón pendiente.

### Lo que le falta al dashboard

- **Panel de faltantes exportable** para la organización: los 5 sin foto, las
  charlas sin día o escenario, el s5 que no aparece, confirmados sin charla.
- **Interruptor del criterio de publicación** (`estado=confirmado` vs el
  `publicado` de MKT) sin tener que editar la policy a mano.
- **Demanda de Mi Agenda**: ranking de charlas más guardadas, agrupado por
  escenario — dice qué sala se va a desbordar semanas antes del evento.
  Advertencia a decirle a la organización: solo mide a quienes dejaron el mail,
  no a quienes armaron su agenda y nunca la respaldaron. Es una muestra sesgada
  hacia el más comprometido, no el total.

## Speakers — origen de datos (planilla de la organización)

**La organización carga speakers y charlas en un Google Sheet**, expuesto por un
Google Apps Script, y lo administra desde `app-labitconf.github.io/LABITCONF-speakers/mkt.html`
(GitHub Pages estático, sin backend propio). **No se carga dos veces**: nuestro sitio
espeja esa planilla.

- Env vars: `SPEAKERS_SOURCE_URL` (el `/exec` del Apps Script) y `SPEAKERS_SOURCE_KEY`.
- Dos hojas: `Speakers` (83 filas, 38 columnas) y `MKT` (flag `publicado` si/no).
- La columna **`temas` no son etiquetas: es un JSON con las charlas** — título,
  abstract, tags, nivel, formato, duración, panel, estado, `stage` (s1..s7) y
  `day` (oct30/oct31). 93 propuestas, 33 confirmadas con día y escenario.
- **La planilla NO trae hora de inicio.** Hay día, escenario y duración, pero no
  horario. `talks.starts_at` queda nullable y la UI dice "Horario a confirmar".

### Trampas del origen (todas encontradas a los golpes)

- **`postulacion_num` NO es único**: 15 números están usados por dos personas
  distintas (el rango 25-42 aparece duplicado). Como clave de upsert rompe con
  `ON CONFLICT DO UPDATE command cannot affect row a second time`. La clave real es
  **`source_key` = num + nombre normalizado**, único en las 83 filas.
  Corolario para el cliente: **su propio flag `publicado` de la hoja MKT es ambiguo**,
  porque referencia al speaker solo por número.
- **Las fotos son links de Google Drive** (`thumbnail?id=...&sz=w400`), 77 de 78.
  Se espejan, no se linkean (Drive no es CDN, throttlea, y se rompe si mueven el
  archivo). Ver `lib/speakers/photos.ts`.
- **400x400 es el techo real de las fotos.** Probamos `sz=w1200`, `sz=w2000`,
  `lh3.googleusercontent.com/d/<id>` y `uc?export=view`: las cuatro devuelven el
  mismo archivo byte por byte. El recorte lo hace el formulario de postulación.
  Por eso el retrato del perfil es contenido (max 260px) y no un hero.
- **La respuesta del Apps Script incluye mail, whatsapp, telegram y signal.**
  `lib/speakers/source.ts` es el único lugar donde esos datos existen y **no los
  copia al resultado**: nunca llegan a la base ni al browser. Nunca hacer el fetch
  desde el cliente.
- La key del Apps Script está **a la vista en el JS público de ellos y habilita
  escritura**. Es problema de la organización, no nuestro (leemos desde el server),
  pero está reportado.
- Los tags son texto libre: 77 valores para 93 charlas, con sinónimos
  ("INTELIGENCIA ARTIFICIAL"/"IA"/"AI"). `lib/speakers/tags.ts` los mapea a 9
  filtros canónicos. Es una decisión editorial, por eso vive en el repo.

### Arquitectura del sync

- `lib/speakers/source.ts` — lee las 2 hojas, resuelve columnas **por nombre de
  encabezado** (agregan columnas seguido; hardcodear `r[19]` se rompe en silencio).
- `lib/speakers/photos.ts` — espeja al bucket `media`, path `speakers/<sha256>.jpg`.
  **Nombre por hash de contenido**, no por id del speaker: si se reemplaza una foto
  manteniendo la URL, el CDN y el optimizador de Next siguen sirviendo la vieja
  (ver "Cosas a tener en cuenta"). El hash es además el control de "¿hay que bajarla?".
- `lib/speakers/sync.ts` — upsert idempotente. Fotos de a 8 en paralelo (en serie
  tardaba 98s y se pasaba del límite de la función; ahora ~16s la primera vez, ~11s
  las siguientes). Speakers que dejan de venir se marcan `present=false`, no se
  borran (preserva slug y foto si fue un error de carga). Las charlas huérfanas sí
  se borran.
- `app/api/sync-speakers/route.ts` — cron **diario** a las 06:00 UTC
  (`vercel.json`) + manual con header `x-sync-secret: $ADMIN_SECRET`.
  **Por qué diario y no cada 6h**: la cuenta de Vercel del cliente es Hobby y
  rechaza el deploy entero —preview incluido— con un cron que corra más de una
  vez por día (`Hobby accounts are limited to daily cron jobs`). Si la cuenta
  pasa a Pro, vuelve a `0 */6 * * *` y `STALE_AFTER_HOURS` baja de 30 a 12.
- `lib/db/speakers.sql` — schema y RLS. **Qué se publica: `status = 'confirmado'`**
  (23 de 83). `mkt_published` se guarda igual para poder cambiar el criterio sin
  re-sincronizar. Pendiente de confirmar con la organización.
- `lib/speakers/queries.ts` — lectura pública **con la anon key incluso en el
  servidor**, para que la RLS siga siendo la que decide qué se publica.

### Pendientes con la organización

- Cuál flag manda para publicar: `estado=confirmado` (lo que asumimos) o el
  `publicado` de MKT (hoy marca 1 solo speaker, y es ambiguo por lo del num).
- Dónde se carga el **horario** de cada charla.
- Si existe el **original** de las fotos en algún lado (o 400x400 es todo).
- Las **5 fotos faltantes** (uno de esos speakers ya está confirmado).
- La cifra oficial de speakers: el PDF dice "+400", la planilla tiene 83.

## Deploy

- **Repo**: `ignaciobavala-png/bitconf` (GitHub de Ignacio)
- **Producción (pre-landing en vivo)**: cuenta Vercel **del CLIENTE** (`weblabitconf26-1256s-projects`, orgId `team_q3CGqNe8muKoaz9ZAGzG5kYu`), proyecto `labitconf`, dominio `www.labitconf.com` (registrador **externo**, DNS controlable).
- **CI/CD**: GitHub Action en `.github/workflows/deploy.yml` — cada push a `main` despliega a la **cuenta del cliente** usando `VERCEL_TOKEN`/`VERCEL_PROJECT_ID`/`VERCEL_ORG_ID` como secrets de GitHub.
- **Variables de entorno**: cargadas en cada proyecto de Vercel (Production + Preview).

### ⚠️ CRISIS DE CUENTA (2026-07-18) — LEER ANTES DE CUALQUIER DEPLOY

Google **suspendió** el Gmail `weblabitconf26@gmail.com`, que era el **único login** de la cuenta Vercel del cliente. **Nadie puede volver a entrar al dashboard del cliente.** Sigue vivo solo el **access token** (en `~/Escritorio/account/bitconf`, junto a la key de Groq) que sirve para deployar/API, no para configurar. La cuenta del cliente es **personal/gratuita** (no Team) → no se pueden invitar miembros.

**Solución adoptada:** la landing se publica en la cuenta Vercel **PERSONAL del dev** (team `ethoslogs-projects`/Petra-Labs, orgId `team_MUWAdp9NATyRthkhGYAPzp6H`), proyecto `labitconf` → preview en **https://labitconf.vercel.app**. A futuro se migra el dominio por DNS.

**Reglas de deploy mientras dure esta etapa:**
1. **Se deploya por CLI desde la rama `homepage` (working tree) a la cuenta PERSONAL**, NO por push:
   `vercel deploy --prod --scope=ethoslogs-projects` (estando el repo enlazado a `ethoslogs-projects/labitconf`).
2. **NUNCA `git push` a `main` en esta etapa.** Un push dispara el GitHub Action → deploya a la **cuenta del cliente** (el token sigue funcionando) y **pisaría la pre-landing en vivo** de `www.labitconf.com` con la landing. El Action está **dormido** solo porque no pusheamos.
3. **Verificar el orgId de `.vercel/project.json` antes de `vercel deploy`.** Debe ser `team_MUWAdp9...` (personal). Si es `team_q3CGqNe8...` (cliente), NO deployar: re-enlazar con `vercel link --yes --project labitconf --scope=ethoslogs-projects`.

**Secretos (fuente de verdad = `.env.local`, NO el Vercel del cliente):** Vercel marca las env vars como **sensibles/write-only** → `vercel env pull` las devuelve **vacías** (solo `NEXT_PUBLIC_SUPABASE_URL` se lee). Los 6 valores completos están en `.env.local` local. Al cargar por CLI, **`vercel env pull` escribe los valores entre comillas**; si se re-cargan sin strippear las comillas, el valor queda corrupto (ej. `Invalid supabaseUrl` → la página tira "This page couldn't load" del lado cliente). Siempre quitar comillas de los extremos antes de `vercel env add`.

**Corte final (cuando el equipo apruebe la landing):**
1. Migrar `www.labitconf.com` + `labitconf.com` al proyecto personal (agregar dominio → cargar TXT `_vercel` en el DNS externo → cambiar A/CNAME). La cuenta suspendida no se toca.
2. Merge `homepage` → `main` (main pasa a ser el sitio real).
3. **Repuntar el GitHub Action a la cuenta personal**: cambiar los 3 secrets de GitHub (`VERCEL_TOKEN`/`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID`) por los del proyecto personal. Así main auto-deploya a la cuenta del dev y la cuenta del cliente queda fuera del circuito.

Ver memoria `vercel-account-crisis-migracion.md` y `~/Escritorio/labitconf-como-sigue-el-proyecto.txt`.

## Arquitectura actual

- `app/page.tsx` — pantalla principal: input con typewriter en placeholder + WatermarkLayer + vignette central
- `app/admin/` — panel de moderación protegido por cookie
- `app/admin/actions.ts` — Server Actions: `moderateReason`, `deleteReason`, `loginAction`, `logoutAction`, `addStaticPhrase`, `toggleStaticPhrase`
- `app/api/reasons/` — endpoint POST para recibir razones
- `app/api/mi-agenda/` — PUT guarda y POST recupera un itinerario por mail hasheado
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
