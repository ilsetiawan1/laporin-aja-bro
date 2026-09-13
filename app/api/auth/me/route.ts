import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: true,
        data: null,
        isAuthenticated: false,
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*, city:cities(*), district:districts(*)")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      success: true,
      data: profile || { id: user.id, email: user.email },
      isAuthenticated: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil sesi profil: " + error.message },
      { status: 500 }
    );
  }
}
