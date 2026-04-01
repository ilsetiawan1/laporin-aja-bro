// components\landing\LatestReportsInteractive.tsx:

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getPublicReports } from "@/lib/actions/reports";
import type { ReportWithRelations } from "@/types";
import { getUserVotedIdsAction } from "@/lib/actions/votes";
import { useAuth } from "@/lib/context/authContext";
import VoteButton from "@/components/reports/VoteButton";
import ReportFilters from "@/components/reports/ReportFilters";
import { getPriorityBadgeClass, getPriorityLabel } from "@/lib/utils/priorityCalculator";

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "badge-pending",
  diproses: "badge-processing",
  selesai: "badge-success",
  ditolak: "badge-error",
};

const sortReports = (data: ReportWithRelations[]) => {
  return [...data].sort((a, b) => {
    const isAActive = a.status === "pending" || a.status === "diproses";
    const isBActive = b.status === "pending" || b.status === "diproses";
    if (isAActive && !isBActive) return -1;
    if (!isAActive && isBActive) return 1;
    if (a.vote_count !== b.vote_count) return (b.vote_count || 0) - (a.vote_count || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

export default function LatestReportsInteractive({
  initialReports,
}: {
  initialReports: ReportWithRelations[];
}) {
  const [reports, setReports] = useState<ReportWithRelations[]>(
    sortReports(initialReports).slice(0, 4)
  );
  
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      async function fetchFiltered() {
        setLoading(true);
        try {
          const data = await getPublicReports({ 
            search: search.trim() || undefined,
            status: filterStatus || undefined,
            city: filterCity || undefined,
            district: filterDistrict || undefined,
            category: filterCategory || undefined,
          });
          setReports(sortReports(data).slice(0, 4));
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
      if (search.trim() || filterStatus || filterCity || filterDistrict || filterCategory) {
        fetchFiltered();
      } else {
        setReports(sortReports(initialReports).slice(0, 4));
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, filterStatus, filterCity, filterDistrict, filterCategory, initialReports]);

  useEffect(() => {
    if (!user) {
      setVotedIds(new Set());
      return;
    }
    getUserVotedIdsAction().then((ids) => setVotedIds(new Set(ids)));
  }, [user]);

  return (
    <div className="w-full">
      <ReportFilters
        search={search}
        setSearch={setSearch}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterCity={filterCity}
        setFilterCity={setFilterCity}
        filterDistrict={filterDistrict}
        setFilterDistrict={setFilterDistrict}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        totalReports={reports.length}
      />

      {/* Grid laporan */}
      {reports.length === 0 && !loading ? (
        <div className="text-center py-20 text-navy/40">
          <svg className="w-14 h-14 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-semibold">Laporan tidak ditemukan</p>
          <p className="text-sm mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {loading && (
             <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-xs flex items-center justify-center rounded-2xl">
               <svg className="w-8 h-8 animate-spin text-blue" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
               </svg>
             </div>
          )}
          {reports.map((report) => {
            const priority = getPriorityLabel(report.priority_score ?? 0);
            const badgeClass = getPriorityBadgeClass(priority);
            
            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-blue/30 hover:shadow-lg hover:shadow-navy/5 transition-all duration-200 group flex flex-col"
              >
                <div className="flex items-center justify-between mb-3 z-10">
                  <span className={STATUS_STYLES[report.status] || "badge-pending"}>
                    {STATUS_LABELS[report.status] || report.status}
                  </span>
                  {report.categories?.name && (
                    <span className="text-[11px] text-navy/40 font-medium">
                      {report.categories.name}
                    </span>
                  )}
                </div>

                <Link href={`/reports/${report.id}`} className="flex-1 block relative mb-3 group/link">
                  {/* Thumbnail */}
                  <div className="w-full h-32 mb-3 bg-slate-50 rounded-xl overflow-hidden relative flex items-center justify-center">
                    {report.image_urls && report.image_urls.length > 0 ? (
                      <Image 
                        src={report.image_urls[0]} 
                        alt={report.title} 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover/link:scale-105" 
                      />
                    ) : (
                      <div className="text-orange/20 w-full h-full flex items-center justify-center bg-orange/5">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-navy font-semibold text-sm leading-snug line-clamp-2 group-hover:text-blue transition-colors">
                    {report.title}
                  </h3>
                </Link>

                <div className="space-y-1 mt-auto">
                  {/* Nama pelapor */}
                  <p className="text-navy/40 text-xs">
                    Oleh{" "}
                    <span className="font-medium">
                      {report.is_anonymous
                        ? "Warga Baik"
                        : (report.profiles?.full_name ?? "Pengguna")}
                    </span>
                  </p>
                  {report.cities?.name && (
                    <p className="text-navy/45 text-xs flex items-center gap-1.5">
                      <svg className="w-3 h-3 shrink-0 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {report.cities.name}
                      {report.districts?.name && `, ${report.districts.name}`}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-navy/35 text-xs">
                      {new Date(report.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/reports/${report.id}#komentar`} className="flex items-center gap-1 text-navy/40 hover:text-blue transition-colors" title="Komentar">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-[10px] font-medium">{report.comment_count || 0}</span>
                        </Link>
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}