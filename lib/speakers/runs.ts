import { createServiceClient } from "@/lib/supabase/server";
import type { SyncReport } from "./sync";

// Historial de corridas del sync — ver lib/db/sync-runs.sql para el porqué.

export type SyncRun = {
  id: string;
  finishedAt: string;
  ok: boolean;
  trigger: string;
  sourceVersion: string | null;
  read: number | null;
  upserted: number | null;
  talks: number | null;
  photos: { mirrored: number | null; unchanged: number | null; skipped: number | null };
  missing: number | null;
  warnings: string[];
  error: string | null;
  ms: number | null;
};

/**
 * El cron corre una vez por día (la cuenta de Vercel es Hobby y no permite
 * más). Treinta horas sin una corrida exitosa significa que se salteó una
 * entera: ahí algo se rompió. Si la cuenta pasa a Pro y el cron vuelve a ser
 * cada 6 horas, esto baja a 12.
 */
export const STALE_AFTER_HOURS = 30;

type Trigger = "cron" | "manual";

/** Guarda una corrida exitosa. Nunca tira: registrar no puede romper el sync. */
export async function recordRun(report: SyncReport, trigger: Trigger): Promise<void> {
  try {
    await createServiceClient()
      .from("sync_runs")
      .insert({
        ok: report.ok,
        trigger,
        source_version: report.version,
        read: report.read,
        upserted: report.upserted,
        talks: report.talks,
        photos_mirrored: report.photos.mirrored,
        photos_unchanged: report.photos.unchanged,
        photos_skipped: report.photos.skipped,
        missing: report.missing,
        warnings: report.warnings,
        ms: report.ms,
      });
  } catch (err) {
    console.error("[sync-runs] no se pudo registrar la corrida:", err);
  }
}

/**
 * Guarda una corrida que falló.
 *
 * Es la fila que más importa y la razón por la que el registro vive en la ruta
 * y no adentro de syncSpeakers(): desde el catch se puede dejar constancia de
 * que el Apps Script estaba caído.
 */
export async function recordFailure(error: unknown, trigger: Trigger, ms: number): Promise<void> {
  try {
    await createServiceClient()
      .from("sync_runs")
      .insert({
        ok: false,
        trigger,
        error: String((error as Error)?.message ?? error).slice(0, 2000),
        ms,
      });
  } catch (err) {
    console.error("[sync-runs] no se pudo registrar el fallo:", err);
  }
}

type Row = {
  id: string;
  finished_at: string;
  ok: boolean;
  trigger: string;
  source_version: string | null;
  read: number | null;
  upserted: number | null;
  talks: number | null;
  photos_mirrored: number | null;
  photos_unchanged: number | null;
  photos_skipped: number | null;
  missing: number | null;
  warnings: string[] | null;
  error: string | null;
  ms: number | null;
};

function toRun(r: Row): SyncRun {
  return {
    id: r.id,
    finishedAt: r.finished_at,
    ok: r.ok,
    trigger: r.trigger,
    sourceVersion: r.source_version,
    read: r.read,
    upserted: r.upserted,
    talks: r.talks,
    photos: { mirrored: r.photos_mirrored, unchanged: r.photos_unchanged, skipped: r.photos_skipped },
    missing: r.missing,
    warnings: r.warnings ?? [],
    error: r.error,
    ms: r.ms,
  };
}

export async function getRecentRuns(limit = 10): Promise<SyncRun[]> {
  const { data, error } = await createServiceClient()
    .from("sync_runs")
    .select("*")
    .order("finished_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[sync-runs] no se pudieron leer:", error.message);
    return [];
  }
  return ((data ?? []) as Row[]).map(toRun);
}

/**
 * Última corrida EXITOSA.
 *
 * Se pregunta por esta y no por "¿hay fallidas?" a propósito: si la función se
 * pasa del límite de tiempo, Vercel la mata sin que llegue a escribir nada. No
 * queda fila de error. El único síntoma detectable es la ausencia.
 */
export async function getLastOkRun(): Promise<SyncRun | null> {
  const { data } = await createServiceClient()
    .from("sync_runs")
    .select("*")
    .eq("ok", true)
    .order("finished_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ? toRun(data as Row) : null;
}

export function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
}

export function isStale(lastOk: SyncRun | null): boolean {
  return !lastOk || hoursSince(lastOk.finishedAt) > STALE_AFTER_HOURS;
}
