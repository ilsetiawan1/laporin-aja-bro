"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

  // ── Validasi field wajib ──────────────────────────────────────
  if (
    !email ||
    !password ||
    !nik ||
    !fullName ||
    !phoneNumber ||
    !gender ||
    !cityId ||
    !districtId
  ) {
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

  // ── FIX: Cek duplikat NIK & phone SEBELUM buat akun ──────────
  // Dengan begitu signUp() tidak pernah dipanggil jika data sudah ada,
  // sehingga tidak ada sesi login yang bocor / akun ghost.

  const { data: existingNik } = await supabase
    .from("profiles")
    .select("id")
    .eq("nik", nik)
    .maybeSingle();

  if (existingNik) {
    return {
      error: "NIK ini sudah terdaftar. Gunakan NIK lain atau hubungi admin.",
    };
  }

  const { data: existingPhone } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone_number", phoneNumber)
    .maybeSingle();

  if (existingPhone) {
    return { error: "Nomor telepon ini sudah terdaftar." };
  }

  // ── Buat akun Auth ────────────────────────────────────────────
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
    if (
      error.message.includes("already registered") ||
      error.message.includes("User already registered")
    ) {
      return { error: "Email sudah terdaftar. Silakan login." };
    }
    return { error: `Gagal mendaftar: ${error.message}` };
  }

  if (!authData.user) {
    return { error: "Gagal mendaftar. Silakan coba lagi." };
  }

  // ── Update profil ─────────────────────────────────────────────
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

      // Sign out paksa agar sesi tidak bocor jika update profil gagal
      await supabase.auth.signOut();

      if (profileError.message.includes("profiles_nik_key")) {
        return {
          error:
            "NIK ini sudah terdaftar. Gunakan NIK lain atau hubungi admin.",
        };
      }
      if (profileError.message.includes("profiles_phone_number_key")) {
        return { error: "Nomor telepon ini sudah terdaftar." };
      }

      return { error: `Gagal menyimpan biodata: ${profileError.message}` };
    }
  } catch (err: unknown) {
    console.error("Exception during profile update:", err);

    // Sign out paksa juga saat exception tak terduga
    await supabase.auth.signOut();

    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: `Terjadi kesalahan saat menyimpan biodata: ${message}` };
  }

  return {
    success: "Pendaftaran berhasil! Silakan login kembali.",
  };
}

export async function logoutAction() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Get current authenticated user — for server components/pages
 * Returns null if not authenticated
 */
export async function getAuthUser(): Promise<{
  id: string;
  email: string;
} | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return { id: user.id, email: user.email ?? "" };
}