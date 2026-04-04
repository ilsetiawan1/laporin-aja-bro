import type { ReportPriority } from "@/types";

// Base weight per kategori berdasarkan urgensi
// Key = category_id dari DB
export const CATEGORY_WEIGHTS: Record<string, number> = {
  "cec47091-d70f-45c3-8d00-b80f75bb8676": 10, // Keamanan & Kriminal
  "3e2daf2a-617a-4c45-9089-88a610ce4786": 9,  // Pungli & Gratifikasi
  "f42e4b7c-9f07-458f-a7ca-70901e621ae8": 8,  // Kesehatan
  "857ee9c8-4c22-4956-ae95-73a7812be8cb": 7,  // Infrastruktur & Jalan
  "7905e329-53b0-4784-aa1c-37610aba0c86": 6,  // Sampah & Lingkungan
  "50dbfe66-2c6e-4834-850d-b5554cde1ae7": 5,  // Pelayanan Publik
  "b8fadc82-7497-4d7d-9635-787add9b0c4e": 4,  // Penerangan Jalan
  "25a6fa02-6588-4bca-a4b8-94138db53d5e": 3,  // Fasilitas Pendidikan
  "adcba344-55c7-4274-a773-77dc9698f672": 1,
};

/**
 * Hitung priority score:
 * score = category_base_weight + vote_count + similar_count
 */
export function calculatePriorityScore(
  voteCount: number,
  similarCount: number,
  categoryId?: string | null
): number {
  const categoryWeight = categoryId ? (CATEGORY_WEIGHTS[categoryId] ?? 1) : 1;
  return categoryWeight + voteCount + similarCount;
}

/**
 * 0–5   → "rendah"
 * 6–15  → "sedang"
 * >15   → "tinggi"
 */
export function getPriorityLabel(score: number): ReportPriority {
  if (score > 15) return "tinggi";
  if (score >= 6) return "sedang";
  return "rendah";
}

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