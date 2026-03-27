"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(_prevState: any, formData: FormData) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthenticated" };

  const fullName = formData.get("full_name") as string;
  const phoneNumber = formData.get("phone_number") as string;
  const gender = formData.get("gender") as string;
  const birthDate = formData.get("birth_date") as string;
  const cityId = formData.get("city_id") as string;
  const districtId = formData.get("district_id") as string;
  const avatarFile = formData.get("avatar") as File | null;

  let avatarUrl = undefined;
  
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile, { upsert: true });

    if (uploadError) {
      return { error: "Gagal mengunggah foto profil." };
    }
    
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);
      
    avatarUrl = publicUrlData.publicUrl;
  }

  const updates: any = {
    full_name: fullName,
    phone_number: phoneNumber,
    gender,
    birth_date: birthDate,
    city_id: cityId,
    district_id: districtId,
  };

  if (avatarUrl) {
    updates.avatar_url = avatarUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return { error: "Gagal menyimpan perubahan profil." };
  }

  revalidatePath("/dashboard/profile");
  return { success: true };
}
