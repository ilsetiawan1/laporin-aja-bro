import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      confirmPassword,
      nik,
      full_name,
      phone_number,
      gender,
      birth_date,
      city_id,
      district_id,
      avatar_url,
    } = body;

    // Validation
    if (
      !email ||
      !password ||
      !nik ||
      !full_name ||
      !phone_number ||
      !gender ||
      !city_id ||
      !district_id
    ) {
      return NextResponse.json(
        { success: false, error: "Semua kolom wajib diisi kecuali dinyatakan opsional." },
        { status: 400 }
      );
    }

    if (String(nik).length !== 16) {
      return NextResponse.json(
        { success: false, error: "NIK harus berjumlah 16 digit." },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Password dan konfirmasi password tidak cocok." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password minimal 6 karakter." },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Check duplicate NIK
    const { data: existingNik } = await supabase
      .from("profiles")
      .select("id")
      .eq("nik", nik)
      .maybeSingle();

    if (existingNik) {
      return NextResponse.json(
        { success: false, error: "NIK ini sudah terdaftar. Gunakan NIK lain." },
        { status: 400 }
      );
    }

    // Check duplicate Phone
    const { data: existingPhone } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone_number", phone_number)
      .maybeSingle();

    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: "Nomor telepon ini sudah terdaftar." },
        { status: 400 }
      );
    }

    // Sign up to Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "user" },
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: authError ? authError.message : "Gagal mendaftar." },
        { status: 400 }
      );
    }

    // Update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        nik,
        full_name,
        phone_number,
        gender,
        birth_date: birth_date || null,
        city_id,
        district_id,
        avatar_url: avatar_url || null,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { success: false, error: "Gagal menyimpan biodata profil: " + profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pendaftaran berhasil",
        data: {
          id: authData.user.id,
          email,
          fullName: full_name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal memproses pendaftaran: " + error.message },
      { status: 500 }
    );
  }
}
