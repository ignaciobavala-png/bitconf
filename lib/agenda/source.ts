import { createClient } from "@supabase/supabase-js";
import { SESSIONS, type Session } from "./temario";
import { toSessions, validateTemario, type SnapshotPayload } from "./snapshot";

// Lectura del temario publicado por la organización.
//
// Anon key a propósito, incluso en el servidor: la RLS de `temario_snapshots`
// es la que decide qué se ve (ver lib/db/temario.sql).

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export type LatestSnapshot = { payload: SnapshotPayload; createdAt: string };

/** El envío más reciente, o null si no hay (o la tabla todavía no existe). */
export async function getLatestSnapshot(
  client: ReturnType<typeof publicClient> = publicClient()
): Promise<LatestSnapshot | null> {
  const { data, error } = await client
    .from("temario_snapshots")
    .select("payload, created_at")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // Tabla inexistente o base caída: la agenda sigue con el temario del repo.
    console.error("[temario] no se pudo leer el envío publicado:", error.message);
    return null;
  }
  if (!data) return null;

  // Se vuelve a validar al leer: si el contrato cambió desde que se guardó,
  // preferimos el temario del repo a dibujar algo a medias.
  const v = validateTemario(data.payload);
  if (!v.ok) {
    console.error("[temario] el envío guardado ya no valida:", v.errors[0]);
    return null;
  }
  return { payload: v.payload, createdAt: data.created_at as string };
}

/**
 * Las sesiones que muestra la web: el temario que publicó la organización y,
 * mientras no haya ninguno, el cargado a mano en `lib/agenda/temario.ts`.
 */
export async function getSessions(): Promise<Session[]> {
  const latest = await getLatestSnapshot();
  if (!latest) return SESSIONS;
  const sessions = toSessions(latest.payload);
  return sessions.length > 0 ? sessions : SESSIONS;
}
