"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { useRealtimeComments } from "@/lib/hooks/useRealtimeComments";
import { getFlatComments, postComment } from "@/lib/actions/comments";
import { useRouter } from "next/navigation";
import type { Comment } from "@/types";

export default function ReportComments({
  reportId,
  user,
}: {
  reportId: string;
  user: { id: string } | null;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Initial fetch via server action (no direct supabase)
  useEffect(() => {
    getFlatComments(reportId).then((data) => setComments(data));
  }, [reportId]);

  // Realtime subscription via hook (allowed exception)
  useRealtimeComments({
    reportId,
    onNewComment: (newComment) => {
      setComments((prev) => {
        // Dedupe: don't add if already in list
        if (prev.find((c) => c.id === newComment.id)) return prev;
        return [...prev, newComment];
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!user) {
      toast.error("Silakan login untuk berkomentar.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("report_id", reportId);
    formData.append("content", content);
    if (replyTo) formData.append("parent_id", replyTo);

    const res = await postComment(formData);
    if (res.error) {
      toast.error("Gagal", { description: res.error });
    } else {
      setContent("");
      setReplyTo(null);
      router.refresh();
    }
    setIsSubmitting(false);
  };

  // Group comments into tree
  const rootComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId);

  return (
    <div className="mt-10 pt-10 border-t border-navy/10 rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-navy mb-6">Komentar &amp; Diskusi</h3>

      {/* List Comments */}
      {comments.length === 0 ? (
        <p className="text-navy/50 text-center py-6">
          Belum ada komentar.{" "}
          {user ? "Jadilah yang pertama!" : "Login untuk memberikan komentar."}
        </p>
      ) : (
        <div className="space-y-6 mb-8">
          {rootComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              allComments={comments}
              user={user}
              onReply={(id) => setReplyTo(id)}
            />
          ))}
        </div>
      )}

      {/* Input */}
      {user ? (
        <form
          onSubmit={handleSubmit}
          className="bg-navy/5 p-4 rounded-xl border border-navy/10"
        >
          {replyTo && (
            <div className="flex justify-between items-center mb-2 bg-blue/10 px-3 py-1.5 rounded-md text-sm text-blue">
              <span>Membalas komentar...</span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="font-bold hover:text-blue-700"
              >
                Tutup
              </button>
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tuliskan komentar Anda di sini..."
            className="w-full bg-white border border-navy/10 rounded-lg p-3 text-sm focus:border-blue min-h-[100px] outline-hidden mb-3"
            required
            disabled={isSubmitting}
          />
          <div className="text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-2 px-6 text-sm"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Komentar"}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center p-6 bg-navy/5 rounded-xl border border-navy/10">
          <p className="text-navy/70 mb-3 text-sm">
            Masuk untuk bisa memberikan komentar.
          </p>
          <button
            onClick={() => router.push("/?modal=login")}
            className="btn-outline text-sm"
          >
            Masuk Sekarang
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Recursive Comment Thread ─────────────────────────────────

function CommentThread({
  comment,
  replies,
  allComments,
  user,
  onReply,
}: {
  comment: Comment;
  replies: Comment[];
  allComments: Comment[];
  user: { id: string } | null;
  onReply: (id: string) => void;
}) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="rounded-lg">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-navy/10 shrink-0 overflow-hidden relative border border-navy/5">
          {comment.profiles?.avatar_url ? (
            <Image
              src={comment.profiles.avatar_url}
              alt="Avatar"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-navy/40">
              {comment.profiles?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white border rounded-lg p-3 inline-block w-full text-sm">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-semibold text-navy">
                {comment.profiles?.full_name || "Guest"}
              </span>
              <span className="text-[10px] text-navy/50">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: id,
                })}
              </span>
            </div>
            <p className="text-navy/80 whitespace-pre-wrap">{comment.content}</p>
          </div>

          <div className="flex gap-4 mt-1.5 ml-2 text-xs font-semibold">
            {user && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-navy/40 hover:text-blue transition-colors"
              >
                Balas
              </button>
            )}
            {replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-navy/40 hover:text-orange transition-colors"
              >
                {showReplies
                  ? "Sembunyikan balasan"
                  : `Lihat ${replies.length} balasan`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {replies.length > 0 && showReplies && (
        <div className="ml-8 mt-4 pl-4 border-l-2 border-navy/10 space-y-4">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              replies={allComments.filter((c) => c.parent_id === reply.id)}
              allComments={allComments}
              user={user}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
