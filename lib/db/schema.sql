-- =============================================================
-- LABITCONF 26 — Pre-landing "¿Por qué hodleás?"
-- Schema de Supabase (PostgreSQL)
-- =============================================================
-- CONTEXTO
-- La pre-landing permite que cualquier visitante escriba su
-- razón para hodlear. El texto aparece animado en el fondo.
-- El flujo es MODERADO: nada se muestra hasta que un admin
-- lo aprueba. Esto protege la pantalla en el evento en vivo.
-- =============================================================

-- ── EXTENSIONES ─────────────────────────────────────────────
create extension if not exists "pgcrypto";   -- gen_random_uuid()


-- ── ENUM: estado de moderación ──────────────────────────────
create type reason_status as enum ('pending', 'approved', 'rejected');


-- ── TABLA PRINCIPAL ─────────────────────────────────────────
create table public.reasons (
  id           uuid primary key default gen_random_uuid(),
  text         varchar(60)    not null,

  -- IP nunca se guarda en claro: sha256(raw_ip || secret_salt)
  -- El salt vive en la env var RATE_LIMIT_SALT (nunca en el repo)
  ip_hash      text           not null,

  status       reason_status  not null default 'pending',

  -- true cuando el texto matcheó la blocklist server-side.
  -- Se guarda aunque el registro quede en 'pending' para que
  -- el moderador sepa que fue pre-flagueado.
  flagged      boolean        not null default false,

  -- Lane del marquee donde debe aparecer (0-5).
  -- Se asigna en la API route, no en el cliente.
  lane_index   smallint       not null default 0,

  created_at   timestamptz    not null default now(),
  reviewed_at  timestamptz,
  reviewed_by  text           -- email del moderador (auth.users.email)
);

-- Índices para las queries más frecuentes
create index reasons_status_created_idx on public.reasons (status, created_at desc);
create index reasons_ip_hash_created_idx on public.reasons (ip_hash, created_at desc);


-- ── TABLA DE RATE LIMIT ─────────────────────────────────────
-- Ventana deslizante por ip_hash.
-- Se limpia con el cron de Supabase (ver PLAN.md).
-- Alternativa futura: reemplazar con Upstash Redis si hay
-- alta concurrencia (>500 usuarios simultáneos).
create table public.rate_limit (
  ip_hash      text        not null,
  window_start timestamptz not null default now(),
  count        integer     not null default 1,
  primary key (ip_hash, window_start)
);

create index rate_limit_ip_window_idx on public.rate_limit (ip_hash, window_start desc);
