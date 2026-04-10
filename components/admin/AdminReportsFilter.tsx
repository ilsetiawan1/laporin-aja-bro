"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";

interface Props {
  categories: { id: string; name: string }[];
  cities: { id: string; name: string }[];
  currentSearch: string;
  currentStatus: string;
  currentCategory: string;
  currentCity: string;
  currentSort: string;
  currentOrder: string;
}

type FilterState = {
  search: string;
  status: string;
  category: string;
  city: string;
};

const DEBOUNCE_MS = 400;

export default function AdminReportsFilter({
  categories,
  cities,
  currentSearch,
  currentStatus,
  currentCategory,
  currentCity,
  currentSort,
  currentOrder,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentSearch);
  const [status, setStatus] = useState(currentStatus);
  const [category, setCategory] = useState(currentCategory);
  const [city, setCity] = useState(currentCity);

  // Sync state dari URL (penting untuk tombol back/forward browser)
  useEffect(() => {
    setSearch(currentSearch || "");
    setStatus(currentStatus || "");
    setCategory(currentCategory || "");
    setCity(currentCity || "");
  }, [currentSearch, currentStatus, currentCategory, currentCity]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Always-current snapshot used inside debounce callbacks to avoid stale closures
  const latestFilters = useRef({ search, status, category, city });
  useEffect(() => {
    latestFilters.current = { search, status, category, city };
  });

  const applyFilters = (overrides: Partial<FilterState>) => {
    const f = { ...latestFilters.current, ...overrides };
    const params = new URLSearchParams();

    if (f.search) params.set("search", f.search);
    if (f.status) params.set("status", f.status);
    if (f.category) params.set("category", f.category);
    if (f.city) params.set("city", f.city);

    // Preserve current sort/order
    if (currentSort) params.set("sort", currentSort);
    if (currentOrder) params.set("order", currentOrder);
    // Filter change always resets to page 1

    startTransition(() => {
      router.push(`/admin/reports?${params.toString()}`);
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Read from ref so the callback always sees the latest search value
      applyFilters({ search: value });
    }, DEBOUNCE_MS);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setCategory("");
    setCity("");
    
    const params = new URLSearchParams();
    if (currentSort) params.set("sort", currentSort);
    if (currentOrder) params.set("order", currentOrder);
    
    const queryString = params.toString();
    startTransition(() => {
      router.push(`/admin/reports${queryString ? `?${queryString}` : ""}`);
    });
  };

  const activeFilterCount = [status, category, city, search].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;

  return (
    <div className="relative z-20 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            disabled={isPending}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                applyFilters({ search });
              }
            }}
            placeholder="Cari judul laporan..."
            className="input-field pl-9 w-full text-xs h-10 border-slate-200 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Status Dropdown */}
        <select
          value={status}
          disabled={isPending}
          onChange={(e) => {
            const val = e.target.value;
            setStatus(val);
            applyFilters({ status: val });
          }}
          className="input-field text-xs h-10 w-full sm:w-40 border-slate-200 cursor-pointer"
        >
          <option value="">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="diproses">Diproses</option>
          <option value="selesai">Selesai</option>
          <option value="ditolak">Ditolak</option>
        </select>

        {/* Kategori Dropdown */}
        <select
          value={category}
          disabled={isPending}
          onChange={(e) => {
            const val = e.target.value;
            setCategory(val);
            applyFilters({ category: val });
          }}
          className="input-field text-xs h-10 w-full sm:w-48 border-slate-200 cursor-pointer"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Kota Dropdown */}
        <select
          value={city}
          disabled={isPending}
          onChange={(e) => {
            const val = e.target.value;
            setCity(val);
            applyFilters({ city: val });
          }}
          className="input-field text-xs h-10 w-full sm:w-44 border-slate-200 cursor-pointer"
        >
          <option value="">Semua Kota</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Loading Spinner */}
        <div className="w-6 flex items-center justify-center shrink-0">
          {isPending && (
            <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Chips Section */}
      {hasFilters && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-50 text-blue-600">
              {activeFilterCount} Filter Aktif
            </span>

            {search && <Chip label={`"${search}"`} icon="search" />}
            {status && (
              <Chip 
                label={{ pending: "Menunggu", diproses: "Diproses", selesai: "Selesai", ditolak: "Ditolak" }[status] || status} 
              />
            )}
            {category && <Chip label={categories.find(c => c.id === category)?.name} />}
            {city && <Chip label={cities.find(c => c.id === city)?.name} />}
          </div>

          <button
            onClick={clearFilters}
            className="text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors shrink-0 ml-4"
          >
            Reset filter
          </button>
        </div>
      )}
    </div>
  );
}

// Sub-component kecil untuk kerapihan kode
function Chip({ label, icon }: { label?: string; icon?: string }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
      {icon === "search" && (
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={2.5} />
        </svg>
      )}
      {label}
    </span>
  );
}