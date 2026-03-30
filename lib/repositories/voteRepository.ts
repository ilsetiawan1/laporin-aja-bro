// ============================================================
// lib/repositories/voteRepository.ts
// The ONLY place allowed to run vote-related Supabase queries
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReportVote } from "@/types";

export async function getVoteByUser(
  client: SupabaseClient,
  reportId: string,
  userId: string
): Promise<ReportVote | null> {
  const { data, error } = await client
    .from("report_votes")
    .select("id, report_id, user_id, created_at")
    .eq("report_id", reportId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[voteRepo] getVoteByUser:", error.message);
    return null;
  }

  return data as ReportVote | null;
}

export async function insertVote(
  client: SupabaseClient,
  reportId: string,
  userId: string
): Promise<void> {
  const { error } = await client
    .from("report_votes")
    .insert({ report_id: reportId, user_id: userId });

  if (error) {
    // Ignore duplicate key errors (user already voted)
    if (!error.message.includes("duplicate key")) {
      console.error("[voteRepo] insertVote:", error.message);
    }
  }
}

export async function deleteVote(
  client: SupabaseClient,
  reportId: string,
  userId: string
): Promise<void> {
  const { error } = await client
    .from("report_votes")
    .delete()
    .eq("report_id", reportId)
    .eq("user_id", userId);

  if (error) {
    console.error("[voteRepo] deleteVote:", error.message);
  }
}

export async function getVoteCount(
  client: SupabaseClient,
  reportId: string
): Promise<number> {
  const { count, error } = await client
    .from("report_votes")
    .select("*", { count: "exact", head: true })
    .eq("report_id", reportId);

  if (error) {
    console.error("[voteRepo] getVoteCount:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function syncVoteCount(
  client: SupabaseClient,
  reportId: string
): Promise<number> {
  const count = await getVoteCount(client, reportId);

  await client
    .from("reports")
    .update({ vote_count: count })
    .eq("id", reportId);

  return count;
}
