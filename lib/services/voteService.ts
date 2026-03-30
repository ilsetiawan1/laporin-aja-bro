// ============================================================
// lib/services/voteService.ts
// Business logic for votes — coordinates vote + report repositories
// Always runs server-side (called from Server Actions)
// ============================================================

import { createServerClient } from "@/lib/supabase/server";
import * as voteRepo from "@/lib/repositories/voteRepository";
import * as reportRepo from "@/lib/repositories/reportRepository";

export interface ToggleVoteResult {
  success: boolean;
  voted: boolean;      // true = just voted, false = just unvoted
  voteCount: number;
  priorityScore: number;
  error?: string;
}

/**
 * Toggle vote for a report.
 * If user already voted → delete vote (unvote)
 * If user hasn't voted → insert vote
 * Then sync vote_count on report and recalculate priority_score
 */
export async function toggleVote(
  reportId: string,
  userId: string
): Promise<ToggleVoteResult> {
  const supabase = await createServerClient();

  // 1. Check if user already voted
  const existingVote = await voteRepo.getVoteByUser(supabase, reportId, userId);

  let voted: boolean;

  if (existingVote) {
    // User already voted → remove vote
    await voteRepo.deleteVote(supabase, reportId, userId);
    voted = false;
  } else {
    // User hasn't voted → add vote
    await voteRepo.insertVote(supabase, reportId, userId);
    voted = true;
  }

  // 2. Sync denormalized vote_count on reports table
  const newVoteCount = await voteRepo.syncVoteCount(supabase, reportId);

  // 3. Recalculate priority_score
  await reportRepo.updatePriorityScore(supabase, reportId);

  // 4. Fetch updated priority_score
  const { data: updatedReport } = await supabase
    .from("reports")
    .select("priority_score")
    .eq("id", reportId)
    .single();

  return {
    success: true,
    voted,
    voteCount: newVoteCount,
    priorityScore: (updatedReport?.priority_score as number) ?? 0,
  };
}

/**
 * Check if a user has voted for a specific report
 */
export async function hasUserVoted(
  reportId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createServerClient();
  const vote = await voteRepo.getVoteByUser(supabase, reportId, userId);
  return vote !== null;
}
