# LABITCONF 26 — Web

Sitio web oficial de LABITCONF 26. Costa Salguero, Buenos Aires — 30 y 31 de octubre.

---

## Fases del proyecto

| Fase | Estado | Descripción |
|---|---|---|
| **Pre-landing** | En progreso | Pantalla interactiva previa al evento — los asistentes escriben su razón para HODL y aparece en tiempo real en la pantalla del venue |
| **Landing** | Pendiente | Sitio de presentación del evento: speakers, agenda, tickets |
| **Sitio completo** | Pendiente | Sitio con toda la información del evento |

---

## Pre-landing (`/`)

Pantalla de fondo oscuro con un input central. Los asistentes escriben su razón para HODL, pasa por moderación y aparece en las filas de texto animadas del fondo en tiempo real.

### Cómo funciona

1. El asistente escribe su razón en el input y presiona HODL → o Enter
2. El texto se valida y guarda en Supabase con `status = pending`
3. Desde el panel de admin (`/admin`) se aprueba o rechaza
4. Las razones aprobadas aparecen en el fondo vía Supabase Realtime

### Anti-spam

- Honeypot oculto para bots
- Rate limit: máx. 3 envíos por IP cada 10 minutos
- Validación de charset, longitud (2–60 chars) y PII
- Blocklist (~50 términos ES/EN/PT con normalización de l33tspeak)
- Moderación manual antes de aparecer en pantalla

---

## Panel de admin (`/admin`)

Acceso protegido por contraseña. Permite aprobar o rechazar razones pendientes.

- URL: `http://localhost:3000/admin`
- Contraseña: definida en `.env.local` → `ADMIN_SECRET`

---

## Setup local

```bash
pnpm install
cp .env.local.example .env.local  # completar con tus claves
pnpm dev
```

Variables de entorno necesarias:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RATE_LIMIT_SALT=
ADMIN_SECRET=
```

---

## Stack

- **Next.js 16** (App Router)
- **Supabase** — base de datos, auth de servicio, Realtime
- **Framer Motion** — animaciones de carriles
- **Tailwind CSS v4**
