-- =============================================================
-- LABITCONF 26 — Row Level Security (Supabase)
-- =============================================================
-- REGLA GENERAL:
-- El cliente (browser) NUNCA escribe directo a Supabase.
-- Todo INSERT pasa por la API route Next.js que usa service_role.
-- El cliente solo lee: SELECT donde status = 'approved'.
-- =============================================================

alter table public.reasons enable row level security;
alter table public.rate_limit enable row level security;


-- ── reasons: lectura pública solo de aprobados ───────────────
create policy "reasons_public_read"
  on public.reasons
  for select
  to anon, authenticated
  using (status = 'approved');

-- ── reasons: inserción SOLO desde service_role (API route) ───
-- anon y authenticated NO pueden insertar directamente.
-- Esto fuerza que todo pase por /api/reasons donde están
-- las validaciones de rate limit, blocklist, etc.
create policy "reasons_service_insert"
  on public.reasons
  for insert
  to service_role
  with check (true);

-- ── reasons: update/delete solo moderadores (service_role) ───
create policy "reasons_service_update"
  on public.reasons
  for update
  to service_role
  using (true);

create policy "reasons_service_delete"
  on public.reasons
  for delete
  to service_role
  using (true);


-- ── rate_limit: solo service_role puede leer y escribir ──────
create policy "rate_limit_service_only"
  on public.rate_limit
  for all
  to service_role
  using (true)
  with check (true);


-- ── Realtime: publicar solo columnas seguras de 'approved' ───
-- Habilitar Realtime en Supabase Dashboard para la tabla reasons,
-- con filtro: status=approved. El cliente se suscribe así:
--
--   supabase
--     .channel('approved-reasons')
--     .on('postgres_changes', {
--         event: 'UPDATE',
--         schema: 'public',
--         table: 'reasons',
--         filter: 'status=eq.approved'
--       }, handler)
--     .subscribe()
--
-- IMPORTANTE: nunca suscribirse sin filtro (expondría pending/rejected).
