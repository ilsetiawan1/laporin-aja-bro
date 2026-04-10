// lib/actions/statusLogs.ts
"use server";

import { createServerClient } from "@/lib/supabase/server";
import * as statusLogService from "@/lib/services/statusLogService";
import type { ReportStatusLog, ReportStatus } from "@/types";
import { revalidatePath } from "next/cache";


export async function getStatusTimeline(
  reportId: string
): Promise<ReportStatusLog[]> {
  return statusLogService.getStatusTimeline(reportId);
}

export async function updateStatusAction(params: {
  reportId: string;
  newStatus: string;
  note?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized." };
  }

  // Verifikasi role admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Hanya admin yang dapat mengubah status laporan." };
  }
  
  const result = await statusLogService.updateReportStatus({
    reportId: params.reportId,
    newStatus: params.newStatus as ReportStatus,
    adminId: user.id,
    note: params.note,
  });

  if (result.success) {
    revalidatePath(`/admin/reports/${params.reportId}`);
    revalidatePath(`/admin/reports`);
    revalidatePath(`/reports/${params.reportId}`);
    revalidatePath(`/reports`);
    revalidatePath(`/`);
  }

  return result;
}

// ================================================================
// TAMBAHKAN fungsi ini ke lib/actions/statusLogs.ts
// Letakkan di bagian paling bawah file, setelah updateStatusAction
// ================================================================

export async function getActivityLogsAction(filterStatus?: string): Promise<{
  id: string;
  report_id: string;
  status: string;
  changed_by: string | null;
  note: string | null;
  created_at: string;
  report_title: string | null;
  admin_name: string | null;
}[]> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return [];

  // Step 1: Ambil logs
  let logsQuery = supabase
    .from("report_status_logs")
    .select("id, report_id, status, changed_by, note, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (filterStatus) {
    logsQuery = logsQuery.eq("status", filterStatus);
  }

  const { data: logs, error } = await logsQuery;
  if (error || !logs || logs.length === 0) return [];

  // Step 2: Ambil judul laporan
  const reportIds = [...new Set(logs.map((l) => l.report_id))];
  const { data: reports } = await supabase
    .from("reports")
    .select("id, title")
    .in("id", reportIds);

  // Step 3: Ambil nama admin berdasarkan changed_by
  const adminIds = [...new Set(
    logs.map((l) => l.changed_by).filter(Boolean)
  )] as string[];
  const { data: admins } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", adminIds);

  // Step 4: Buat lookup map
  const reportMap = Object.fromEntries((reports ?? []).map((r) => [r.id, r.title]));
  const adminMap = Object.fromEntries((admins ?? []).map((a) => [a.id, a.full_name]));

  // Step 5: Gabungkan dan return
  return logs.map((log) => ({
    id: log.id,
    report_id: log.report_id,
    status: log.status,
    changed_by: log.changed_by,
    note: log.note,
    created_at: log.created_at,
    report_title: reportMap[log.report_id] ?? null,
    admin_name: log.changed_by ? (adminMap[log.changed_by] ?? "Admin") : "Admin",
  }));
}