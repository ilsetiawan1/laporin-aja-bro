"use server";
// ============================================================
// lib/repositories/locationRepository.ts
// Public reference data: categories, cities, districts
// ============================================================

import { createServerClient } from "@/lib/supabase/server";
import type { Category, City, District } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerClient();  // ← pindah ke dalam fungsi
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("[locationRepo] getCategories:", error.message);
    return [];
  }

  const uniqueData: Category[] = [];
  const seen = new Set<string>();

  for (const cat of (data ?? [])) {
    if (!seen.has(cat.name)) {
      seen.add(cat.name);
      uniqueData.push(cat);
    }
  }

  return uniqueData;
}

export async function getCities(): Promise<City[]> {
  const supabase = await createServerClient();  // ← pindah ke dalam fungsi
  const { data, error } = await supabase
    .from("cities")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("[locationRepo] getCities:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getDistrictsByCity(cityId: string): Promise<District[]> {
  if (!cityId) return [];

  const supabase = await createServerClient();  // ← pindah ke dalam fungsi
  const { data, error } = await supabase
    .from("districts")
    .select("id, city_id, name")
    .eq("city_id", cityId)
    .order("name");

  if (error) {
    console.error("[locationRepo] getDistrictsByCity:", error.message);
    return [];
  }
  return data ?? [];
}