// ============================================================
// lib/repositories/reportRepository.ts
// The ONLY place allowed to run report-related Supabase queries
// Accepts SupabaseClient as parameter — caller creates the client
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Report,
  ReportWithRelations,
  CreateReportInput,
  ReportFilters,
} from "@/types";
import { extractKeywords } from "@/lib/utils/autoCategorize";
import { calculatePriorityScore, getPriorityLabel } from "@/lib/utils/priorityCalculator";
import { createServerClient } from "@/lib/supabase/server";

// Helper to normalize Supabase join results (can return array or object)
function pickFirst<T>(val: T | T[] | null | undefined): T | null {
  if (!val) return null;
  if (Array.isArray(val)) return val[0] ?? null;
  return val;
}

function normalizeReport(raw: Record<string, unknown>): ReportWithRelations {
  return {
    id: raw.id as string,
    user_id: (raw.user_id as string) ?? null,
    category_id: (raw.category_id as string) ?? null,
    city_id: (raw.city_id as string) ?? null,
    district_id: (raw.district_id as string) ?? null,
    title: raw.title as string,
    description: raw.description as string,
    address: (raw.address as string) ?? null,
    status: raw.status as Report["status"],
    priority: (raw.priority as Report["priority"]) ?? "rendah",
    is_anonymous: (raw.is_anonymous as boolean) ?? false,
    image_urls: (raw.image_urls as string[]) ?? [],
    priority_score: (raw.priority_score as number) ?? 0,
    similar_count: (raw.similar_count as number) ?? 0,
    vote_count: (raw.vote_count as number) ?? 0,
    comment_count: Array.isArray(raw.comments) && raw.comments.length > 0 ? (raw.comments[0] as { count: number }).count ?? 0 : ((raw.comments as { count: number } | null)?.count ?? 0),
    created_at: raw.created_at as string,
    categories: pickFirst(raw.categories as { name: string } | null),
    cities: pickFirst(raw.cities as { name: string } | null),
    districts: pickFirst(raw.districts as { name: string } | null),
    profiles: pickFirst(raw.profiles as { full_name: string | null; avatar_url: string | null } | null),
  };
}

const REPORT_SELECT = `
  id, user_id, category_id, city_id, district_id,
  title, description, address, status, priority,
  is_anonymous, image_urls, priority_score, similar_count, vote_count,
  created_at,
  categories ( name ),
  cities ( name ),
  districts ( name ),
  comments ( count ),
  profiles ( full_name, avatar_url )
`;

export async function getReports(
  client: SupabaseClient,
  filters?: ReportFilters
): Promise<ReportWithRelations[]> {
  let query = client
    .from("reports")
    .select(REPORT_SELECT)
    .order("created_at", { ascending: false })
    .limit(filters?.limit ?? 50);

  if (filters?.search && filters?.category) {
    const keywords = filters.search
      .split(" ")
      .filter((w) => w.length > 2)
      .map((w) => `title.ilike.%${w}%`)
      .join(",");
    query = query.or(`${keywords},category_id.eq.${filters.category}`);
  } else if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  } else if (filters?.category) {
    query = query.eq("category_id", filters.category);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status as Report["status"]);
  }
  if (filters?.city) {
    query = query.eq("city_id", filters.city);
  }
  if (filters?.district) {
    query = query.eq("district_id", filters.district);
  }
  if (filters?.userId) {
    query = query.eq("user_id", filters.userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[reportRepo] getReports:", error.message);
    return [];
  }

  return ((data as Record<string, unknown>[]) ?? []).map(normalizeReport);
}

export async function countSimilarReports(
  client: SupabaseClient,
  reportId: string,
  categoryId: string
): Promise<number> {
  const { count, error } = await client
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId)
    .neq("id", reportId);

  if (error) {
    console.error("[reportRepo] countSimilarReports:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function getReportById(
  client: SupabaseClient,
  id: string
): Promise<ReportWithRelations | null> {
  const { data, error } = await client
    .from("reports")
    .select(REPORT_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    console.error(error.message)
    return null;
  }

  return normalizeReport(data as Record<string, unknown>);
}

export async function createReport(
  client: SupabaseClient,
  data: CreateReportInput
): Promise<Report | null> {
  const { data: newReport, error } = await client
    .from("reports")
    .insert({
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      description: data.description,
      category_id: data.category_id,
      city_id: data.city_id,
      district_id: data.district_id ?? null,
      address: data.address ?? null,
      is_anonymous: data.is_anonymous,
      image_urls: data.image_urls ?? [],
      similar_count: data.similar_count ?? 0,
      status: "pending",
      priority_score: 0,
      vote_count: 0,
    })
    .select("id, title, status, created_at, priority, priority_score, similar_count, vote_count, image_urls, is_anonymous, user_id, category_id, city_id, district_id, address, description")
    .single();

  if (error) {
    console.error("[reportRepo] createReport:", error.message);
    return null;
  }

  return newReport as Report;
}

export async function updateReport(
  client: SupabaseClient,
  id: string,
  data: Partial<Report>
): Promise<Report | null> {
  const { data: updated, error } = await client
    .from("reports")
    .update(data)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[reportRepo] updateReport:", error.message);
    return null;
  }

  return updated as Report;
}

