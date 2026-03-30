"use client";

// ============================================================
// components/reports/VoteButton.tsx
// Upvote button dengan optimistic update
// ============================================================

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { toggleVoteAction } from "@/lib/actions/votes";
import { getPriorityLabel, getPriorityBadgeClass } from "@/lib/utils/priorityCalculator";
import type { ReportPriority } from "@/types";

interface VoteButtonProps {
  reportId: string;
  initialVoteCount: number;
  initialHasVoted: boolean;
  initialPriorityScore: number;
  initialPriority: ReportPriority;
  userId: string | null;
  authLoading?: boolean;
  size?: "sm" | "md";
}

export default function VoteButton({
  reportId,
  initialVoteCount,
  initialHasVoted,
  initialPriorityScore,
  initialPriority,
  userId,
  authLoading = false,
  size = "md",
}: VoteButtonProps) {
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [priorityScore, setPriorityScore] = useState(initialPriorityScore);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setHasVoted(initialHasVoted);
  }, [initialHasVoted]);
  
  const priority = getPriorityLabel(priorityScore) || initialPriority;
  const badgeClass = getPriorityBadgeClass(priority);

  const handleVote = () => {
    console.log("CLICK:", { userId, authLoading, isPending });
    if (authLoading) return;

    if (!userId) {
      toast.error("Login diperlukan", {
        description: "Silakan login untuk memberikan dukungan pada laporan ini.",
      });
      return;
    }

    const optimisticVoted = !hasVoted;
    const optimisticCount = hasVoted ? voteCount - 1 : voteCount + 1;
    setHasVoted(optimisticVoted);
    setVoteCount(optimisticCount);

    startTransition(async () => {
      const result = await toggleVoteAction(reportId);

      if (!result.success) {
        setHasVoted(hasVoted);
        setVoteCount(voteCount);
        toast.error("Gagal", { description: result.error ?? "Terjadi kesalahan." });
        return;
      }

      // Update dengan data aktual dari server
      setVoteCount(result.voteCount);
      setPriorityScore(result.priorityScore);

      if (result.voted) {
        toast.success("Dukungan diberikan!", {
          description: "Laporan ini sekarang mendapat dukungan Anda.",
        });
      }
    });
  };

  if (size === "sm") {
    return (
      <button
        onClick={handleVote}
        disabled={isPending || authLoading}
        aria-label={hasVoted ? "Batalkan dukungan" : "Dukung laporan ini"}
        title={!userId ? "Login untuk mendukung laporan" : undefined}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${hasVoted
          ? "bg-orange/15 border-orange/30 text-orange"
          : "bg-slate-50 border-slate-200 text-navy/50 hover:bg-orange/10 hover:border-orange/25 hover:text-orange"
          } ${isPending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${!userId ? "cursor-not-allowed opacity-60" : ""
          }`}
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${hasVoted ? "fill-orange" : "fill-none group-hover:scale-110"}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={hasVoted ? 0 : 2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
          />
        </svg>
        <span>{voteCount}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Vote Button */}
      <button
        onClick={handleVote}
        disabled={isPending || !userId || authLoading}
        aria-label={hasVoted ? "Batalkan dukungan" : "Dukung laporan ini"}
        className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all duration-200 active:scale-95 ${hasVoted
          ? "bg-orange text-white border-orange shadow-orange/25 shadow-md"
          : "bg-white text-navy/60 border-navy/15 hover:border-orange/40 hover:bg-orange/5 hover:text-orange"
          } ${isPending ? "opacity-60 cursor-not-allowed" : ""} ${!userId ? "cursor-not-allowed opacity-50" : ""
          }`}
      >
        {isPending ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg
            className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${hasVoted ? "fill-white" : "fill-none"}`}
            viewBox="0 0 24 24"
            stroke={hasVoted ? "none" : "currentColor"}
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
            />
          </svg>
        )}
        <span>{hasVoted ? "Didukung" : "Dukung"}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold ${hasVoted ? "bg-white/20 text-white" : "bg-navy/10 text-navy/60"
            }`}
        >
          {voteCount}
        </span>
      </button>

      {/* Priority Badge */}
      <PriorityBadge priority={priority} badgeClass={badgeClass} />
    </div>
  );
}

// ── Priority Badge Subcomponent ───────────────────────────────

interface PriorityBadgeProps {
  priority: ReportPriority;
  badgeClass: string;
}

export function PriorityBadge({ priority, badgeClass }: PriorityBadgeProps) {
  const LABELS: Record<ReportPriority, string> = {
    rendah: "Prioritas Rendah",
    sedang: "Prioritas Sedang",
    tinggi: "Prioritas Tinggi",
  };

  const ICONS: Record<ReportPriority, string> = {
    rendah: "↓",
    sedang: "→",
    tinggi: "↑",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${badgeClass}`}
    >
      <span>{ICONS[priority]}</span>
      {LABELS[priority]}
    </span>
  );
}
