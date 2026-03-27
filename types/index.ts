// Types untuk Report entity
export type ReportStatus = "menunggu" | "diproses" | "selesai" | "ditolak";

export interface Report {
  id: string;
  user_id: string | null;
  category_id: string | null;
  city_id: string | null;
  district_id: string | null;
  title: string;
  description: string;
  status: ReportStatus;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
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
  role: "admin" | "user";
  full_name?: string;
  created_at: string;
}

export interface AiAnalysis {
  id: string;
  report_id: string;
  summary?: string;
  suggested_agency?: string;
  category_suggestion?: string;
  created_at: string;
}
