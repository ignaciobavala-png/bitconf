-- ═══════════════════════════════════════════════════════════
-- sync_runs — historial de corridas del sync de speakers
-- ═══════════════════════════════════════════════════════════
--
-- EL PUNTO CIEGO QUE RESUELVE: si el sync se rompe, nadie se entera hasta que
-- alguien note que la página muestra datos viejos.
--
-- `syncSpeakers()` arma un reporte completo y lo devuelve. Quien llama es el
-- cron de Vercel, que no lee la respuesta: a las 3 de la mañana ese JSON se
-- genera y se tira. Los errores al menos quedan en los logs de Vercel por el
-- console.error; las corridas exitosas, ni eso — y son las que llevan los
-- warnings.
--
-- ── Por qué columnas y no un jsonb ─────────────────────────
--
-- La gracia es poder preguntar "¿desde cuándo viene subiendo photos_skipped?".
-- Con un jsonb suelto esa consulta se vuelve incómoda. Son 4 filas por día
-- (~1.500 al año): no hay razón para optimizar el espacio.
--
-- ── Qué se ve en el historial que una corrida sola no muestra ──
--
--  · photos_skipped que sube de 5 a 12 = alguien cambió permisos en Drive.
--    Mirando una corrida sola, "12 omitidas" parece normal.
--  · warnings: el sync puede devolver ok=true con warnings adentro (JSON roto
--    en la celda `temas` de alguien, que le borra las charlas en silencio).
--  · ms: venía en ~16s y el re-keying de charlas tardó 60s. Si esa cifra sube
--    sola semana a semana, se está acercando al tope de 300s de la función.

create table if not exists public.sync_runs (
  id               uuid        primary key default gen_random_uuid(),
  finished_at      timestamptz not null default now(),
  ok               boolean     not null,

  -- 'cron' | 'manual' — para distinguir la corrida automática de la que
  -- disparamos desde el admin al probar algo.
  trigger          text        not null default 'cron',

  -- El `version` que devuelve el Apps Script: si no cambia entre corridas, la
  -- planilla no se tocó.
  source_version   text,

  read             integer,
  upserted         integer,
  talks            integer,
  photos_mirrored  integer,
  photos_unchanged integer,
  photos_skipped   integer,
  missing          integer,
  warnings         text[]      not null default '{}',

  -- Solo cuando la corrida tiró excepción (Apps Script caído, cuota, JSON roto
  -- de raíz). Ver nota de abajo sobre lo que NO se puede registrar.
  error            text,

  ms               integer
);

create index if not exists sync_runs_finished_idx on public.sync_runs (finished_at desc);
create index if not exists sync_runs_ok_finished_idx on public.sync_runs (ok, finished_at desc);


-- ── OJO: la alerta va por AUSENCIA, no por filas con error ──
--
-- Si la función se pasa de los 300 segundos, Vercel la mata y no llega a
-- escribir nada: no hay fila, ni siquiera una con ok=false. Por eso el admin
-- NO pregunta "¿hay corridas fallidas?" sino "¿cuándo fue la última exitosa?".
-- Sin noticias es mala noticia.


-- ── RLS ─────────────────────────────────────────────────────
-- Solo el servidor. El admin lee con service_role detrás de la cookie; el
-- browser no toca esta tabla.
alter table public.sync_runs enable row level security;

drop policy if exists "sync_runs_service_all" on public.sync_runs;
create policy "sync_runs_service_all"
  on public.sync_runs for all to service_role
  using (true) with check (true);
