import { NextResponse } from "next/server";
import * as locationRepo from "@/lib/repositories/locationRepository";

export async function GET() {
  try {
    const categories = await locationRepo.getCategories();
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil kategori: " + error.message },
      { status: 500 }
    );
  }
}
