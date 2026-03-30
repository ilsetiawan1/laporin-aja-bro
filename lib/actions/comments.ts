"use server";

// ============================================================
// lib/actions/comments.ts
// Thin server action wrappers — delegate to lib/services/
// NO direct Supabase queries here
// ============================================================

import { createServerClient } from "@/lib/supabase/server";
import * as commentService from "@/lib/services/commentService";
import type { Comment, CommentWithReplies } from "@/types";

// export type { Comment, CommentWithReplies };

export async function getComments(
  reportId: string
): Promise<CommentWithReplies[]> {
  return commentService.getComments(reportId);
}

export async function getFlatComments(reportId: string): Promise<Comment[]> {
  return commentService.getFlatComments(reportId);
}

export async function postComment(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login untuk berkomentar." };
  }

  const reportId = formData.get("report_id") as string;
  const content = formData.get("content") as string;
  const parentId = formData.get("parent_id") as string | null;

  if (!reportId) {
    return { error: "Report ID tidak valid." };
  }

  const result = await commentService.addComment(
    {
      report_id: reportId,
      content,
      parent_id: parentId || null,
    },
    user.id
  );

  if (!result.success) {
    return { error: result.error };
  }

  return { success: true };
}
