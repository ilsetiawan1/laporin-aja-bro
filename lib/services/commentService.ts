// ============================================================
// lib/services/commentService.ts
// Business logic for comments — coordinates commentRepository
// Always runs server-side (called from Server Actions)
// ============================================================

import { createServerClient } from "@/lib/supabase/server";
import * as commentRepo from "@/lib/repositories/commentRepository";
import type { Comment, CommentWithReplies, CreateCommentInput } from "@/types";

// ── Read Operations ──────────────────────────────────────────

/**
 * Fetch all comments for a report and build a nested tree
 * Returns root comments with their replies populated
 */
export async function getComments(
  reportId: string
): Promise<CommentWithReplies[]> {
  const supabase = await createServerClient();
  const flat = await commentRepo.getCommentsByReportId(supabase, reportId);

  // Build nested tree: root comments + their replies
  const rootComments = flat.filter((c) => !c.parent_id);
  return rootComments.map((root) => ({
    ...root,
    replies: flat.filter((c) => c.parent_id === root.id),
  }));
}

/**
 * Fetch flat list (used by realtime hook to append new comments)
 */
export async function getFlatComments(reportId: string): Promise<Comment[]> {
  const supabase = await createServerClient();
  return commentRepo.getCommentsByReportId(supabase, reportId);
}

// ── Write Operations ─────────────────────────────────────────

export interface AddCommentPayload {
  report_id: string;
  content: string;
  parent_id?: string | null;
}

export async function addComment(
  payload: AddCommentPayload,
  userId: string
): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  if (!payload.content.trim()) {
    return { success: false, error: "Komentar tidak boleh kosong." };
  }

  if (payload.content.trim().length < 3) {
    return { success: false, error: "Komentar terlalu pendek." };
  }

  const supabase = await createServerClient();

  const input: CreateCommentInput = {
    report_id: payload.report_id,
    user_id: userId,
    content: payload.content,
    parent_id: payload.parent_id ?? null,
  };

  const comment = await commentRepo.createComment(supabase, input);

  if (!comment) {
    return { success: false, error: "Gagal memposting komentar." };
  }

  return { success: true, comment };
}
