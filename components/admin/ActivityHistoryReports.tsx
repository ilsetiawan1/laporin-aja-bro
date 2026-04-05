// components/admin/ActivityHistoryReports.tsx

"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useActivityLogs } from "@/lib/hooks/useActivityLogs";
import ActivityFilters from "./ActivityFilters";
import ActivityLogCard from "./ActivityLogCard";

export default function ActivityHistoryReports() {
  const {
    loading, filtered, hasActiveFilters,
    search, setSearch,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    filterStatus, setFilterStatus,
    clearFilters, refresh,
  } = useActivityLogs();

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, log) => {
    const date = format(new Date(log.created_at), "EEEE, d MMMM yyyy", { locale: id });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-navy">Riwayat Aktivitas</h2>
          <p className="text-sm text-navy/50 mt-0.5">Log perubahan status laporan oleh admin</p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 text-xs text-navy/50 hover:text-navy transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <ActivityFilters
        search={search} setSearch={setSearch}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        filterStatus={filterStatus} setFilterStatus={setFilterStatus}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
        filteredCount={filtered.length}
      />

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-14 h-14 bg-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-navy/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="font-bold text-navy">
            {hasActiveFilters ? "Tidak ada aktivitas yang cocok" : "Belum ada aktivitas"}
          </p>
          <p className="text-sm text-navy/45 mt-1">
            {hasActiveFilters ? "Coba ubah atau reset filter." : "Perubahan status laporan akan muncul di sini."}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-3 text-xs text-blue hover:underline">
              Reset semua filter
            </button>
          )}
        </div>
      )}

      {/* Grouped log cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, dateLogs]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-bold text-navy/40 px-3">{date}</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="space-y-3">
                {dateLogs.map((log) => (
                  <ActivityLogCard key={log.id} log={log} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}