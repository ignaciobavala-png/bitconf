import { createClient } from "@supabase/supabase-js";
import { onlyCanonical, type CanonicalTag } from "./tags";
import { getPublicSpeakers, SPEAKER_ID, type PublicSpeaker } from "./publico";

// Lectura pública de speakers y charlas.
//
// Usa la anon key a propósito, incluso corriendo en el servidor: así la RLS
// sigue siendo la que decide qué se publica (present + landing) y
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
  /**
   * Nombre y apellido reales. La planilla guarda en `name` el alias que eligió
   * la persona ("jimevallone"), pero el temario de la organización usa el
   * nombre real ("Jimena Vallone"): sirve solo para cruzarlos, no se muestra.
   */
  fullName: string | null;
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

const CARD_COLUMNS = "slug, name, first_name, last_name, role, company, country, photo_url, tags";

/**
 * Sin foto no se publica. La organización (05/10/2026) pidió esconder a
 * Ciberfeminismo "hasta que aparezca la foto": como regla y no como lista a
 * mano, el speaker vuelve solo con el sync que traiga la foto. Se aplica en
 * la grilla, el perfil y los slugs, así la URL directa también da 404.
 */
const HAS_PHOTO = ["photo_url", "is", null] as const;

type CardRow = {
  slug: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  company: string | null;
  country: string | null;
  photo_url: string | null;
  tags: string[] | null;
};

function toCard(r: CardRow): SpeakerCard {
  const full = [r.first_name, r.last_name].filter(Boolean).join(" ").trim();
  return {
    slug: r.slug,
    name: r.name,
    fullName: full && full !== r.name ? full : null,
    role: r.role,
    company: r.company,
    country: r.country,
    photoUrl: r.photo_url,
    tags: onlyCanonical(r.tags),
  };
}

// ── Fuente principal: publico/speakers (app de la organización) ─────────
//
// Si el documento responde, ÉL manda: qué speakers salen (`enGrilla`), en qué
// orden (`webOrder`) y con qué foto. La base propia (planilla + web-list.ts)
// queda como respaldo para cuando el origen no responde.

/**
 * La organización pidió (05/10/2026) no mostrar a nadie sin foto "hasta que
 * aparezca". Con publico/speakers hay 24 en grilla sin foto: el PDF de
 * integración sugiere mostrarlos con placeholder. Se mantiene el pedido de la
 * organización hasta que confirme; pasar a `false` los muestra con inicial.
 */
const HIDE_WITHOUT_PHOTO = true;

function publicCard(p: PublicSpeaker): SpeakerCard {
  return {
    slug: p.id,
    name: p.nombre,
    fullName: p.nombreReal !== p.nombre ? p.nombreReal : null,
    role: null,
    company: p.empresa,
    country: null,
    photoUrl: p.foto,
    tags: [],
  };
}

async function getPublicCards(): Promise<SpeakerCard[] | null> {
  const list = await getPublicSpeakers();
  if (!list) return null;
  return list.filter((p) => p.enGrilla && (!HIDE_WITHOUT_PHOTO || p.foto)).map(publicCard);
}

/** `x` llega como URL; el perfil la dibuja como `@usuario`. */
function xHandleOf(url: string | null): string | null {
  const m = url && /^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/@?([A-Za-z0-9_]{1,15})\/?(?:[?#].*)?$/.exec(url);
  return m ? m[1] : null;
}

/**
 * Todos los speakers publicables, en el orden de la organización (`webOrder`
 * de publico/speakers; en el respaldo, `web_order` de la base).
 */
export async function getSpeakers(): Promise<SpeakerCard[]> {
  const pub = await getPublicCards();
  if (pub) return pub;
  const { data, error } = await publicClient()
    .from("speakers")
    .select(`${CARD_COLUMNS}, web_order`)
    .not(...HAS_PHOTO);

  if (error) {
    // La grilla vacía es preferible a romper la página entera: el resto del
    // sitio no depende de esto.
    console.error("[speakers] no se pudieron leer:", error.message);
    return [];
  }
  const rows = (data ?? []) as (CardRow & { web_order: number | null })[];
  return rows
    .sort((a, b) => {
      const oa = a.web_order ?? Infinity;
      const ob = b.web_order ?? Infinity;
      if (oa !== ob) return oa - ob;
      return a.name.localeCompare(b.name, "es");
    })
    .map(toCard);
}

export async function getSpeakerBySlug(slug: string): Promise<SpeakerProfile | null> {
  // `sp54` es un id de publico/speakers; cualquier otra cosa es un slug viejo
  // de la base (links ya compartidos) y sigue resolviéndose ahí.
  if (SPEAKER_ID.test(slug)) {
    const p = (await getPublicSpeakers())?.find((x) => x.id === slug && x.enGrilla);
    if (!p || (HIDE_WITHOUT_PHOTO && !p.foto)) return null;
    return {
      ...publicCard(p),
      bio: null,
      languages: [],
      website: p.web,
      linkedin: null,
      xHandle: xHandleOf(p.x),
      instagram: null,
      github: null,
      talks: [],
    };
  }

  const supabase = publicClient();

  const { data, error } = await supabase
    .from("speakers")
    .select(
      `${CARD_COLUMNS}, bio, languages, website, linkedin, x_handle, instagram, github,
       talks ( title, abstract, tags, level, duration_min, is_panel, stage, day )`
    )
    .eq("slug", slug)
    .not(...HAS_PHOTO)
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
      tags: onlyCanonical(t.tags),
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
  const pub = await getPublicCards();
  if (pub) return pub.map((c) => c.slug);
  const { data } = await publicClient().from("speakers").select("slug").not(...HAS_PHOTO);
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
  /** Lo pone la UI, no la base: la charla no pertenece al tema elegido y se muestra atenuada. */
  dim?: boolean;
  stage: string;
  day: string;
  /** null mientras la planilla no traiga hora — ver getAgenda(). */
  startsAt: string | null;
  speaker: { slug: string; name: string; photoUrl: string | null } | null;

  // Solo las completa el temario estático (lib/agenda/match.ts); las charlas
  // que vienen de la base no las tienen y la UI cae a `speaker`.
  /** Speakers tal cual los escribió la organización. Se muestra literal. */
  whoText?: string;
  mod?: string;
  /** Los que se pudieron cruzar con un speaker publicado (foto + ficha). */
  speakers?: { slug: string; name: string; photoUrl: string | null }[];
  /** Columnas que ocupa: 2 = plenaria entre este escenario y el siguiente. */
  span?: number;
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
      tags: onlyCanonical(r.tags),
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
