// ============================================================
// lib/services/statusLogService.ts
// Business logic untuk status timeline laporan
// ============================================================

import { createServerClient } from "@/lib/supabase/server";
import * as statusLogRepo from "@/lib/repositories/statusLogRepository";
import type { ReportStatusLog, ReportStatus } from "@/types";

// Status flow yang valid
export const STATUS_FLOW: Record<ReportStatus, ReportStatus[]> = {
  pending: ["diproses", "selesai", "ditolak"],
  diproses: ["selesai", "ditolak"],
  selesai: [],
  ditolak: [],
};

// Label & metadata untuk setiap status
export const STATUS_META: Record<
  string,
  { label: string; icon: string; color: string; bgColor: string; borderColor: string }
> = {
  pending: {
    label: "Laporan Diterima",
    icon: "inbox",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
  },
  diproses: {
    label: "Sedang Diproses",
    icon: "cog",
    color: "text-blue",
    bgColor: "bg-blue/5",
    borderColor: "border-blue/30",
  },
  selesai: {
    label: "Laporan Selesai",
    icon: "check",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
  ditolak: {
    label: "Laporan Ditolak",
    icon: "x",
    color: "text-red",
    bgColor: "bg-red/5",
    borderColor: "border-red/25",
  },
};

/**
 * Ambil semua status logs untuk satu laporan
 */
export async function getStatusTimeline(
  reportId: string
): Promise<ReportStatusLog[]> {
  const supabase = await createServerClient();
  return statusLogRepo.getStatusLogsByReportId(supabase, reportId);
}

export async function updateReportStatus(params: {
  reportId: string;
  newStatus: ReportStatus;
  adminId: string;
  note?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

const { error: updateError } = await supabase
  .from("reports")
  .update({ status: params.newStatus })
  .eq("id", params.reportId);


  if (updateError) {
    console.error("[updateReportStatus] FAILED:", updateError.message, updateError.code);
    return { success: false, error: `Gagal update: ${updateError.message}` };
  }

  const log = await statusLogRepo.insertStatusLog(supabase, {
    reportId: params.reportId,
    status: params.newStatus,
    changedBy: params.adminId,
    note: params.note ?? null,
  });

  console.log("[updateReportStatus] log inserted:", log);
  if (!log) {
    return { success: false, error: "Gagal insert status log." };
  }

  return { success: true };
}