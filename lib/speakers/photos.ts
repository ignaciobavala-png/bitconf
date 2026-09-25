import type { SupabaseClient } from "@supabase/supabase-js";

// Espejado de las fotos de speakers.
//
// La planilla guarda la foto como un link de Google Drive
// (drive.google.com/thumbnail?id=...). NO las servimos desde ahí:
//
//  1. Drive no es un CDN. Throttlea con volumen, y una vista de la grilla son
//     ~80 imágenes: con el tráfico de los días del evento son decenas de miles
//     de pedidos contra un servicio que no da garantías.
//  2. Si alguien mueve el archivo, lo borra o cambia el permiso de compartido,
//     la foto desaparece del sitio sin aviso.
//  3. Desde un dominio externo no controlamos formato ni tamaño.
//
// Así que se bajan una vez y se sirven desde nuestro bucket, vía next/image
// (que hace el resize y el WebP/AVIF al vuelo, y cachea en el CDN de Vercel —
// por eso Supabase se toca una vez por imagen y no una por visitante).
//
// Nota sobre resolución: los archivos en Drive YA son 400x400. Probamos
// sz=w1200, sz=w2000, lh3.googleusercontent y uc?export=view: las cuatro
// devuelven el mismo archivo byte por byte. No hay versión más grande que
// pedir; el recorte lo hace el formulario de postulación antes de subirla.

const BUCKET = "media";
const PREFIX = "speakers";

/** Límite defensivo: las fotos reales pesan ~25 KB. */
const MAX_BYTES = 8 * 1024 * 1024;

export type MirrorResult =
  | { status: "unchanged"; url: string; hash: string }
  | { status: "mirrored"; url: string; hash: string }
  | { status: "skipped"; reason: string };

function extensionFor(contentType: string): string {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  return "jpg";
}

async function sha256(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Baja la foto de origen y la sube al bucket si cambió.
 *
 * El archivo se nombra por HASH DEL CONTENIDO, no por el id del speaker. Es
 * deliberado: en este proyecto ya nos pasó que al reemplazar una imagen
 * manteniendo la URL, el CDN y el optimizador de Next siguieran sirviendo la
 * vieja durante días. Con hash de contenido, foto nueva = URL nueva = se ve al
 * instante, y de paso el hash es el propio control de "¿hace falta bajarla?".
 */
export async function mirrorPhoto(
  supabase: SupabaseClient,
  sourceUrl: string | null,
  knownHash: string | null
): Promise<MirrorResult> {
  if (!sourceUrl) return { status: "skipped", reason: "sin foto en la planilla" };

  let bytes: ArrayBuffer;
  let contentType: string;
  try {
    const res = await fetch(sourceUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return { status: "skipped", reason: `origen HTTP ${res.status}` };

    contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) {
      // Drive devuelve una página HTML de error cuando el archivo dejó de ser
      // público. Sin este chequeo guardaríamos ese HTML como si fuera la foto.
      return { status: "skipped", reason: `el origen no devolvió una imagen (${contentType})` };
    }

    bytes = await res.arrayBuffer();
  } catch (err) {
    return { status: "skipped", reason: `no se pudo bajar: ${(err as Error).message}` };
  }

  if (bytes.byteLength === 0) return { status: "skipped", reason: "archivo vacío" };
  if (bytes.byteLength > MAX_BYTES) {
    return { status: "skipped", reason: `pesa ${Math.round(bytes.byteLength / 1024)} KB` };
  }

  const hash = await sha256(bytes);
  const path = `${PREFIX}/${hash}.${extensionFor(contentType)}`;
  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path);

  // El hash no cambió: el archivo ya está subido y la URL es la misma.
  if (knownHash === hash) {
    return { status: "unchanged", url: publicUrl.publicUrl, hash };
  }

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType,
    // Un año: la URL es inmutable por construcción (contiene el hash), así que
    // el contenido detrás nunca cambia y se puede cachear para siempre.
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) return { status: "skipped", reason: `no se pudo subir: ${error.message}` };

  return { status: "mirrored", url: publicUrl.publicUrl, hash };
}
