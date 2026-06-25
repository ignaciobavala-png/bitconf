# Supabase — LABITCONF 26

## Proyecto

- **ID**: `cryexzchtnerqkcchboj`
- **Tablas**: `reasons`, `rate_limit`
- **Realtime**: habilitado en `reasons` con `REPLICA IDENTITY FULL`

## Tabla `reasons`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `text` | varchar(60) | Texto de la razón |
| `ip_hash` | text NOT NULL | SHA256(ip + salt). Usar `'static'` para frases base |
| `status` | enum | `pending` / `approved` / `rejected` |
| `flagged` | boolean | Pre-marcado por blocklist server-side |
| `lane_index` | smallint | Carril del watermark (0-9) |
| `is_static` | boolean | `true` = frase editorial del admin |
| `created_at` | timestamptz | |
| `reviewed_at` | timestamptz | |
| `reviewed_by` | text | Email del moderador |

## RLS

- **Lectura pública**: solo filas con `status = 'approved'`
- **Escritura**: solo con `service_role` (desde Server Actions y API routes)

## Clientes

```ts
// Browser — lazy singleton, solo dentro de funciones/efectos
import { getSupabaseClient } from "@/lib/supabase/client";

// Server — service_role, para Server Actions y API routes
import { createServiceClient } from "@/lib/supabase/server";
```

## Panel de admin

- **URL**: `/admin` — protegido por cookie `admin_token`
- **Auth**: cookie comparada contra env var `ADMIN_SECRET`
- **Sección usuarios**: `is_static=false`, ordenado por `created_at desc`
  - Acciones: Aprobar / Rechazar (solo pendientes) + Borrar
- **Sección frases base**: `is_static=true`
  - Acciones: Activar/Desactivar (toggle `approved` ↔ `rejected`) + Borrar + Agregar

## Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_SECRET
RATE_LIMIT_SALT
```
