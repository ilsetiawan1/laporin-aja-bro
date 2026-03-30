"use server";

// ============================================================
// lib/actions/locations.ts
// Thin server action wrappers for location data
// Delegates to locationRepository (public data)
// ============================================================

import * as locationRepo from "@/lib/repositories/locationRepository";
import type { Category, City, District } from "@/types";

// export type { Category, City, District };

export async function getCategories(): Promise<Category[]> {
  return locationRepo.getCategories();
}

export async function getCities(): Promise<City[]> {
  return locationRepo.getCities();
}

export async function getDistricts(cityId: string): Promise<District[]> {
  return locationRepo.getDistrictsByCity(cityId);
}

// Keep legacy name for backward compatibility
export async function getDistrictsByCity(cityId: string): Promise<District[]> {
  return locationRepo.getDistrictsByCity(cityId);
}
