"use server";

import { createServerClient } from "@/lib/supabase/server";
import * as reportService from "@/lib/services/reportService";
import * as reportRepo from "@/lib/repositories/reportRepository";
import type { ReportFilters, ReportWithRelations } from "@/types";
import { unstable_noStore as noStore } from "next/cache";

export async function getLatestReports(): Promise<ReportWithRelations[]> {
  return reportService.getReports({ limit: 8 });
}

export async function getPublicReports(params: {
  search?: string;
  category?: string;
  city?: string;
  district?: string;
  status?: string;
}): Promise<ReportWithRelations[]> {
  const filters: ReportFilters = {
    search: params.search,
    category: params.category,
    city: params.city,
    district: params.district,
    status: params.status,
    limit: 50,
  };
  return reportService.getReports(filters);
}

export async function getReportDetailAction(
  id: string
): Promise<ReportWithRelations | null> {
  noStore();
  return reportService.getReportDetail(id);
}

export async function submitReport(
  formData: FormData
): Promise<{ error?: string; success?: boolean; reportId?: string }> {
  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category_id = formData.get("category_id") as string;
  const city_id = formData.get("city_id") as string;
  const district_id = formData.get("district_id") as string;
  const address = formData.get("address") as string;
  const is_anonymous = formData.get("is_anonymous") === "true";

  if (!title || !description || !category_id || !city_id) {
    return { error: "Harap lengkapi semua field wajib." };
  }

  const reportId = crypto.randomUUID();

  // Handle image uploads if any
  const imageFiles: File[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("image_") && value instanceof File && value.size > 0) {
      imageFiles.push(value);
    }
  }

  let imageUrls: string[] = [];
  if (imageFiles.length > 0) {
    imageUrls = await reportService.uploadReportImages(user?.id ?? null, reportId, imageFiles);
  }

  const newReport = await reportService.createReport({
    id: reportId,
    userId: user?.id ?? null,
    title,
    description,
    category_id,
    city_id,
    district_id: district_id || null,
    address: address || null,
    is_anonymous,
    image_urls: imageUrls,
  });

  if (!newReport) {
    return { error: "Gagal mengirim laporan. Silakan coba lagi." };
  }

  return { success: true, reportId: newReport.id };
}

// ── Admin Actions ─────────────────────────────────────────────

export async function updateReportStatus(
  reportId: string,
  status: string,
  note?: string
): Promise<{ error?: string; success?: boolean }> {
  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) return { error: "Unauthorized." };

  // Verify admin role
  const { data: profile } = await serverClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Hanya admin yang dapat mengubah status laporan." };
  }

  const result = await reportService.updateStatus(
    reportId,
    status as import("@/types").ReportStatus,
    user.id,
    note
  );

  return result;
}

// ── User Reports ──────────────────────────────────────────────

export async function getUserReports(): Promise<ReportWithRelations[]> {
  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) return [];

  return reportService.getReports({ userId: user.id });
}

// ── Admin Stats ───────────────────────────────────────────────

export async function getAdminStats() {
  return reportService.getAdminStats();
}