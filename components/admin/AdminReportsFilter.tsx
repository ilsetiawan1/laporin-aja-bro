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

  // State lokal untuk input instan
  const [search, setSearch] = useState(currentSearch);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state lokal jika props dari server berubah (back/forward button)
  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  const applyFilters = (overrides: { search?: string; status?: string; category?: string; city?: string }) => {
    const params = new URLSearchParams();

    // Ambil nilai terbaru (dari override atau props saat ini)
    const fSearch = overrides.search !== undefined ? overrides.search : currentSearch;
    const fStatus = overrides.status !== undefined ? overrides.status : currentStatus;
    const fCat = overrides.category !== undefined ? overrides.category : currentCategory;
    const fCity = overrides.city !== undefined ? overrides.city : currentCity;

    if (fSearch) params.set("search", fSearch);
    if (fStatus) params.set("status", fStatus);
    if (fCat) params.set("category", fCat);
    if (fCity) params.set("city", fCity);

    if (currentSort) params.set("sort", currentSort);
    if (currentOrder) params.set("order", currentOrder);

    startTransition(() => {
      router.push(`/admin/reports?${params.toString()}`);
    });
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters({ search: val });
    }, 500);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (currentSort) params.set("sort", currentSort);
    if (currentOrder) params.set("order", currentOrder);

    startTransition(() => {
      router.push(`/admin/reports?${params.toString()}`);
    });
  };

  const activeFilterCount = [currentStatus, currentCategory, currentCity, currentSearch].filter(Boolean).length;

  return (
    // relative z-30 memastikan dropdown tidak tertindih tabel
    <div className="relative z-30 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
      <div className="flex flex-col lg:flex-row gap-3">

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
            onKeyDown={(e) => e.key === "Enter" && applyFilters({ search })}
            placeholder="Cari judul laporan..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs h-10 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Dropdowns Container - Menggunakan flex-wrap agar tidak meluber */}
        <div className="flex flex-wrap md:flex-nowrap gap-2">
          <select
            value={currentStatus}
            disabled={isPending}
            onChange={(e) => applyFilters({ status: e.target.value })}
            className="flex-1 md:w-36 bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 h-10 outline-none cursor-pointer focus:border-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="diproses">Diproses</option>
            <option value="selesai">Selesai</option>
            <option value="ditolak">Ditolak</option>
          </select>

          <select
            value={currentCategory}
            disabled={isPending}
            onChange={(e) => applyFilters({ category: e.target.value })}
            className="flex-1 md:w-44 bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 h-10 outline-none cursor-pointer focus:border-blue-500"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={currentCity}
            disabled={isPending}
            onChange={(e) => applyFilters({ city: e.target.value })}
            className="flex-1 md:w-40 bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 h-10 outline-none cursor-pointer focus:border-blue-500"
          >
            <option value="">Semua Kota</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Loading Indicator */}
          <div className="flex items-center justify-center w-8 shrink-0">
            {isPending && (
              <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-50 text-blue-600">
              {activeFilterCount} Filter Aktif
            </span>
            {currentSearch && <Chip label={`"${currentSearch}"`} icon="search" />}
            {currentStatus && <Chip label={currentStatus} />}
            {currentCategory && <Chip label={categories.find(c => c.id === currentCategory)?.name} />}
            {currentCity && <Chip label={cities.find(c => c.id === currentCity)?.name} />}
          </div>
          <button
            onClick={clearFilters}
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            Reset filter
          </button>
        </div>
      )}
    </div>
  );
}

function Chip({ label, icon }: { label?: string; icon?: string }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 uppercase">
      {icon === "search" && (
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={3} />
        </svg>
      )}
      {label}
    </span>
  );
}