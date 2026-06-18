# LABITCONF 26 — Plan de implementación backend

## Contexto del feature

La pre-landing permite que cualquier visitante escriba por qué hodlea.
El texto aparece animado en el marquee de fondo en tiempo real.
El flujo es **moderado**: ningún texto se muestra hasta que un admin lo aprueba.
Esto protege la pantalla en el evento en vivo frente al público.

---

## Variables de entorno necesarias

```env
# Supabase (proyecto a crear en supabase.com)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # solo para SELECT de 'approved'
SUPABASE_SERVICE_ROLE_KEY=       # para INSERT/UPDATE desde API routes (NUNCA al cliente)

# Salt para hashear IPs (string random de 32+ chars)
# Generar con: openssl rand -hex 32
RATE_LIMIT_SALT=
```

---

## Flujo completo — envío de una razón

```
[Browser]
   │
   │  POST /api/reasons
   │  body: { text: "por mi familia" }
   │  (No se envía IP desde el cliente — la lee el servidor)
   ▼
[Next.js API Route — app/api/reasons/route.ts]
   │
   ├─ 1. HONEYPOT: si viene el campo oculto "website" → 429, silencioso
   │
   ├─ 2. VALIDACIÓN BÁSICA
   │     • text presente y typeof string
   │     • length entre 2 y 60 chars
   │     • charset: /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9 .,!?'"()\-]+$/
   │     • no PII: regex detecta emails, URLs, teléfonos → 400
   │
   ├─ 3. NORMALIZACIÓN para filtro
   │     • lowercase
   │     • strip diacríticos (á→a, ñ→n)
   │     • colapsar repeticiones (loooooco → loco)
   │     • reemplazar homoglifos (0→o, 3→e, @→a)
   │
   ├─ 4. BLOCKLIST
   │     • comparar texto normalizado contra lib/db/blocklist.ts
   │     • si matchea → flagged = true (igual se inserta, queda en pending)
   │
   ├─ 5. RATE LIMIT (usando ip_hash)
   │     ip_hash = sha256(request.ip + RATE_LIMIT_SALT)
   │     Reglas:
   │     • máx 3 envíos por ip_hash en los últimos 10 minutos → 429
   │     • máx 1 envío por ip_hash por día → 429
   │     • máx 100 envíos globales por hora (todos los IPs) → 503
   │
   ├─ 6. INSERT en Supabase (service_role)
   │     • status = 'pending'
   │     • flagged = resultado del paso 4
   │     • lane_index = (total_count % 6)  — distribuye entre lanes
   │
   └─ 7. RESPUESTA al cliente
         • 201: { id, text, lane_index }
         • El frontend agrega la frase optimistamente al estado local
           (se ve para el propio usuario inmediatamente)
         • Pero NO se propaga por Realtime hasta que el admin apruebe

[Panel de moderación — /admin/moderar]
   │
   ├─ Auth: solo emails autorizados (lista en env var ADMIN_EMAILS)
   ├─ Lista de reasons con status='pending', ordenadas por created_at
   ├─ Botones: Aprobar / Rechazar
   └─ Al aprobar → UPDATE status='approved', reviewed_at, reviewed_by
                 → Supabase Realtime lo propaga a todos los clientes
                 → La frase aparece en el marquee del resto de visitantes

[Clientes conectados — Supabase Realtime]
   │
   └─ Escuchan INSERT/UPDATE donde status=eq.approved
      → Agregan la frase a su estado local → aparece en el marquee
```

---

## Reglas de rate limit — resumen

| Ventana       | Límite por IP | Límite global |
|---------------|--------------|---------------|
| 10 minutos    | 3 envíos     | —             |
| 1 día         | 1 envío      | —             |
| 1 hora        | —            | 100 envíos    |

---

## Archivos a crear (en orden)

```
lib/
├── db/
│   ├── PLAN.md            ← este archivo
│   ├── schema.sql         ← DDL de tablas
│   ├── rls.sql            ← Row Level Security
│   └── blocklist.ts       ← lista de palabras prohibidas + normalizador
│
app/
├── api/
│   └── reasons/
│       └── route.ts       ← POST handler con toda la validación
│
└── admin/
    └── moderar/
        └── page.tsx       ← Panel de moderación (protegido)
```

---

## Cron de limpieza (Supabase Dashboard → Edge Functions → Cron)

```sql
-- Limpiar rate_limit con más de 1 día de antigüedad
-- Cron: cada día a las 03:00 UTC
delete from public.rate_limit
where window_start < now() - interval '1 day';
```

---

## Decisiones de diseño y sus razones

| Decisión | Razón |
|---|---|
| IP nunca en claro | GDPR/privacidad; el hash con salt es suficiente para rate limiting |
| INSERT solo vía service_role | Si el cliente pudiera insertar directo, saltea todas las validaciones |
| `flagged` se guarda aunque quede pending | El moderador ve señales, puede aprobar igualmente si fue falso positivo |
| lane_index asignado en servidor | Evita que el cliente manipule en qué lane aparece su texto |
| Realtime con filtro status=approved | Nunca exponer pending/rejected a otros usuarios |
| Texto normalizado solo para filtro | El texto que se guarda y muestra es el original con tildes y mayúsculas |

---

## Pasos para migrar cuando se cree el proyecto Supabase

1. Crear proyecto en supabase.com
2. Copiar las 3 variables de entorno en `.env.local` y en Vercel Dashboard
3. Ejecutar `schema.sql` en el SQL Editor de Supabase
4. Ejecutar `rls.sql` en el SQL Editor de Supabase
5. Habilitar Realtime para la tabla `reasons` en el Dashboard
6. Generar `RATE_LIMIT_SALT` con `openssl rand -hex 32`
7. Instalar `@supabase/supabase-js` y `@supabase/ssr`
8. Crear `lib/supabase/client.ts` y `lib/supabase/server.ts`
9. Implementar `app/api/reasons/route.ts`
10. Implementar `app/admin/moderar/page.tsx`
11. Conectar Realtime en `WatermarkLayer.tsx`
