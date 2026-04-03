"use server";

import { generateReportSummary, generateAdminSuggestion, improveReportTitle } from "@/lib/services/aiService";
import { createServerClient } from "@/lib/supabase/server";
import { getReportById } from "@/lib/repositories/reportRepository";

export async function generateSummaryAction(reportId: string): Promise<string> {
  const supabase = await createServerClient();
  const report = await getReportById(supabase, reportId);

  console.log("[AI] report:", report?.title, "categories:", report?.categories);

  if (!report) return "Laporan tidak ditemukan.";

  try {
    const result = await generateReportSummary(report);
    console.log("[AI] result:", result);
    return result;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("429")) {
      return "⏳ AI sedang sibuk (quota habis). Coba lagi dalam beberapa menit.";
    }
    return "Gagal membuat ringkasan. Coba lagi.";
  }
}

export async function generateSuggestionAction(reportId: string): Promise<string> {
  const supabase = await createServerClient();
  const report = await getReportById(supabase, reportId);
  if (!report) return "Laporan tidak ditemukan.";

  try {
    return await generateAdminSuggestion(report);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("429")) {
      return "⏳ AI sedang sibuk (quota habis). Coba lagi dalam beberapa menit.";
    }
    return "Gagal membuat ringkasan. Coba lagi.";
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