import { NextRequest, NextResponse } from "next/server";
import * as locationRepo from "@/lib/repositories/locationRepository";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("city_id") || "";

    if (!cityId) {
      return NextResponse.json(
        { success: false, error: "Parameter city_id wajib disertakan" },
        { status: 400 }
      );
    }

    const districts = await locationRepo.getDistrictsByCity(cityId);
    return NextResponse.json({
      success: true,
      data: districts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data kecamatan: " + error.message },
      { status: 500 }
    );
  }
}
