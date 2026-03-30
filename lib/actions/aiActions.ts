"use server";

import { generateReportSummary, generateAdminSuggestion, improveReportTitle } from "@/lib/services/aiService";
import { createServerClient } from "@/lib/supabase/server";
import { getReportById } from "@/lib/repositories/reportRepository";

export async function generateSummaryAction(reportId: string): Promise<string> {
  const supabase = await createServerClient();
  const report = await getReportById(supabase, reportId);
  if (!report) return "Laporan tidak ditemukan.";

  try {
    return await generateReportSummary(report);
  } catch {
    return "Gagal membuat ringkasan. Coba lagi.";
  }
}

export async function generateSuggestionAction(reportId: string): Promise<string> {
  const supabase = await createServerClient();
  const report = await getReportById(supabase, reportId);
  if (!report) return "Laporan tidak ditemukan.";

  try {
    return await generateAdminSuggestion(report);
  } catch {
    return "Gagal membuat saran. Coba lagi.";
  }
}

export async function improveTitleAction(
  title: string,
  description: string
): Promise<string> {
  try {
    return await improveReportTitle(title, description);
  } catch {
    return "";
  }
}