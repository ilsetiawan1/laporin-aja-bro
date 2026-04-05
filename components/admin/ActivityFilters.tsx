// components/admin/ActivityFilters.tsx

"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  filteredCount: number;
}

export default function ActivityFilters({
  search, setSearch,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  filterStatus, setFilterStatus,
  hasActiveFilters,
  clearFilters,
  filteredCount,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
      {/* Row 1: Search + Status */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/30 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul laporan atau nama admin..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue/40
                       text-navy placeholder-navy/30"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none
                     focus:ring-2 focus:ring-blue/20 text-navy bg-white min-w-[160px]"
        >
          <option value="">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="diproses">Diproses</option>
          <option value="selesai">Selesai</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>

      {/* Row 2: Date range */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 flex-1">
          <svg className="w-4 h-4 text-navy/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none
                       focus:ring-2 focus:ring-blue/20 focus:border-blue/40 text-navy bg-white"
          />
        </div>
        <span className="text-xs text-navy/40 shrink-0">sampai</span>
        <div className="flex items-center gap-2 flex-1">
          <svg className="w-4 h-4 text-navy/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none
                       focus:ring-2 focus:ring-blue/20 focus:border-blue/40 text-navy bg-white"
          />
        </div>
      </div>

      {/* Summary + Reset */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <p className="text-xs text-navy/40">
          Menampilkan <span className="font-bold text-navy">{filteredCount}</span> aktivitas
          {dateFrom && dateTo && (
            <span className="ml-1">
              ({format(new Date(dateFrom), "d MMM", { locale: id })} –{" "}
              {format(new Date(dateTo), "d MMM yyyy", { locale: id })})
            </span>
          )}
          {dateFrom && !dateTo && (
            <span className="ml-1">(dari {format(new Date(dateFrom), "d MMM yyyy", { locale: id })})</span>
          )}
          {!dateFrom && dateTo && (
            <span className="ml-1">(sampai {format(new Date(dateTo), "d MMM yyyy", { locale: id })})</span>
          )}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-navy/40 hover:text-red transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset filter
          </button>
        )}
      </div>
    </div>
  );
}