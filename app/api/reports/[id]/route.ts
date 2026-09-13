import { NextRequest, NextResponse } from "next/server";
import * as reportService from "@/lib/services/reportService";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await reportService.getReportDetail(id);

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan: " + error.message },
      { status: 500 }
    );
  }
}
