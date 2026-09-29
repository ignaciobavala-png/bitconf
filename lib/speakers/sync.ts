import { createServiceClient } from "@/lib/supabase/server";
import { fetchSpeakersFromSource, type SourceSpeaker } from "./source";
import { mirrorPhoto } from "./photos";
import { onlyCanonical } from "./tags";

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
/** Lo que llega de la planilla, salvo que venga vacío y la base ya tuviera algo. */
function keepIfEmpty<T>(incoming: T[], previous: T[] | null | undefined): T[] {
  return incoming.length ? incoming : (previous ?? []);
}

function assignSlugs(
  speakers: SourceSpeaker[],
  existing: Map<string, string>
): Map<string, string> {
  const out = new Map<string, string>();
  // Reservados: TODOS los slugs que ya están en la base, no solo los de filas
  // que siguen viniendo. Un speaker que dejó de venir (present=false) o al que
  // le corrigieron el nombre (cambia su source_key) conserva su fila y su slug,
  // y el unique de la tabla rechaza al nuevo que lo repita — rompía el sync
  // entero con "speakers_slug_key".
  const taken = new Set<string>(existing.values());

  // Primero los que ya tienen slug: conservan el suyo pase lo que pase.
  for (const s of speakers) {
    const current = existing.get(s.sourceKey);
    if (current) out.set(s.sourceKey, current);
  }

  for (const s of speakers) {
    if (out.has(s.sourceKey)) continue;
    const base = slugify(s.name) || `speaker-${s.sourceNum}`;
    let slug = taken.has(base) ? `${base}-${s.sourceNum}` : base;
    // El número de postulación no es único (ver source.ts): dos homónimos con
    // el mismo número todavía chocan, y ahí sí no queda otra que un contador.
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${s.sourceNum}-${n}`;
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

  // Estado actual: hace falta el slug (para no reasignarlo), el hash de foto
  // (para no volver a bajar lo que no cambió) y los tags (ver `keepIfEmpty`).
  const { data: current, error: readErr } = await supabase
    .from("speakers")
    .select("id, source_key, slug, photo_hash, photo_url, tags");
  if (readErr) throw new Error(`No se pudo leer speakers: ${readErr.message}`);

  // Adopción por nombre. La organización RENUMERA postulaciones (28/09/2026:
  // Gaku pasó de la #6 a la #4, casi todas se corrieron), y como la clave es
  // `num|nombre`, cada renumeración creaba una fila nueva para la misma persona:
  // la vieja quedaba ausente reteniendo el slug y la nueva salía como
  // `gaku-4`, con el link publicado en 404. Si una fila que llega no tiene
  // clave conocida y hay EXACTAMENTE una fila de la base con el mismo nombre
  // normalizado que ya no llega, es la misma persona: se le reescribe la clave
  // y conserva id, slug y foto. Con cualquier ambigüedad no se adopta nada.
  const incoming = new Set(speakers.map((s) => s.sourceKey));
  const nameOf = (key: string) => key.slice(key.indexOf("|") + 1);
  const orphansByName = new Map<string, NonNullable<typeof current>>();
  for (const r of current ?? []) {
    if (incoming.has(r.source_key as string)) continue;
    const name = nameOf(r.source_key as string);
    orphansByName.set(name, [...(orphansByName.get(name) ?? []), r]);
  }
  const known = new Set((current ?? []).map((r) => r.source_key as string));
  const newByName = new Map<string, number>();
  for (const sp of speakers) {
    if (known.has(sp.sourceKey)) continue;
    const name = nameOf(sp.sourceKey);
    newByName.set(name, (newByName.get(name) ?? 0) + 1);
  }
  let adopted = 0;
  for (const sp of speakers) {
    if (known.has(sp.sourceKey)) continue;
    const name = nameOf(sp.sourceKey);
    const orphans = orphansByName.get(name);
    if (orphans?.length !== 1 || newByName.get(name) !== 1) continue;
    const row = orphans[0];
    const { error } = await supabase
      .from("speakers")
      .update({ source_key: sp.sourceKey })
      .eq("id", row.id);
    if (error) {
      warnings.push(`${sp.name}: no se pudo adoptar la fila anterior — ${error.message}`);
      continue;
    }
    row.source_key = sp.sourceKey;
    adopted++;
  }
  if (adopted) warnings.push(`${adopted} speakers renumerados en la planilla: se conservó su fila y su slug`);

  // Segunda pasada: mismo número, nombre corregido. El 29/09/2026 la
  // organización empezó a normalizar nombres ("MAURICIO CASTILLO" pasó a
  // "Maurcio Castillo", "Catrya Catrya" perdió el apellido), y con la clave
  // `num|nombre` cada corrección salía como persona nueva con slug nuevo. Se
  // adopta si hay una sola fila ausente y una sola nueva con ese número, y
  // además comparten nombre o apellido: el número solo no alcanza, porque lo
  // renumeran.
  const firstLast = (name: string) => {
    const parts = name.split(" ").filter(Boolean);
    return [parts[0], parts.length > 1 ? parts[parts.length - 1] : null];
  };
  const numOf = (key: string) => key.slice(0, key.indexOf("|"));
  const orphansByNum = new Map<string, NonNullable<typeof current>>();
  for (const r of current ?? []) {
    if (incoming.has(r.source_key as string)) continue;
    const num = numOf(r.source_key as string);
    orphansByNum.set(num, [...(orphansByNum.get(num) ?? []), r]);
  }
  const knownNow = new Set((current ?? []).map((r) => r.source_key as string));
  const unknown = speakers.filter((sp) => !knownNow.has(sp.sourceKey));
  let renamed = 0;
  for (const sp of unknown) {
    const num = String(sp.sourceNum);
    const orphans = orphansByNum.get(num);
    if (orphans?.length !== 1) continue;
    if (unknown.filter((u) => String(u.sourceNum) === num).length !== 1) continue;
    const row = orphans[0];
    const [f1, l1] = firstLast(nameOf(sp.sourceKey));
    const [f2, l2] = firstLast(nameOf(row.source_key as string));
    if (f1 !== f2 && (!l1 || l1 !== l2)) continue;
    const { error } = await supabase
      .from("speakers")
      .update({ source_key: sp.sourceKey })
      .eq("id", row.id);
    if (error) {
      warnings.push(`${sp.name}: no se pudo adoptar la fila anterior — ${error.message}`);
      continue;
    }
    row.source_key = sp.sourceKey;
    renamed++;
  }
  if (renamed) warnings.push(`${renamed} speakers con el nombre corregido en la planilla: se conservó su fila y su slug`);

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
      landing: s.landing,
      web_order: s.webOrder,
      tags: keepIfEmpty<string>(s.tags, onlyCanonical(bySourceKey.get(s.sourceKey)?.tags)),
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

  // 28/09/2026: el tablero de la organización reescribió la columna `temas`
  // sin `abstract` ni `tags`, y el sync los borró de la base en silencio. Si la
  // planilla trae vacío algo que la base ya tenía, se conserva lo de la base y
  // se avisa. El costo: borrar a propósito un abstract en la planilla no se
  // propaga — mal menor que perder los 22 de golpe sin enterarse.
  const { data: prevTalks, error: prevErr } = await supabase
    .from("talks")
    .select("source_key, abstract, tags, raw_tags");
  if (prevErr) throw new Error(`No se pudieron leer las charlas: ${prevErr.message}`);
  const prevByKey = new Map((prevTalks ?? []).map((t) => [t.source_key as string, t]));
  let keptAbstracts = 0;
  let keptTags = 0;

  const talkRows = speakers.flatMap((s) => {
    const speakerId = idBySourceKey.get(s.sourceKey);
    if (!speakerId) return [];
    return s.talks.map((t) => {
      const prev = prevByKey.get(t.sourceKey);
      const abstract = t.abstract || (prev?.abstract as string | null) || null;
      if (!t.abstract && abstract) keptAbstracts++;
      const tags = keepIfEmpty<string>(t.tags, onlyCanonical(prev?.tags));
      if (!t.tags.length && tags.length) keptTags++;
      return {
        speaker_id: speakerId,
        source_key: t.sourceKey,
        title: t.title,
        abstract,
        description: t.description,
        tags,
        raw_tags: keepIfEmpty(t.rawTags, prev?.raw_tags as string[] | null),
        level: t.level,
        formats: t.formats,
        duration_min: t.durationMin,
        is_panel: t.isPanel,
        status: t.status,
        stage: t.stage,
        day: t.day,
        synced_at: new Date().toISOString(),
      };
    });
  });
  if (keptAbstracts || keptTags) {
    warnings.push(
      `La planilla trajo vacíos ${keptAbstracts} abstracts y ${keptTags} tags que la base ya tenía: se conservaron`
    );
  }

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
