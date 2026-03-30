// ============================================================
// lib/repositories/commentRepository.ts
// The ONLY place allowed to run comment-related Supabase queries
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Comment, CreateCommentInput } from "@/types";

function normalizeComment(raw: Record<string, unknown>): Comment {
  const profiles = raw.profiles;
  return {
    id: raw.id as string,
    report_id: raw.report_id as string,
    user_id: raw.user_id as string,
    content: raw.content as string,
    parent_id: (raw.parent_id as string) ?? null,
    created_at: raw.created_at as string,
    profiles: Array.isArray(profiles)
      ? (profiles[0] ?? null)
      : (profiles as Comment["profiles"]),
  };
}

export async function getCommentsByReportId(
  client: SupabaseClient,
  reportId: string
): Promise<Comment[]> {
  const { data, error } = await client
    .from("comments")
    .select(
      `id, report_id, user_id, content, parent_id, created_at,
       profiles ( full_name, avatar_url )`
    )
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[commentRepo] getCommentsByReportId:", error.message);
    return [];
  }

  return ((data as Record<string, unknown>[]) ?? []).map(normalizeComment);
}

export async function createComment(
  client: SupabaseClient,
  data: CreateCommentInput
): Promise<Comment | null> {
  const { data: newComment, error } = await client
    .from("comments")
    .insert({
      report_id: data.report_id,
      user_id: data.user_id,
      content: data.content.trim(),
      parent_id: data.parent_id ?? null,
    })
    .select(
      `id, report_id, user_id, content, parent_id, created_at,
       profiles ( full_name, avatar_url )`
    )
    .single();

  if (error) {
    console.error("[commentRepo] createComment:", error.message);
    return null;
  }

  return normalizeComment(newComment as Record<string, unknown>);
}
