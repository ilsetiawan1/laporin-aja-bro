import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Pastikan Vercel selalu mengeksekusi fungsi ini (dynamic) dan tidak men-cache hasilnya
export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  try {
    const supabase = await createServerClient();

    // Query ringan 1 baris untuk menyapa dan mereset timer auto-pause Supabase
    const { error } = await supabase
      .from("categories")
      .select("id")
      .limit(1);

    if (error) {
      throw error;
    }

    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Database check failed";
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
