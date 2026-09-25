import { createClient } from "@supabase/supabase-js";
import type { CanonicalTag } from "./tags";

// Lectura pública de speakers y charlas.
//
// Usa la anon key a propósito, incluso corriendo en el servidor: así la RLS
// sigue siendo la que decide qué se publica (present + status = 'confirmado') y
// no hay forma de que un error de este archivo filtre una postulación en
// revisión o rechazada. El service_role queda solo para el sync.

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export type SpeakerCard = {
  slug: string;
  name: string;
  role: string | null;
  company: string | null;
  country: string | null;
  photoUrl: string | null;
  tags: CanonicalTag[];
};

export type SpeakerTalk = {
  title: string;
  abstract: string | null;
  tags: CanonicalTag[];
  level: string | null;
  durationMin: number | null;
  isPanel: boolean;
  stage: string | null;
  day: string | null;
};

export type SpeakerProfile = SpeakerCard & {
  bio: string | null;
  languages: string[];
  website: string | null;
  linkedin: string | null;
  xHandle: string | null;
  instagram: string | null;
  github: string | null;
  talks: SpeakerTalk[];
};

const CARD_COLUMNS = "slug, name, role, company, country, photo_url, tags";

type CardRow = {
  slug: string;
  name: string;
  role: string | null;
  company: string | null;
  country: string | null;
  photo_url: string | null;
  tags: string[] | null;
};

function toCard(r: CardRow): SpeakerCard {
  return {
    slug: r.slug,
    name: r.name,
    role: r.role,
    company: r.company,
    country: r.country,
    photoUrl: r.photo_url,
    tags: (r.tags ?? []) as CanonicalTag[],
  };
}

/**
 * Todos los speakers publicables.
 *
 * Se ordena por nombre y no por relevancia: cualquier otro criterio (por tags,
 * por cantidad de charlas) implica una jerarquía entre personas que la
 * organización no definió. Alfabético es el único orden que no dice nada.
 */
export async function getSpeakers(): Promise<SpeakerCard[]> {
  const { data, error } = await publicClient()
    .from("speakers")
    .select(CARD_COLUMNS)
    .order("name", { ascending: true });

  if (error) {
    // La grilla vacía es preferible a romper la página entera: el resto del
    // sitio no depende de esto.
    console.error("[speakers] no se pudieron leer:", error.message);
    return [];
  }
  return ((data ?? []) as CardRow[]).map(toCard);
}

export async function getSpeakerBySlug(slug: string): Promise<SpeakerProfile | null> {
  const supabase = publicClient();

  const { data, error } = await supabase
    .from("speakers")
    .select(
      `${CARD_COLUMNS}, bio, languages, website, linkedin, x_handle, instagram, github,
       talks ( title, abstract, tags, level, duration_min, is_panel, stage, day )`
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as CardRow & {
    bio: string | null;
    languages: string[] | null;
    website: string | null;
    linkedin: string | null;
    x_handle: string | null;
    instagram: string | null;
    github: string | null;
    talks:
      | {
          title: string;
          abstract: string | null;
          tags: string[] | null;
          level: string | null;
          duration_min: number | null;
          is_panel: boolean;
          stage: string | null;
          day: string | null;
        }[]
      | null;
  };

  return {
    ...toCard(row),
    bio: row.bio,
    languages: row.languages ?? [],
    website: row.website,
    linkedin: row.linkedin,
    xHandle: row.x_handle,
    instagram: row.instagram,
    github: row.github,
    talks: (row.talks ?? []).map((t) => ({
      title: t.title,
      abstract: t.abstract,
      tags: (t.tags ?? []) as CanonicalTag[],
      level: t.level,
      durationMin: t.duration_min,
      isPanel: t.is_panel,
      stage: t.stage,
      day: t.day,
    })),
  };
}

/** Slugs publicables — para generar las rutas estáticas de los perfiles. */
export async function getSpeakerSlugs(): Promise<string[]> {
  const { data } = await publicClient().from("speakers").select("slug");
  return (data ?? []).map((r) => r.slug as string);
}

// ── Agenda ──────────────────────────────────────────────────

export type AgendaTalk = {
  id: string;
  title: string;
  abstract: string | null;
  tags: CanonicalTag[];
  level: string | null;
  durationMin: number | null;
  isPanel: boolean;
  stage: string;
  day: string;
  /** null mientras la planilla no traiga hora — ver getAgenda(). */
  startsAt: string | null;
  speaker: { slug: string; name: string; photoUrl: string | null } | null;
};

type AgendaRow = {
  id: string;
  title: string;
  abstract: string | null;
  tags: string[] | null;
  level: string | null;
  duration_min: number | null;
  is_panel: boolean;
  stage: string | null;
  day: string | null;
  starts_at: string | null;
  speakers: { slug: string; name: string; photo_url: string | null } | null;
};

/**
 * Charlas publicables con su speaker, para la página de agenda.
 *
 * Se descartan las que no tienen día o escenario: sin eso no hay dónde
 * ubicarlas en el cronograma, y mostrarlas sueltas confunde más de lo que
 * suma. Hoy las 31 visibles tienen ambos, pero a medida que la organización
 * confirme más van a aparecer a medio cargar.
 *
 * El orden es por día → escenario → hora. `starts_at` todavía viene null en
 * todas (la planilla no trae horario), así que en la práctica hoy ordena por
 * día y escenario y adentro queda el orden de carga. Cuando llegue la hora,
 * esta misma query pasa a devolver el cronograma real sin tocar nada más.
 */
export async function getAgenda(): Promise<AgendaTalk[]> {
  const { data, error } = await publicClient()
    .from("talks")
    .select(
      `id, title, abstract, tags, level, duration_min, is_panel, stage, day, starts_at,
       speakers ( slug, name, photo_url )`
    )
    .not("day", "is", null)
    .not("stage", "is", null)
    .order("day", { ascending: true })
    .order("stage", { ascending: true })
    .order("starts_at", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("[agenda] no se pudo leer:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as AgendaRow[])
    .filter((r): r is AgendaRow & { day: string; stage: string } => !!r.day && !!r.stage)
    .map((r) => ({
      id: r.id,
      title: r.title,
      abstract: r.abstract,
      tags: (r.tags ?? []) as CanonicalTag[],
      level: r.level,
      durationMin: r.duration_min,
      isPanel: r.is_panel,
      stage: r.stage,
      day: r.day,
      startsAt: r.starts_at,
      speaker: r.speakers
        ? { slug: r.speakers.slug, name: r.speakers.name, photoUrl: r.speakers.photo_url }
        : null,
    }));
}
