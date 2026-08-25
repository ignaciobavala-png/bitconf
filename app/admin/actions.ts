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

/**
 * Dispara el sync a mano desde el admin.
 *
 * Llama a `syncSpeakers()` directo en vez de hacer fetch a /api/sync-speakers:
 * ya estamos autenticados por la cookie, así que dar la vuelta por HTTP solo
 * agregaría un secreto de más en el camino.
 *
 * Registra la corrida igual que la ruta — incluido el fallo, que es la fila que
 * más importa del historial.
 */
export async function syncSpeakersNow() {
  const { syncSpeakers } = await import("@/lib/speakers/sync");
  const { recordRun, recordFailure } = await import("@/lib/speakers/runs");

  const startedAt = Date.now();
  try {
    await recordRun(await syncSpeakers(), "manual");
  } catch (err) {
    console.error("[admin] sync manual falló:", err);
    await recordFailure(err, "manual", Date.now() - startedAt);
  }
  revalidatePath("/admin");
}
