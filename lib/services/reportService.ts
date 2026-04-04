// ============================================================
// lib/services/reportService.ts
// Business logic for reports — coordinates repositories
// Always runs server-side (called from Server Actions)
// ============================================================

import { createServerClient } from "@/lib/supabase/server";
import * as reportRepo from "@/lib/repositories/reportRepository";
import type {
  ReportWithRelations,
  CreateReportInput,
  Report,
  ReportFilters,
  ReportStatus,
} from "@/types";

// ── Read Operations ──────────────────────────────────────────

export async function getReports(
  filters?: ReportFilters
): Promise<ReportWithRelations[]> {
  const supabase = await createServerClient();
  return reportRepo.getReports(supabase, filters);
}

export async function getReportDetail(
  id: string
): Promise<ReportWithRelations | null> {
  const supabase = await createServerClient();
  const report = await reportRepo.getReportById(supabase, id);
  return report;
}

export interface CreateReportPayload {
  id?: string;
  userId: string | null;
  title: string;
  description: string;
  category_id: string;
  city_id: string;
  district_id?: string | null;
  address?: string | null;
  is_anonymous: boolean;
  image_urls?: string[];
}

export async function createReport(
  payload: CreateReportPayload
): Promise<Report | null> {
  const supabase = await createServerClient();

  const similarIds = await reportRepo.findSimilarReports(
    supabase,
    payload.title,
    payload.description
  );

  const input: CreateReportInput = {
    id: payload.id,
    user_id: payload.userId,
    title: payload.title,
    description: payload.description,
    category_id: payload.category_id,
    city_id: payload.city_id,
    district_id: payload.district_id ?? null,
    address: payload.address ?? null,
    is_anonymous: payload.is_anonymous,
    image_urls: payload.image_urls ?? [],
    similar_count: similarIds.length,
  };

  const newReport = await reportRepo.createReport(supabase, input);
  if (!newReport) return null;

  await reportRepo.updatePriorityScore(supabase, newReport.id);

  return newReport;
}

export async function uploadReportImages(
  userId: string | null,
  reportId: string,
  files: File[]
): Promise<string[]> {
  const supabase = await createServerClient();
  const urls: string[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const folderUser = userId || "anonymous";
    const filename = `${folderUser}/${reportId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("report_attachments")
      .upload(filename, file, { upsert: false });

    if (error) {
      console.error("[reportService] uploadImage:", error.message);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from("report_attachments")
      .getPublicUrl(filename);

    if (urlData?.publicUrl) {
      urls.push(urlData.publicUrl);
    }
  }

  return urls;
}

export async function updateStatus(
  reportId: string,
  status: ReportStatus,
  adminId: string,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  // 1. Update report status
  const updated = await reportRepo.updateReport(supabase, reportId, { status });
  if (!updated) {
    return { success: false, error: "Gagal mengubah status laporan." };
  }

  // 2. Insert status log
  const { error: logError } = await supabase
    .from("report_status_logs")
    .insert({
      report_id: reportId,
      status,
      changed_by: adminId,
      note: note ?? null,
    });

  if (logError) {
    console.error("[reportService] updateStatus log:", logError.message);
  }

  const { error: updateError } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", reportId);

  if (updateError) {
    console.error("[reportService] updateStatus:", updateError.message);
    return { success: false, error: `Gagal update: ${updateError.message}` };
  }

  return { success: true };
}

export interface AdminStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Array<{ name: string; count: number }>;
  highPriority: ReportWithRelations[];
  recent: ReportWithRelations[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createServerClient();

  const [
    { count: total },
    { data: byStatusRaw },
    { data: byCategoryRaw },
    allReports,
  ] = await Promise.all([
    supabase.from("reports").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("status"),
    supabase
      .from("reports")
      .select("category_id, categories(name)")
      .not("category_id", "is", null),
    reportRepo.getReports(supabase, { limit: 10 }),
  ]);

  const byStatus: Record<string, number> = {};
  (byStatusRaw ?? []).forEach((r: { status: string }) => {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
  });

  const categoryCounts: Record<string, number> = {};
  (byCategoryRaw ?? []).forEach(
    (r: { category_id: string; categories: { name: string }[] | null }) => {
      const name = Array.isArray(r.categories)
        ? r.categories[0]?.name
        : (r.categories as { name: string } | null)?.name;
      if (name) {
        categoryCounts[name] = (categoryCounts[name] ?? 0) + 1;
      }
    }
  );

  const byCategory = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const highPriority = allReports.filter((r) => (r.priority_score ?? 0) > 15);
  const recent = allReports.slice(0, 10);

  return {
    total: total ?? 0,
    byStatus,
    byCategory,
    highPriority,
    recent,
  };
}