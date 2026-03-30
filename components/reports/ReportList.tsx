"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getPublicReports } from "@/lib/actions/reports";
import { getCategories, getCities } from "@/lib/actions/locations";
import { useAuth } from "@/lib/context/authContext";
import VoteButton from "@/components/reports/VoteButton";
import { getPriorityBadgeClass, getPriorityLabel } from "@/lib/utils/priorityCalculator";
import type { ReportWithRelations } from "@/types";
import { getUserVotedIdsAction } from "@/lib/actions/votes";

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
  const [reports, setReports] = useState<ReportWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // State untuk toggle filter panel
  const [filterOpen, setFilterOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load filter options
  useEffect(() => {
    Promise.all([getCategories(), getCities()]).then(([cats, cits]) => {
      setCategories(cats);
      setCities(cits);
    });
  }, []);

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setLoading(true);
    const data = await getPublicReports({
      search: debouncedSearch || undefined,
      status: filterStatus || undefined,
      city: filterCity || undefined,
      category: filterCategory || undefined,
    });
    setReports(data);
    setLoading(false);
  }, [debouncedSearch, filterStatus, filterCity, filterCategory]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (!user) {
      setVotedIds(new Set());
      return;
    }
    getUserVotedIdsAction().then((ids) => setVotedIds(new Set(ids)));
  }, [user]);

  const hasActiveFilters = filterStatus || filterCity || filterCategory;
  const hasFilters = debouncedSearch || hasActiveFilters;

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("");
    setFilterCity("");
    setFilterCategory("");
  };

  return (
    <div>
      {/* Search + Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 mb-6 shadow-md shadow-navy/10">

        {/* Baris utama: Search input + tombol Filter */}
        <div className="flex items-center gap-3">
          {/* Search input */}
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
              onFocus={() => setFilterOpen(true)}
              placeholder="Cari laporan..."
              className="input-field pl-9 transition-all duration-300 relative z-0"
              id="status-search"
            />
          </div>

          {/* Tombol toggle filter */}
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 shrink-0 ${filterOpen
              ? "border-blue/40 text-blue bg-blue/5"
              : "border-slate-200 text-navy/50 bg-white hover:border-blue/30 hover:text-blue"
              }`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2" />
            </svg>
            Filter
            {/* Dot indikator jika ada filter aktif */}
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange inline-block ml-0.5" />
            )}
          </button>
        </div>

        {/* Filter panel — slide down saat filterOpen */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${filterOpen ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0 pointer-events-none"
            }`}
        >
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
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
                <option key={c.id} value={c.id}>{c.name}</option>
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
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Info hasil filter + reset */}
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
          {reports.map((report) => {
            const priority = getPriorityLabel(report.priority_score ?? 0);
            const badgeClass = getPriorityBadgeClass(priority);
            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-blue/25 hover:shadow-md hover:shadow-navy/5 transition-all duration-200 group flex flex-col"
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
                <Link href={`/reports/${report.id}`} className="flex-1 block">
                  <h3 className="text-navy font-semibold text-sm leading-snug mb-3 line-clamp-2 group-hover:text-blue transition-colors">
                    {report.title}
                  </h3>
                </Link>

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
                  <div className="flex items-center justify-between">
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
                    <VoteButton
                      reportId={report.id}
                      initialVoteCount={report.vote_count ?? 0}
                      initialHasVoted={votedIds.has(report.id)}
                      initialPriorityScore={report.priority_score ?? 0}
                      initialPriority={priority}
                      userId={user?.id ?? null}
                      authLoading={authLoading}
                      size="sm"
                    />
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    {priority === "tinggi" ? "↑" : priority === "sedang" ? "→" : "↓"}{" "}
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}