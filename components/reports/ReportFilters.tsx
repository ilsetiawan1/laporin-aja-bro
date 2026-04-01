"use client";

import { useState, useEffect } from "react";
import { getCategories, getCities, getDistricts } from "@/lib/actions/locations";
import type { Category, City, District } from "@/types";

interface ReportFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  filterCity: string;
  setFilterCity: (v: string) => void;
  filterDistrict: string;
  setFilterDistrict: (v: string) => void;
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  totalReports: number;
}

export default function ReportFilters({
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  filterCity,
  setFilterCity,
  filterDistrict,
  setFilterDistrict,
  filterCategory,
  setFilterCategory,
  totalReports,
}: ReportFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // Load initial options
  useEffect(() => {
    Promise.all([getCategories(), getCities()]).then(([cats, cits]) => {
      setCategories(cats);
      setCities(cits);
    });
  }, []);

  // Load districts when city changes
  useEffect(() => {
    if (!filterCity) {
      setDistricts([]);
      setFilterDistrict("");
      return;
    }
    getDistricts(filterCity).then((data) => {
      setDistricts(data);
      setFilterDistrict(""); // Reset district
    });
  }, [filterCity, setFilterDistrict]);

  const hasActiveFilters = filterStatus || filterCity || filterDistrict || filterCategory;
  const hasFilters = search || hasActiveFilters;

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("");
    setFilterCity("");
    setFilterDistrict("");
    setFilterCategory("");
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 mb-6 shadow-md shadow-navy/10 relative z-20">
      <div className="flex items-center gap-3">
        {/* Search */}
<div className="relative flex-1 group">
  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
    <svg 
      className="w-4 h-4 text-navy/35 group-focus-within:text-blue transition-colors" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
  <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    onFocus={() => setFilterOpen(true)}
    placeholder="Cari laporan..."
    className="input-field !pl-10 w-full transition-all duration-300"
    id="shared-search"
  />
</div>

        {/* Toggle Filter Button */}
        <button
          onClick={() => setFilterOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0 ${
            filterOpen ? "border-blue/40 text-blue bg-blue/5" : "border-slate-200 text-navy/50 bg-white hover:border-blue/30 hover:text-blue"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2" />
          </svg>
          Filter
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-orange inline-block ml-0.5" />}
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${filterOpen ? "max-h-[500px] opacity-100 mt-3" : "max-h-0 opacity-0 pointer-events-none"}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field">
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="diproses">Diproses</option>
            <option value="selesai">Selesai</option>
            <option value="ditolak">Ditolak</option>
          </select>

          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-field">
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="input-field">
            <option value="">Semua Kota</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className="input-field" disabled={!filterCity}>
            <option value="">Semua Kecamatan</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Info hasil filter + reset */}
      {hasFilters && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <p className="text-navy/50 text-xs">
            Menampilkan <span className="font-semibold text-navy">{totalReports}</span> laporan
          </p>
          <button onClick={clearFilters} className="text-xs text-blue font-semibold hover:underline">
            Reset filter
          </button>
        </div>
      )}
    </div>
  );
}
