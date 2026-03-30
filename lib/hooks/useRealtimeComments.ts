"use client";

// ============================================================
// lib/hooks/useRealtimeComments.ts
// Realtime comment subscription — ALLOWED EXCEPTION
// Supabase Realtime channels must run in client context
// ============================================================

import { useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Comment } from "@/types";

interface UseRealtimeCommentsOptions {
  reportId: string;
  onNewComment: (comment: Comment) => void;
}

export function useRealtimeComments({
  reportId,
  onNewComment,
}: UseRealtimeCommentsOptions): void {
  const handleNewComment = useCallback(
    async (payload: { new: Record<string, unknown> }) => {
      const raw = payload.new;

      // Fetch the commenter's profile for display
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", raw.user_id)
        .single();

      const newComment: Comment = {
        id: raw.id as string,
        report_id: raw.report_id as string,
        user_id: raw.user_id as string,
        content: raw.content as string,
        parent_id: (raw.parent_id as string) ?? null,
        created_at: raw.created_at as string,
        profiles: profile ?? null,
      };

      onNewComment(newComment);
    },
    [onNewComment]
  );

  useEffect(() => {
    const channel = supabase
      .channel(`comments:${reportId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `report_id=eq.${reportId}`,
        },
        handleNewComment
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reportId, handleNewComment]);
}
