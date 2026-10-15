-- ═══════════════════════════════════════════════════════════
-- Mi Agenda — itinerarios personales
-- ═══════════════════════════════════════════════════════════
--
-- El itinerario vive PRIMERO en el dispositivo (localStorage, ver
-- lib/store/agenda.ts). Esta tabla es solo el respaldo opcional para poder
-- recuperarlo desde otro teléfono.
--
-- ── Por qué el mail se guarda hasheado ─────────────────────
--
-- La recuperación es "poné tu mail y te devuelvo tu itinerario", sin
-- verificación (decisión del equipo, mismo patrón que el rescate de QR de
-- otro proyecto). El riesgo de ese patrón es que alguien pruebe mails para
-- averiguar QUIÉN va al evento — y este es público de Bitcoin, donde bastante
-- gente elige deliberadamente no publicar dónde está.
--
-- Guardando `sha256(mail + salt)` en vez del mail:
--   · la búsqueda funciona igual (se hashea lo que escribe el usuario),
--   · la tabla NUNCA contiene la lista de asistentes, ni siquiera para
--     nosotros o para alguien que se lleve un dump.
--
-- Contrapartida a tener presente: así NO se les puede mandar un mail después.
-- Si el cliente quiere eso, necesita una casilla de opt-in explícita y una
-- columna aparte — una lista de correo sin consentimiento no se arma sola.
--
-- ── Por qué talk_ids y no una tabla de relación ────────────
--
-- Un itinerario se lee y se escribe entero, siempre. Un array evita una tabla
-- puente que nunca se consultaría por separado.
--
-- OJO con la identidad de las charlas: `talks.source_key` se deriva del título
-- (ver lib/speakers/source.ts). Si la organización le cambia el título a una
-- charla, esa fila se borra por huérfana y el id guardado acá deja de existir.
-- Por eso la lectura FILTRA contra las charlas vivas: se pierde ese item del
-- itinerario, no se rompe la página.

create table if not exists public.itineraries (
  id          uuid        primary key default gen_random_uuid(),

  -- sha256(lower(trim(mail)) + RATE_LIMIT_SALT). Nunca el mail en claro.
  email_hash  text        not null unique,

  talk_ids    uuid[]      not null default '{}',

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists itineraries_touch on public.itineraries;
create trigger itineraries_touch before update on public.itineraries
  for each row execute function public.touch_updated_at();


-- ── RLS ─────────────────────────────────────────────────────
-- Acá el criterio es más duro que en speakers/talks: el browser NO lee esta
-- tabla nunca. Sin una policy para anon, un select directo contra PostgREST
-- devuelve vacío aunque alguien tenga la anon key (que es pública por
-- definición). Todo pasa por /api/mi-agenda, que corre en el servidor con
-- service_role y aplica rate limit por IP.
--
-- Si esto tuviera una policy de lectura para anon, cualquiera podría bajarse
-- todos los itinerarios de una.
alter table public.itineraries enable row level security;

drop policy if exists "itineraries_service_all" on public.itineraries;
create policy "itineraries_service_all"
  on public.itineraries for all to service_role
  using (true) with check (true);
