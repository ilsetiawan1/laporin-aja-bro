"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function getCities() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Error fetching cities:", error);
    return [];
  }

  return data;
}

export async function getDistricts(cityId: string) {
  if (!cityId) return [];
  
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("districts")
    .select("id, name")
    .eq("city_id", cityId)
    .order("name");

  if (error) {
    console.error("Error fetching districts:", error);
    return [];
  }

  return data;
}
