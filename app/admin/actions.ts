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
