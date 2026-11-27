"use server";
// ============================================================
// lib/repositories/locationRepository.ts
// Public reference data: categories, cities, districts
// Cached via Next.js unstable_cache (public DIY master data)
// ============================================================

import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import type { Category, City, District } from "@/types";

const fetchCachedCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createPublicClient();
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

    for (const cat of data ?? []) {
      if (!seen.has(cat.name)) {
        seen.add(cat.name);
        uniqueData.push(cat);
      }
    }

    return uniqueData;
  },
  ["diy-master-categories"],
  { revalidate: 3600, tags: ["master-locations"] }
);

const fetchCachedCities = unstable_cache(
  async (): Promise<City[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("cities")
      .select("id, name")
      .order("name");

    if (error) {
      console.error("[locationRepo] getCities:", error.message);
      return [];
    }
    return data ?? [];
  },
  ["diy-master-cities"],
  { revalidate: 3600, tags: ["master-locations"] }
);

const fetchCachedDistrictsByCity = unstable_cache(
  async (cityId: string): Promise<District[]> => {
    const supabase = createPublicClient();
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
  },
  ["diy-master-districts"],
  { revalidate: 3600, tags: ["master-locations"] }
);

export async function getCategories(): Promise<Category[]> {
  return fetchCachedCategories();
}

export async function getCities(): Promise<City[]> {
  return fetchCachedCities();
}

export async function getDistrictsByCity(cityId: string): Promise<District[]> {
  if (!cityId) return [];
  return fetchCachedDistrictsByCity(cityId);
}
