import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Berhasil logout",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal logout: " + error.message },
      { status: 500 }
    );
  }
}
