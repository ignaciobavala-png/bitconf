import { createServiceClient } from "@/lib/supabase/server";
import { fetchSpeakersFromSource, type SourceSpeaker } from "./source";
import { mirrorPhoto } from "./photos";

// Sincronización planilla → base.
//
// Corre por cron y también a mano desde /api/sync-speakers. Es idempotente:
// correrlo dos veces seguidas no cambia nada y no vuelve a bajar ninguna foto.

export type SyncReport = {
  ok: boolean;
  version: string | null;
  read: number;
  upserted: number;
  talks: number;
  photos: { mirrored: number; unchanged: number; skipped: number };
  missing: number;
  warnings: string[];
  ms: number;
};

/** Ejecuta `fn` sobre todos los items con como mucho `limit` en vuelo, conservando el orden. */
async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

/** "Nacho Bávala" → "nacho-bavala". */
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Slugs únicos y ESTABLES.
 *
 * El slug es la URL pública del perfil, así que no puede bailar entre syncs.
 * Por eso: (1) se respeta el slug que ya tenga el speaker en la base, y
 * (2) los homónimos nuevos se desempatan con el número de postulación, que es
 * estable, en vez de con un contador que dependería del orden de las filas.
 */
function assignSlugs(
  speakers: SourceSpeaker[],
  existing: Map<string, string>
): Map<string, string> {
  const out = new Map<string, string>();
  const taken = new Set<string>();

  // Primero los que ya tienen slug: conservan el suyo pase lo que pase.
  for (const s of speakers) {
    const current = existing.get(s.sourceKey);
    if (current) {
      out.set(s.sourceKey, current);
      taken.add(current);
    }
  }

  for (const s of speakers) {
    if (out.has(s.sourceKey)) continue;
    const base = slugify(s.name) || `speaker-${s.sourceNum}`;
    const slug = taken.has(base) ? `${base}-${s.sourceNum}` : base;
    out.set(s.sourceKey, slug);
    taken.add(slug);
  }

  return out;
}

export async function syncSpeakers(): Promise<SyncReport> {
  const started = Date.now();
  const warnings: string[] = [];
  const supabase = createServiceClient();

  const { speakers, version } = await fetchSpeakersFromSource();

  // Estado actual: hace falta el slug (para no reasignarlo) y el hash de foto
  // (para no volver a bajar lo que no cambió).
  const { data: current, error: readErr } = await supabase
    .from("speakers")
    .select("id, source_key, slug, photo_hash, photo_url");
  if (readErr) throw new Error(`No se pudo leer speakers: ${readErr.message}`);

  const bySourceKey = new Map((current ?? []).map((r) => [r.source_key as string, r]));
  const slugs = assignSlugs(
    speakers,
    new Map((current ?? []).map((r) => [r.source_key as string, r.slug as string]))
  );

  const photos = { mirrored: 0, unchanged: 0, skipped: 0 };
  const rows = [];

  // En serie, las 77 descargas tardaban ~98s y el sync se pasaba del límite de
  // la función. De a 8 en paralelo baja a pocos segundos sin castigar al origen.
  const mirrored = await mapWithConcurrency(speakers, 8, (s) =>
    mirrorPhoto(supabase, s.photoSourceUrl, (bySourceKey.get(s.sourceKey)?.photo_hash as string | null) ?? null)
  );

  for (const [i, s] of speakers.entries()) {
    const prev = bySourceKey.get(s.sourceKey);
    const photo = mirrored[i];

    let photoUrl: string | null = (prev?.photo_url as string | null) ?? null;
    let photoHash: string | null = (prev?.photo_hash as string | null) ?? null;

    if (photo.status === "mirrored") {
      photos.mirrored++;
      photoUrl = photo.url;
      photoHash = photo.hash;
    } else if (photo.status === "unchanged") {
      photos.unchanged++;
      photoUrl = photo.url;
    } else {
      photos.skipped++;
      // Solo se avisa cuando había una foto que traer. Los speakers sin foto
      // cargada son un dato conocido, no un error del sync.
      if (s.photoSourceUrl) warnings.push(`#${s.sourceNum} ${s.name}: foto — ${photo.reason}`);
    }

    rows.push({
      source_key: s.sourceKey,
      source_num: s.sourceNum,
      slug: slugs.get(s.sourceKey)!,
      name: s.name,
      first_name: s.firstName,
      last_name: s.lastName,
      role: s.role,
      company: s.company,
      country: s.country,
      languages: s.languages,
      bio: s.bio,
      photo_url: photoUrl,
      photo_hash: photoHash,
      website: s.website,
      linkedin: s.linkedin,
      x_handle: s.xHandle,
      instagram: s.instagram,
      github: s.github,
      status: s.status,
      mkt_published: s.mktPublished,
      tags: s.tags,
      present: true,
      synced_at: new Date().toISOString(),
    });
  }

  if (rows.length) {
    const { error } = await supabase
      .from("speakers")
      .upsert(rows, { onConflict: "source_key" });
    if (error) throw new Error(`No se pudieron guardar speakers: ${error.message}`);
  }

  // Los ids recién ahora: las filas nuevas no tenían uno antes del upsert.
  const { data: saved, error: idErr } = await supabase
    .from("speakers")
    .select("id, source_key");
  if (idErr) throw new Error(`No se pudieron releer los ids: ${idErr.message}`);
  const idBySourceKey = new Map((saved ?? []).map((r) => [r.source_key as string, r.id as string]));

  const talkRows = speakers.flatMap((s) => {
    const speakerId = idBySourceKey.get(s.sourceKey);
    if (!speakerId) return [];
    return s.talks.map((t) => ({
      speaker_id: speakerId,
      source_key: t.sourceKey,
      title: t.title,
      abstract: t.abstract,
      description: t.description,
      tags: t.tags,
      raw_tags: t.rawTags,
      level: t.level,
      formats: t.formats,
      duration_min: t.durationMin,
      is_panel: t.isPanel,
      status: t.status,
      stage: t.stage,
      day: t.day,
      synced_at: new Date().toISOString(),
    }));
  });

  if (talkRows.length) {
    const { error } = await supabase
      .from("talks")
      .upsert(talkRows, { onConflict: "source_key" });
    if (error) throw new Error(`No se pudieron guardar charlas: ${error.message}`);
  }

  // Charlas que ya no vienen en la planilla (el speaker las borró del JSON).
  // Estas SÍ se borran: no tienen slug ni foto que preservar, y dejarlas
  // publicaría una charla que la organización dio de baja.
  const liveKeys = new Set(talkRows.map((t) => t.source_key));
  const { data: allTalks } = await supabase.from("talks").select("id, source_key");
  const orphanIds = (allTalks ?? [])
    .filter((t) => !liveKeys.has(t.source_key as string))
    .map((t) => t.id as string);
  if (orphanIds.length) {
    await supabase.from("talks").delete().in("id", orphanIds);
  }

  // Speakers que dejaron de venir: se marcan, no se borran. Si fue un error de
  // carga, el sync siguiente los revive con su slug y su foto intactos.
  const liveKeysSpeakers = new Set(speakers.map((s) => s.sourceKey));
  const missingIds = (current ?? [])
    .filter((r) => !liveKeysSpeakers.has(r.source_key as string))
    .map((r) => r.id as string);
  if (missingIds.length) {
    await supabase.from("speakers").update({ present: false }).in("id", missingIds);
  }

  return {
    ok: true,
    version,
    read: speakers.length,
    upserted: rows.length,
    talks: talkRows.length,
    photos,
    missing: missingIds.length,
    warnings,
    ms: Date.now() - started,
  };
}