export async function updatePriorityScore(
  client: SupabaseClient,
  reportId: string
): Promise<void> {
  // Fetch vote_count, similar_count, DAN category_id
  const { data: report } = await client
    .from("reports")
    .select("vote_count, similar_count, category_id")
    .eq("id", reportId)
    .single();

  if (!report) return;

  const score = calculatePriorityScore(
    report.vote_count ?? 0,
    report.similar_count ?? 0,
    report.category_id ?? null  // ← tambah ini
  );
  const priority = getPriorityLabel(score);

  const { error } = await client
    .from("reports")
    .update({ priority_score: score, priority })
    .eq("id", reportId);

  if (error) {
    console.error("[reportRepo] updatePriorityScore:", error.message);
  }
}

export async function findSimilarReports(
  client: SupabaseClient,
  title: string,
  categoryId?: string | null,  // ← tambah parameter
  excludeId?: string
): Promise<string[]> {
  const keywords = extractKeywords(title); // cukup dari title saja

  if (keywords.length === 0 && !categoryId) return [];

  // Build query berdasarkan keyword ATAU kategori yang sama
  let query = client
    .from("reports")
    .select("id");

  if (keywords.length > 0 && categoryId) {
    const keywordFilter = keywords
      .map((kw) => `title.ilike.%${kw}%`)
      .join(",");
    query = query.or(`${keywordFilter},category_id.eq.${categoryId}`);
  } else if (keywords.length > 0) {
    const keywordFilter = keywords
      .map((kw) => `title.ilike.%${kw}%`)
      .join(",");
    query = query.or(keywordFilter);
  } else if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(10);

  if (error) {
    console.error("[reportRepo] findSimilarReports:", error.message);
    return [];
  }

  return (data ?? []).map((r: { id: string }) => r.id);
}


export async function updateImageUrls(
  client: SupabaseClient,
  reportId: string,
  imageUrls: string[]
): Promise<void> {
  const { error } = await client
    .from("reports")
    .update({ image_urls: imageUrls })
    .eq("id", reportId);

  if (error) {
    console.error("[reportRepo] updateImageUrls:", error.message);
  }
}

export async function getUserVotedReportIds(userId: string): Promise<Set<string>> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("report_votes")
    .select("report_id")
    .eq("user_id", userId);

  return new Set((data ?? []).map((v) => v.report_id));
}

export interface AdminStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Array<{ name: string; count: number }>;
  highPriority: ReportWithRelations[];
  recent: ReportWithRelations[];
}

export async function getAdminStats(
  client: SupabaseClient
): Promise<AdminStats> {
  // 1. Total semua laporan
  const { count: total } = await client
    .from("reports")
    .select("*", { count: "exact", head: true });

  // 2. Hitung per status
  const { data: statusData } = await client
    .from("reports")
    .select("status");

  const byStatus: Record<string, number> = {
    pending: 0,
    diproses: 0,
    selesai: 0,
    ditolak: 0,
  };
  (statusData ?? []).forEach((r: { status: string }) => {
    if (r.status in byStatus) byStatus[r.status]++;
  });

  // 3. Hitung per kategori
 // 3. Hitung per kategori — fix: categories bisa object ATAU array
// 3. Hitung per kategori
const { data: catData } = await client
  .from("reports")
  .select("category_id, categories ( name )");

const catMap: Record<string, number> = {};
(catData ?? []).forEach((r: { categories: { name: string } | { name: string }[] | null }) => {
  const cat = Array.isArray(r.categories) ? r.categories[0] : r.categories;
  const name = cat?.name ?? "Tidak Berkategori";
  catMap[name] = (catMap[name] ?? 0) + 1;
});

// ← INI yang kurang
const byCategory = Object.entries(catMap)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count);

  // 4. Laporan prioritas tinggi (score > 15)
  const { data: highRaw } = await client
    .from("reports")
    .select(REPORT_SELECT)
    .gt("priority_score", 15)
    .order("priority_score", { ascending: false })
    .limit(5);

  const highPriority = ((highRaw as Record<string, unknown>[]) ?? []).map(normalizeReport);

  // 5. Laporan terbaru
  const { data: recentRaw } = await client
    .from("reports")
    .select(REPORT_SELECT)
    .order("created_at", { ascending: false })
    .limit(10);

  const recent = ((recentRaw as Record<string, unknown>[]) ?? []).map(normalizeReport);

  return {
    total: total ?? 0,
    byStatus,
    byCategory,
    highPriority,
    recent,
  };
}