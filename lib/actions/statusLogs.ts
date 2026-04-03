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
    revalidatePath(`/reports/${params.reportId}`);
  }

  return result;
}
