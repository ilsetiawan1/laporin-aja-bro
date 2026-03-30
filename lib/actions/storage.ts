"use server";

// ============================================================
// lib/actions/auth.ts (additions for storage)
// ============================================================

import { createServerClient } from "@/lib/supabase/server";

/**
 * Upload avatar file server-side and return the public URL
 * Removes the need for supabase storage client in RegisterWizard
 */
export async function uploadAvatarAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const supabase = await createServerClient();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { error: "File tidak valid." };
  }

  const fileExt = file.name.split(".").pop() ?? "jpg";
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    console.error("[uploadAvatarAction]", uploadError.message);
    return { error: "Gagal mengunggah avatar. Cek batas ukuran 5MB." };
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
  return { url: data.publicUrl };
}
