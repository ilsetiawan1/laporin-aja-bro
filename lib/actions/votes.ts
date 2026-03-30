"use server";

// ============================================================
// lib/actions/votes.ts
// Thin server action wrapper for vote operations
// ============================================================

import { createServerClient } from "@/lib/supabase/server";
import * as voteService from "@/lib/services/voteService";
import type { ToggleVoteResult } from "@/lib/services/voteService";
import { revalidatePath } from "next/cache";

export async function checkUserVoteAction(
  reportId: string
): Promise<{ hasVoted: boolean; userId: string | null }> {
  const supabase = await createServerClient();

  // Kembali ke getUser() — lebih reliable di server dengan cookie SSR
  const { data: { user }, error } = await supabase.auth.getUser();

  console.log("[checkUserVote] user:", user?.id, "error:", error?.message);

  if (!user) return { hasVoted: false, userId: null };

  const hasVoted = await voteService.hasUserVoted(reportId, user.id);
  console.log("[checkUserVote] hasVoted:", hasVoted);

  return { hasVoted, userId: user.id };
}

export async function toggleVoteAction(reportId: string): Promise<ToggleVoteResult> {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    return { success: false, voted: false, voteCount: 0, priorityScore: 0, error: "Anda harus login." };
  }

  const result = await voteService.toggleVote(reportId, user.id);

  // Paksa Next.js refetch data terbaru
  revalidatePath(`/reports/${reportId}`);
  revalidatePath("/");

  return result;
}

export async function getUserVotedIdsAction(): Promise<string[]> {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return [];

  const { data } = await supabase
    .from("report_votes")
    .select("report_id")
    .eq("user_id", user.id);

  return (data ?? []).map((v) => v.report_id);
}