"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

type Report = {
  id: string;
  title: string;
  status: "pending" | "diproses" | "selesai" | "ditolak";
  created_at: string;
  cities: { name: string } | null;
  districts: { name: string } | null;
  categories: { name: string } | null;
};

type RawRow = {
  id: string;
  title: string;
  status: "pending" | "diproses" | "selesai" | "ditolak";
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cities: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  districts: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any;
};

function pickFirst(val: unknown): { name: string } | null {
  if (!val) return null;
  if (Array.isArray(val)) return val[0] ?? null;
  return val as { name: string };
}

type Category = { id: string; name: string };
type City = { id: string; name: string };

const STATUS_STYLES: Record<string, string> = {
  pending: "badge-pending",
  diproses: "badge-diproses",
  selesai: "badge-selesai",
  ditolak: "badge-ditolak",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

export default function ReportList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load filter options
  useEffect(() => {
    Promise.all([
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("cities").select("id, name").order("name"),
    ]).then(([{ data: cats }, { data: cits }]) => {
      setCategories(cats ?? []);
      setCities(cits ?? []);
    });
  }, []);

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("reports")
      .select(`id, title, status, created_at, cities(name), districts(name), categories(name)`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (debouncedSearch) {
      query = query.ilike("title", `%${debouncedSearch}%`);
    }
    if (filterStatus) {
      query = query.eq("status", filterStatus);
    }
    if (filterCity) {
      query = query.eq("city_id", filterCity);
    }
    if (filterCategory) {
      query = query.eq("category_id", filterCategory);
    }

    const { data } = await query;
    const normalized: Report[] = ((data as RawRow[]) ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      created_at: r.created_at,
      cities: pickFirst(r.cities),
      districts: pickFirst(r.districts),
      categories: pickFirst(r.categories),
    }));
    setReports(normalized);
    setLoading(false);
  }, [debouncedSearch, filterStatus, filterCity, filterCategory]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const hasFilters = debouncedSearch || filterStatus || filterCity || filterCategory;

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("");
    setFilterCity("");
    setFilterCategory("");
  };

  return (
    <div>
      {/* Search + Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/35"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari laporan..."
              className="input-field pl-9"
              id="status-search"
            />
          </div>

          {/* Filters */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field sm:w-36"
            id="status-filter-status"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="diproses">Diproses</option>
            <option value="selesai">Selesai</option>
            <option value="ditolak">Ditolak</option>
          </select>

          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="input-field sm:w-44"
            id="status-filter-city"
          >
            <option value="">Semua Kota</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field sm:w-44"
            id="status-filter-category"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <p className="text-navy/50 text-xs">
              Menampilkan{" "}
              <span className="font-semibold text-navy">{reports.length}</span>{" "}
              laporan
            </p>
            <button
              onClick={clearFilters}
              className="text-xs text-blue font-semibold hover:underline"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
              <div className="h-4 bg-slate-100 rounded-full w-20 mb-3" />
              <div className="h-4 bg-slate-100 rounded-full w-full mb-2" />
              <div className="h-4 bg-slate-100 rounded-full w-3/4 mb-4" />
              <div className="h-3 bg-slate-100 rounded-full w-24" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-navy/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="font-bold text-navy text-base mb-1">
            {hasFilters ? "Tidak ada laporan yang cocok" : "Belum ada laporan"}
          </p>
          <p className="text-navy/45 text-sm">
            {hasFilters
              ? "Coba ubah atau reset filter pencarian Anda."
              : "Belum ada laporan publik. Jadilah yang pertama!"}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 btn-outline-dark text-sm">
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-blue/25 hover:shadow-md hover:shadow-navy/5 transition-all duration-200 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={STATUS_STYLES[report.status] || "badge-pending"}>
                  {STATUS_LABELS[report.status] || report.status}
                </span>
                {report.categories?.name && (
                  <span className="text-[11px] text-navy/40 font-medium shrink-0">
                    {report.categories.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-navy font-semibold text-sm leading-snug mb-3 line-clamp-2 group-hover:text-blue transition-colors">
                {report.title}
              </h3>

              {/* Meta */}
              <div className="space-y-1.5 pt-3 border-t border-slate-50">
                {report.cities?.name && (
                  <p className="text-navy/45 text-xs flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-orange shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {report.cities.name}
                    {report.districts?.name && `, ${report.districts.name}`}
                  </p>
                )}
                <p className="text-navy/35 text-xs flex items-center gap-1.5">
                  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(report.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
