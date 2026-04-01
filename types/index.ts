// types/index.ts
// ============================================================
// Laporin Aja Bro — Centralized TypeScript Types
// ============================================================

// === Enums / Union Types ===

export type ReportStatus = "pending" | "diproses" | "selesai" | "ditolak";
export type ReportPriority = "rendah" | "sedang" | "tinggi";
export type UserRole = "admin" | "user";

// === Core Entities ===

export interface Report {
  id: string;
  user_id: string | null;
  category_id: string | null;
  city_id: string | null;
  district_id: string | null;
  title: string;
  description: string;
  address: string | null;
  status: ReportStatus;
  priority: ReportPriority;
  is_anonymous: boolean;
  image_urls: string[];
  priority_score: number;
  similar_count: number;
  vote_count: number;
  comment_count: number;
  created_at: string;
}

export interface ReportWithRelations extends Report {
  categories: { name: string } | null;
  cities: { name: string } | null;
  districts: { name: string } | null;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
  user_votes?: boolean;
}

export interface ReportDetail extends ReportWithRelations {
  ai_analysis?: AiAnalysis | null;
  status_logs?: ReportStatusLog[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface City {
  id: string;
  name: string;
}

export interface District {
  id: string;
  city_id: string;
  name: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  phone_number?: string | null;
  gender?: string | null;
  birth_date?: string | null;
  city_id?: string | null;
  district_id?: string | null;
  created_at: string;
}

export interface AiAnalysis {
  id: string;
  report_id: string;
  summary?: string | null;
  suggested_agency?: string | null;
  category_suggestion?: string | null;
  priority?: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  report_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

export interface ReportVote {
  id: string;
  report_id: string;
  user_id: string;
  created_at: string;
}

export interface ReportStatusLog {
  id: string;
  report_id: string;
  status: string;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

// === Input / DTO Types ===

export interface CreateReportInput {
  id?: string;
  user_id: string | null;
  title: string;
  description: string;
  category_id: string;
  city_id: string;
  district_id?: string | null;
  address?: string | null;
  is_anonymous: boolean;
  image_urls?: string[];
  similar_count?: number;
}

export interface CreateCommentInput {
  report_id: string;
  user_id: string;
  content: string;
  parent_id?: string | null;
}

export interface UpdateStatusInput {
  status: ReportStatus;
  note?: string;
}

// === Filter / Query Types ===

export interface ReportFilters {
  search?: string;
  category?: string;
  city?: string;
  district?: string;
  status?: string;
  userId?: string;
  limit?: number;
}
