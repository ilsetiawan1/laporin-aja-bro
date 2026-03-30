"use server";

// ============================================================
// lib/actions/statusLogs.ts
// Thin server action wrappers untuk status timeline
// ============================================================

import { createServerClient } from "@/lib/supabase/server";
import * as statusLogService from "@/lib/services/statusLogService";
import type { ReportStatusLog, ReportStatus } from "@/types";

// export type { ReportStatusLog };

/**
 * Ambil semua status timeline untuk sebuah laporan (public access)
 */
export async function getStatusTimeline(
  reportId: string
): Promise<ReportStatusLog[]> {
  return statusLogService.getStatusTimeline(reportId);
}

/**
 * Update status laporan — hanya admin
 */
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

  return statusLogService.updateReportStatus({
    reportId: params.reportId,
    newStatus: params.newStatus as ReportStatus,
    adminId: user.id,
    note: params.note,
  });
}
