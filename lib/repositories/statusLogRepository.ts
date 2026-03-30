// ============================================================
// lib/repositories/statusLogRepository.ts
// Query untuk report_status_logs — status timeline laporan
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReportStatusLog } from "@/types";

function normalizeLog(raw: Record<string, unknown>): ReportStatusLog {
  return {
    id: raw.id as string,
    report_id: raw.report_id as string,
    status: raw.status as string,
    changed_by: (raw.changed_by as string) ?? null,
    note: (raw.note as string) ?? null,
    created_at: raw.created_at as string,
  };
}

/**
 * Ambil semua status logs untuk satu laporan, diurutkan dari terlama ke terbaru
 */
export async function getStatusLogsByReportId(
  client: SupabaseClient,
  reportId: string
): Promise<ReportStatusLog[]> {
  const { data, error } = await client
    .from("report_status_logs")
    .select("id, report_id, status, changed_by, note, created_at")
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error.message)
    return [];
  }

  return ((data as Record<string, unknown>[]) ?? []).map(normalizeLog);
}

/**
 * Tambah log status baru
 */
export async function insertStatusLog(
  client: SupabaseClient,
  params: {
    reportId: string;
    status: string;
    changedBy?: string | null;
    note?: string | null;
  }
): Promise<ReportStatusLog | null> {
  const { data, error } = await client
    .from("report_status_logs")
    .insert({
      report_id: params.reportId,
      status: params.status,
      changed_by: params.changedBy ?? null,
      note: params.note ?? null,
    })
    .select("id, report_id, status, changed_by, note, created_at")
    .single();

  if (error) {
    console.error("[statusLogRepo] insertStatusLog:", error.message);
    return null;
  }

  return normalizeLog(data as Record<string, unknown>);
}

/**
 * Ambil log terbaru (satu log) untuk sebuah laporan
 */
export async function getLatestStatusLog(
  client: SupabaseClient,
  reportId: string
): Promise<ReportStatusLog | null> {
  const { data, error } = await client
    .from("report_status_logs")
    .select("id, report_id, status, changed_by, note, created_at")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[statusLogRepo] getLatestStatusLog:", error.message);
    return null;
  }

  return data ? normalizeLog(data as Record<string, unknown>) : null;
}
