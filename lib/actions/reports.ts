"use server";

import { createServerClient } from "@/lib/supabase/server";
import { supabase as publicClient } from "@/lib/supabase/client";

export type Report = {
  id: string;
  title: string;
  status: "pending" | "diproses" | "selesai" | "ditolak";
  created_at: string;
  is_anonymous: boolean;
  cities: { name: string } | null;
  districts: { name: string } | null;
  categories: { name: string } | null;
};

type RawReport = {
  id: string;
  title: string;
  status: "pending" | "diproses" | "selesai" | "ditolak";
  created_at: string;
  is_anonymous: boolean;
  cities: { name: string } | { name: string }[] | null;
  districts: { name: string } | { name: string }[] | null;
  categories: { name: string } | { name: string }[] | null;
};

function normalizeReport(raw: RawReport): Report {
  return {
    id: raw.id,
    title: raw.title,
    status: raw.status,
    created_at: raw.created_at,
    is_anonymous: raw.is_anonymous ?? false,
    cities: Array.isArray(raw.cities) ? raw.cities[0] ?? null : raw.cities,
    districts: Array.isArray(raw.districts)
      ? raw.districts[0] ?? null
      : raw.districts,
    categories: Array.isArray(raw.categories)
      ? raw.categories[0] ?? null
      : raw.categories,
  };
}

// Fetch latest reports for landing page (public)
export async function getLatestReports(): Promise<Report[]> {
  const { data, error } = await publicClient
    .from("reports")
    .select(
      `id, title, status, created_at, is_anonymous,
       cities ( name ), districts ( name ), categories ( name )`
    )
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Error fetching latest reports:", error.message);
    return [];
  }

  return ((data as RawReport[]) ?? []).map(normalizeReport);
}

// Fetch all public reports with optional filters for /status page
export async function getPublicReports(params: {
  search?: string;
  category?: string;
  city?: string;
  status?: string;
}): Promise<Report[]> {
  let query = publicClient
    .from("reports")
    .select(
      `id, title, status, created_at, is_anonymous,
       cities ( name ), districts ( name ), categories ( name )`
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (params.search) {
    query = query.ilike("title", `%${params.search}%`);
  }

  if (params.status) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = query.eq("status", params.status as any);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching public reports:", error.message);
    return [];
  }

  return ((data as RawReport[]) ?? []).map(normalizeReport);
}

// Upload images to report_attachments bucket and return public URLs
async function uploadImages(
  files: File[],
  reportId: string
): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${reportId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await publicClient.storage
      .from("report_attachments")
      .upload(filename, file, { upsert: false });

    if (error) {
      console.error("Upload error:", error.message);
      continue;
    }

    const { data: urlData } = publicClient.storage
      .from("report_attachments")
      .getPublicUrl(filename);

    if (urlData?.publicUrl) {
      urls.push(urlData.publicUrl);
    }
  }

  return urls;
}

// Submit a new report (auth required to attach user_id; also allows anon reports)
export async function submitReport(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const serverClient = await createServerClient();

  const {
    data: { user },
  } = await serverClient.auth.getUser();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category_id = formData.get("category_id") as string;
  const city_id = formData.get("city_id") as string;
  const district_id = formData.get("district_id") as string;
  const address = formData.get("address") as string;
  const is_anonymous = formData.get("is_anonymous") === "true";

  if (!title || !description || !category_id || !city_id) {
    return { error: "Harap lengkapi semua field wajib." };
  }

  // Insert report first (to get the ID for image paths)
  const { data: newReport, error: insertError } = await serverClient
    .from("reports")
    .insert({
      user_id: user?.id ?? null,
      title,
      description,
      category_id,
      city_id,
      district_id: district_id || null,
      address: address || null,
      is_anonymous,
      status: "pending",
      image_urls: [],
    })
    .select("id")
    .single();

  if (insertError || !newReport) {
    console.error("Error inserting report:", insertError?.message);
    return { error: "Gagal mengirim laporan. Silakan coba lagi." };
  }

  // Handle image uploads if any
  const imageFiles: File[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("image_") && value instanceof File && value.size > 0) {
      imageFiles.push(value);
    }
  }

  if (imageFiles.length > 0) {
    const imageUrls = await uploadImages(imageFiles, newReport.id);

    if (imageUrls.length > 0) {
      await serverClient
        .from("reports")
        .update({ image_urls: imageUrls })
        .eq("id", newReport.id);
    }
  }

  return { success: true };
}

// Fetch categories
export async function getCategories() {
  const { data } = await publicClient
    .from("categories")
    .select("id, name")
    .order("name");
  return data ?? [];
}

// Fetch cities
export async function getCities() {
  const { data } = await publicClient
    .from("cities")
    .select("id, name")
    .order("name");
  return data ?? [];
}

// Fetch districts by city_id
export async function getDistrictsByCity(cityId: string) {
  const { data } = await publicClient
    .from("districts")
    .select("id, name")
    .eq("city_id", cityId)
    .order("name");
  return data ?? [];
}
