# Arquitectura — LABITCONF 26

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.9 (App Router) |
| Runtime | React 19.2.4 |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS v4 |
| Base de datos | Supabase (PostgreSQL) |
| Deploy | Vercel (cuenta del cliente `weblabitconf26-1256s-projects`) |

## Fases del proyecto

1. **Pre-landing** (actual) — pantalla interactiva: input de razones HODL + fondo animado + moderación
2. **Landing** (siguiente) — speakers, agenda, tickets
3. **Sitio completo** (futuro) — toda la info del evento

## Estructura de archivos

```
app/
  page.tsx          # Pantalla principal
  layout.tsx        # Root layout + metadata (favicon, SEO)
  globals.css       # Estilos globales
  admin/
    page.tsx        # Panel de moderación
    login/          # Login del admin
    actions.ts      # Server Actions: moderar, borrar, frases base
  api/
    reasons/        # POST /api/reasons — recibe razones de usuarios

components/
  WatermarkLayer.tsx  # Fondo animado con frases en Realtime

lib/
  supabase/
    client.ts       # Cliente anon browser (lazy singleton)
    server.ts       # Cliente service_role server
  db/
    blocklist.ts    # Validación de contenido
    schema.sql      # Schema PostgreSQL
    rls.sql         # Row Level Security policies

public/
  favicon.ico       # 32x32 — fallback para browsers que lo piden directo
  icon.png          # 512x512 sRGB — favicon principal
  apple-icon.png    # 180x180 — iOS
  assets/
    diseños/        # Imágenes: Fondo.png, HODL (4).png
    tipografias/    # PP Neue Machina (local)

proxy.ts            # Protección de rutas /admin/* (Next.js 16: antes middleware.ts)
```

## Capas visuales (z-index en page.tsx)

| z | Capa |
|---|---|
| 0 | Fondo.png (globo terráqueo, 58vh desde abajo, opacity 0.5) |
| auto | WatermarkLayer (10 carriles scrolling con frases de Supabase) |
| 1 | Vignette central (radial gradient que tapa frases detrás del HODL) |
| 2 | HODL hero image |
| 3 | Degradé negro inferior (35% desde abajo) |
| 4 | UI overlay: label + input + botón + status + footer |
| 5 | CTAs top-right (Speaker, Sponsor) + toggle ES/EN top-left |

## Notas importantes

- **Next.js 16**: `middleware.ts` se renombró a `proxy.ts`, la función exportada es `proxy`.
- **Cliente Supabase browser**: siempre inicializar dentro de funciones/efectos via `getSupabaseClient()`, nunca a nivel de módulo.
- **Favicon**: los iconos viven en `public/` (no en `app/`). El `app/favicon.ico` default de Next.js fue eliminado porque sobreescribía el ícono custom. Los paths están declarados explícitamente en `metadata.icons` en `layout.tsx`.
