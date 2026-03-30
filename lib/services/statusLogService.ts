// ============================================================
// lib/services/statusLogService.ts
// Business logic untuk status timeline laporan
// ============================================================

import { createServerClient } from "@/lib/supabase/server";
import * as statusLogRepo from "@/lib/repositories/statusLogRepository";
import type { ReportStatusLog, ReportStatus } from "@/types";

// Status flow yang valid
export const STATUS_FLOW: Record<ReportStatus, ReportStatus[]> = {
  pending: ["diproses", "ditolak"],
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

/**
 * Update status laporan + tambah log
 * Hanya untuk admin — validasi dilakukan di action layer
 */
export async function updateReportStatus(params: {
  reportId: string;
  newStatus: ReportStatus;
  adminId: string;
  note?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  // 1. Update status di tabel reports
  const { error: updateError } = await supabase
    .from("reports")
    .update({ status: params.newStatus })
    .eq("id", params.reportId);

  if (updateError) {
    console.error("[statusLogService] updateStatus:", updateError.message);
    return { success: false, error: "Gagal mengubah status laporan." };
  }

  // 2. Insert log
  const log = await statusLogRepo.insertStatusLog(supabase, {
    reportId: params.reportId,
    status: params.newStatus,
    changedBy: params.adminId,
    note: params.note ?? null,
  });

  if (!log) {
    // Log gagal tapi status sudah berubah — jangan rollback, cukup log error
    console.error("[statusLogService] insertStatusLog gagal untuk reportId:", params.reportId);
  }

  return { success: true };
}
