-- ═══════════════════════════════════════════════════════════
-- Temario publicado por la organización (artefacto → web)
-- ═══════════════════════════════════════════════════════════
--
-- Cada envío válido a POST /api/org/temario inserta UNA fila: el temario
-- completo ya validado y normalizado (ver lib/agenda/snapshot.ts). La web lee
-- siempre la más reciente. Se conservan las últimas 20 para poder volver atrás.
--
-- Es una tabla nueva y aditiva: no toca ninguna existente, así que la rama de
-- producción no se entera. Si no existe o está vacía, la agenda cae al temario
-- cargado a mano en lib/agenda/temario.ts.
--
-- RLS: lectura pública (es lo mismo que muestra /agenda, y el payload se arma
-- solo con campos validados, sin datos de contacto); escritura solo
-- service_role. Ojo: hacen falta las dos cosas, grants Y policies.

create table if not exists public.temario_snapshots (
  id             bigint generated always as identity primary key,
  schema         text        not null,
  generated_at   timestamptz,
  sessions_count integer     not null,
  payload        jsonb       not null,
  created_at     timestamptz not null default now()
);

alter table public.temario_snapshots enable row level security;

drop policy if exists "temario_public_read" on public.temario_snapshots;
create policy "temario_public_read"
  on public.temario_snapshots for select to anon, authenticated
  using (true);

drop policy if exists "temario_service_all" on public.temario_snapshots;
create policy "temario_service_all"
  on public.temario_snapshots for all to service_role
  using (true) with check (true);

grant select on public.temario_snapshots to anon, authenticated;
grant all on public.temario_snapshots to service_role;
