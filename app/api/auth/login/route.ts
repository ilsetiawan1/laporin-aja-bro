import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { success: false, error: "Email atau password salah. Silakan coba lagi." },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", data.user.id)
      .single();

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      data: {
        user: data.user,
        role: profile?.role || "user",
        fullName: profile?.full_name,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal memproses login: " + error.message },
      { status: 500 }
    );
  }
}
