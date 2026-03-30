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
  districts ( name )
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

  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status as Report["status"]);
  }
  if (filters?.city) {
    query = query.eq("city_id", filters.city);
  }
  if (filters?.category) {
    query = query.eq("category_id", filters.category);
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

export async function getReportById(
  client: SupabaseClient,
  id: string
): Promise<ReportWithRelations | null> {
  const { data, error } = await client
    .from("reports")
    .select(
      `${REPORT_SELECT}, profiles ( full_name, avatar_url )`
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("[reportRepo] getReportById:", error.message);
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
  // Fetch current counts
  const { data: report } = await client
    .from("reports")
    .select("vote_count, similar_count")
    .eq("id", reportId)
    .single();

  if (!report) return;

  const score = calculatePriorityScore(
    report.vote_count ?? 0,
    report.similar_count ?? 0
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
  description?: string,
  excludeId?: string
): Promise<string[]> {
  // Combine title + description untuk keyword extraction
  const combinedText = [title, description].filter(Boolean).join(" ");
  const keywords = extractKeywords(combinedText);
  if (keywords.length === 0) return [];

  // Build OR filter: title ILIKE OR description ILIKE per keyword
  const orFilter = keywords
    .map((kw) => `title.ilike.%${kw}%,description.ilike.%${kw}%`)
    .join(",");

  let query = client
    .from("reports")
    .select("id")
    .or(orFilter)
    .limit(10);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

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