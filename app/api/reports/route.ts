import { NextRequest, NextResponse } from "next/server";
import * as reportService from "@/lib/services/reportService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const filters = {
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    district: searchParams.get("district") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    limit: 50,
  };

  const reports = await reportService.getReports(filters);
  return NextResponse.json(reports);
}