import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import * as reportService from "@/lib/services/reportService";
import type { ReportStatus } from "@/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Hanya admin yang berwenang mengubah status laporan." },
        { status: 403 }
      );
    }

    const { status, note } = body;
    const validStatuses: ReportStatus[] = ["pending", "diproses", "selesai", "ditolak"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status tidak valid. Pilihan: pending, diproses, selesai, ditolak." },
        { status: 400 }
      );
    }

    const result = await reportService.updateStatus(id, status, user.id, note);

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Status laporan berhasil diubah menjadi ${status}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui status: " + error.message },
      { status: 500 }
    );
  }
}
