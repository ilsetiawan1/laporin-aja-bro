// ============================================================
// lib/utils/priorityCalculator.ts
// Priority score calculation — from CLAUDE.md spec
// ============================================================

import type { ReportPriority } from "@/types";

/**
 * Calculate priority score from vote and similar report counts
 * priority_score = vote_count + similar_count
 */
export function calculatePriorityScore(
  voteCount: number,
  similarCount: number
): number {
  return voteCount + similarCount;
}

/**
 * Get human-readable priority label from score
 * 0–5   → "rendah"
 * 6–15  → "sedang"
 * >15   → "tinggi"
 */
export function getPriorityLabel(score: number): ReportPriority {
  if (score > 15) return "tinggi";
  if (score >= 6) return "sedang";
  return "rendah";
}

/**
 * Get Tailwind CSS classes for a priority badge
 */
export function getPriorityBadgeClass(priority: ReportPriority): string {
  switch (priority) {
    case "tinggi":
      return "bg-red/10 text-red border-red/20";
    case "sedang":
      return "bg-orange/10 text-orange border-orange/20";
    case "rendah":
    default:
      return "bg-slate-100 text-slate-500 border-slate-200";
  }
}
