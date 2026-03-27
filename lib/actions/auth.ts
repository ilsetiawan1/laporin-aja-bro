"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; success?: string } | null;

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return { error: "Email atau password salah. Silakan coba lagi." };
  }

  // Check role from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/");
  }
}

export async function registerAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  
  const nik = formData.get("nik") as string;
  const fullName = formData.get("full_name") as string;
  const phoneNumber = formData.get("phone_number") as string;
  const gender = formData.get("gender") as string;
  const birthDate = formData.get("birth_date") as string;
  const cityId = formData.get("city_id") as string;
  const districtId = formData.get("district_id") as string;
  const avatarUrl = formData.get("avatar") as string | null;

  if (!email || !password || !nik || !fullName || !phoneNumber || !gender || !cityId || !districtId) {
    return { error: "Semua kolom wajib diisi kecuali dinyatakan opsional." };
  }

  if (nik.length !== 16) {
    return { error: "NIK harus berjumlah 16 digit." };
  }

  if (password !== confirmPassword) {
    return { error: "Password tidak cocok." };
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  const supabase = await createServerClient();

  // 1. Sign Up User (Profiles table generated via schema trigger)
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "user",
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("User already registered")) {
      return { error: "Email sudah terdaftar. Silakan login." };
    }
    return { error: `Gagal mendaftar: ${error.message}` };
  }

  if (!authData.user) {
    return { error: "Gagal mendaftar. Silakan coba lagi." };
  }

  try {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        nik,
        full_name: fullName,
        phone_number: phoneNumber,
        gender,
        birth_date: birthDate || null,
        city_id: cityId,
        district_id: districtId,
        avatar_url: avatarUrl,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Failed to update profile:", profileError.message);
      return { error: `Gagal menyimpan biodata: ${profileError.message}` };
    }
  } catch (err: any) {
    console.error("Exception during profile update:", err);
    return { error: `Terjadi kesalahan saat menyimpan biodata: ${err.message || 'Unknown error'}` };
  }

  return {
    success: "Pendaftaran berhasil! Silakan login kembali.",
  };
}

export async function logoutAction() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
