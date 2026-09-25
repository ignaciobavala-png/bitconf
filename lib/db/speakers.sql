-- =============================================================
-- LABITCONF 26 — Fase 2: Speakers y charlas
-- Schema de Supabase (PostgreSQL)
-- =============================================================
-- CONTEXTO
-- La organización carga speakers y charlas en un Google Sheet,
-- expuesto por un Google Apps Script. Estas tablas NO son una
-- segunda carga: son un espejo de esa planilla, refrescado por
-- /api/sync-speakers.
--
-- Por eso casi todo es "source of truth externa":
--   · nada se edita desde el sitio,
--   · cada sync hace upsert por la clave de origen,
--   · lo que desaparece de la planilla se marca, no se borra.
--
-- La planilla trae además mail, whatsapp, telegram y signal de
-- cada speaker. NADA de eso se guarda acá: el sync los descarta
-- antes de escribir. Ver lib/speakers/source.ts.
-- =============================================================

create extension if not exists "pgcrypto";


-- ── SPEAKERS ────────────────────────────────────────────────
create table if not exists public.speakers (
  id            uuid primary key default gen_random_uuid(),

  -- `postulacion_num` de la planilla. Es la clave de upsert:
  -- estable entre syncs aunque cambie el nombre o el orden.
  source_num    integer     not null unique,

  -- Derivado de `confname` en el sync. Es la URL pública del
  -- perfil (/speakers/<slug>), por eso se guarda y no se
  -- recalcula al vuelo: si cambia el nombre, el slug viejo
  -- seguiría sirviendo hasta que decidamos migrarlo.
  slug          text        not null unique,

  -- `confname`: el nombre con el que el speaker quiere figurar
  -- en la conferencia. Puede diferir de nombre + apellido.
  name          text        not null,
  first_name    text,
  last_name     text,

  role          text,                  -- cargo
  company       text,                  -- empresa
  country       text,
  languages     text[]      not null default '{}',   -- {es}, {en}, {es,en}
  bio           text,

  -- Foto ESPEJADA en nuestro storage, nunca la URL de Drive.
  -- Ver lib/speakers/photos.ts para por qué no linkeamos al origen.
  photo_url     text,
  -- sha256 del archivo original. Es lo que decide si hay que
  -- volver a bajarla: si el hash no cambió, no se toca nada.
  photo_hash    text,

  website       text,
  linkedin      text,
  x_handle      text,
  instagram     text,
  github        text,

  -- Estado crudo de la planilla, sin interpretar:
  -- confirmado | disponible | revision | rechazado | respaldo
  status        text        not null default 'revision',

  -- Flag de la hoja MKT (calendario de anuncios en redes).
  -- Se guarda aunque hoy no decida la publicación en el sitio,
  -- para poder cambiar de criterio sin volver a sincronizar.
  mkt_published boolean     not null default false,

  -- Unión de los tags canónicos de todas sus charlas.
  -- Desnormalizado a propósito: el filtro de la grilla es la
  -- query más frecuente del sitio y así no necesita join.
  tags          text[]      not null default '{}',

  -- false cuando la fila dejó de venir en la planilla.
  -- No se borra: si fue un error de carga, el sync siguiente
  -- la revive sin perder el slug ni la foto espejada.
  present       boolean     not null default true,

  synced_at     timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists speakers_status_idx  on public.speakers (status) where present;
create index if not exists speakers_tags_idx    on public.speakers using gin (tags);
create index if not exists speakers_country_idx on public.speakers (country);


-- ── TALKS ───────────────────────────────────────────────────
-- Vienen embebidas como JSON en la columna `temas` de cada
-- speaker. Un speaker puede proponer varias.
create table if not exists public.talks (
  id            uuid primary key default gen_random_uuid(),

  speaker_id    uuid        not null references public.speakers(id) on delete cascade,

  -- "<source_num>#<indice en el JSON>". La planilla no le da id
  -- propio a cada charla, así que la posición es lo único
  -- estable que hay. Si reordenan el JSON, el upsert reasigna:
  -- aceptable porque nada externo referencia una charla todavía.
  source_key    text        not null unique,

  title         text        not null,
  abstract      text,
  description   text,

  tags          text[]      not null default '{}',   -- canónicos
  raw_tags      text[]      not null default '{}',   -- como los escribió la organización

  level         text,                  -- general | intermedio | avanzado | todos
  formats       text[]      not null default '{}',   -- charla | panel | taller
  duration_min  integer,
  is_panel      boolean     not null default false,

  status        text        not null default 'revision',
  stage         text,                  -- s1..s7
  day           text,                  -- oct30 | oct31

  -- La planilla todavía NO trae hora de inicio: hay día,
  -- escenario y duración, pero no el horario. Queda nullable
  -- hasta que la organización defina dónde se carga.
  starts_at     timestamptz,

  synced_at     timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists talks_speaker_idx on public.talks (speaker_id);
create index if not exists talks_tags_idx    on public.talks using gin (tags);
create index if not exists talks_sched_idx   on public.talks (day, stage, starts_at);


-- ── updated_at automático ───────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists speakers_touch on public.speakers;
create trigger speakers_touch before update on public.speakers
  for each row execute function public.touch_updated_at();

drop trigger if exists talks_touch on public.talks;
create trigger talks_touch before update on public.talks
  for each row execute function public.touch_updated_at();


-- ── RLS ─────────────────────────────────────────────────────
-- Mismo criterio que `reasons`: el browser solo lee, y solo lo
-- que está publicado. Toda escritura pasa por el sync, que usa
-- service_role.
alter table public.speakers enable row level security;
alter table public.talks    enable row level security;

-- Qué es "publicado" para el sitio: estado = 'confirmado'.
-- La hoja MKT tiene su propio flag `publicado`, pero hoy marca
-- un solo speaker porque lleva el calendario de anuncios en
-- redes, no la publicación en la web. Pendiente de confirmar
-- con la organización; si cambia el criterio, se reemplaza esta
-- policy y no hace falta re-sincronizar (mkt_published ya está
-- guardado).
drop policy if exists "speakers_public_read" on public.speakers;
create policy "speakers_public_read"
  on public.speakers for select to anon, authenticated
  using (present and status = 'confirmado');

drop policy if exists "talks_public_read" on public.talks;
create policy "talks_public_read"
  on public.talks for select to anon, authenticated
  using (
    status = 'confirmado'
    and exists (
      select 1 from public.speakers s
      where s.id = talks.speaker_id and s.present and s.status = 'confirmado'
    )
  );

-- Escritura: solo el sync (service_role).
drop policy if exists "speakers_service_write" on public.speakers;
create policy "speakers_service_write"
  on public.speakers for all to service_role
  using (true) with check (true);

drop policy if exists "talks_service_write" on public.talks;
create policy "talks_service_write"
  on public.talks for all to service_role
  using (true) with check (true);
