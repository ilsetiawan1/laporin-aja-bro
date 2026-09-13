import { NextResponse } from "next/server";
import * as locationRepo from "@/lib/repositories/locationRepository";

export async function GET() {
  try {
    const cities = await locationRepo.getCities();
    return NextResponse.json({
      success: true,
      data: cities,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data kota: " + error.message },
      { status: 500 }
    );
  }
}
