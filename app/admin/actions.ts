"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string;
  const secret = process.env.ADMIN_SECRET;

  if (!password || password !== secret) {
    redirect("/admin/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_token", secret!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });

  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/admin/login");
}

export async function moderateReason(id: string, status: "approved" | "rejected") {
  const supabase = createServiceClient();
  await supabase
    .from("reasons")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin");
}

export async function deleteReason(id: string) {
  const supabase = createServiceClient();
  await supabase.from("reasons").delete().eq("id", id);
  revalidatePath("/admin");
}

export async function addStaticPhrase(formData: FormData) {
  const text = (formData.get("text") as string)?.trim();
  const lane_index = parseInt(formData.get("lane_index") as string, 10);
  if (!text || isNaN(lane_index)) return;

  const supabase = createServiceClient();
  await supabase.from("reasons").insert({
    text,
    lane_index,
    is_static: true,
    status: "approved",
    ip_hash: "static",
    flagged: false,
  });
  revalidatePath("/admin");
}

export async function toggleStaticPhrase(id: string, currentStatus: "approved" | "rejected") {
  const supabase = createServiceClient();
  const newStatus = currentStatus === "approved" ? "rejected" : "approved";
  await supabase.from("reasons").update({ status: newStatus }).eq("id", id);
  revalidatePath("/admin");
}

// ── EDU HUB — Universidades acreditadas (/mas, scroll 5) ──────────────────
// La org sube los logos y gestiona la lista desde acá; la sección pública
// (/mas#universidades-acreditadas) lee esta misma tabla en vivo.

const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2MB — logos, no fotos
const LOGO_EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export async function addUniversity(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;

  const supabase = createServiceClient();
  await supabase.from("edu_hub_universities").insert({ name, accredited: true });
  revalidatePath("/admin");
}

export async function toggleUniversityAccredited(id: string, current: boolean) {
  const supabase = createServiceClient();
  await supabase.from("edu_hub_universities").update({ accredited: !current }).eq("id", id);
  revalidatePath("/admin");
}

export async function deleteUniversity(id: string) {
  const supabase = createServiceClient();
  await supabase.from("edu_hub_universities").delete().eq("id", id);
  revalidatePath("/admin");
}

export async function uploadUniversityLogo(id: string, formData: FormData) {
  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) return;

  const ext = LOGO_EXT_BY_TYPE[file.type];
  if (!ext || file.size > LOGO_MAX_BYTES) return;

  const supabase = createServiceClient();
  // Nombre con timestamp: si la org resube un logo con el mismo archivo, un
  // path fijo quedaría cacheado (browser/CDN) y no se vería el cambio — ver
  // skill uploader-path-fijo-cache.
  const path = `edu-hub/universidades/${id}-${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from("media").upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  });
  if (error) return;

  const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
  await supabase.from("edu_hub_universities").update({ logo_url: pub.publicUrl }).eq("id", id);
  revalidatePath("/admin");
}
