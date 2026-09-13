import { NextRequest, NextResponse } from "next/server";
import * as reportService from "@/lib/services/reportService";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const filters = {
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      district: searchParams.get("district") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      limit: Number(searchParams.get("limit")) || 50,
    };

    const reports = await reportService.getReports(filters);
    return NextResponse.json({
      success: true,
      data: reports,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil laporan: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const {
      title,
      description,
      category_id,
      city_id,
      district_id,
      address,
      is_anonymous = false,
      image_urls = [],
    } = body;

    if (!title || !description || !category_id || !city_id) {
      return NextResponse.json(
        { success: false, error: "Field title, description, category_id, dan city_id wajib diisi." },
        { status: 400 }
      );
    }

    const reportId = crypto.randomUUID();
    const newReport = await reportService.createReport({
      id: reportId,
      userId: user?.id ?? null,
      title,
      description,
      category_id,
      city_id,
      district_id: district_id || null,
      address: address || null,
      is_anonymous: Boolean(is_anonymous),
      image_urls: Array.isArray(image_urls) ? image_urls : [],
    });

    if (!newReport) {
      return NextResponse.json(
        { success: false, error: "Gagal membuat laporan." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Laporan berhasil dibuat",
        data: newReport,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal memproses laporan: " + error.message },
      { status: 500 }
    );
  }
}