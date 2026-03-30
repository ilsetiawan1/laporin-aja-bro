"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPublicReports } from "@/lib/actions/reports";
import { useAuth } from "@/lib/context/authContext";
import VoteButton from "@/components/reports/VoteButton";
import { getPriorityLabel, getPriorityBadgeClass } from "@/lib/utils/priorityCalculator";
import type { ReportWithRelations } from "@/types";
import { getUserVotedIdsAction } from "@/lib/actions/votes";

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

export default function LatestReportsInteractive({
  initialReports,
}: {
  initialReports: ReportWithRelations[];
}) {
  const [reports, setReports] = useState<ReportWithRelations[]>(initialReports);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      async function fetchFiltered() {
        setLoading(true);
        try {
          const data = await getPublicReports({ search });
          setReports(data.slice(0, 8));
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
      if (search.trim() !== "") {
        fetchFiltered();
      } else {
        setReports(initialReports);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, initialReports]);

  useEffect(() => {
    if (!user) {
      setVotedIds(new Set());
      return;
    }
    getUserVotedIdsAction().then((ids) => setVotedIds(new Set(ids)));
  }, [user]);

  return (
    <div className="w-full">
      {/* Search wrapper — relative z-10 mencegah tumpang tindih dengan hero di atasnya */}
      <div className="mb-8 relative z-10">
        <div className="relative w-full lg:w-1/2">
          <svg
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40 pointer-events-none z-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="     Cari berdasarkan Judul, Kategori, atau Lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full input-field pl-8 bg-white shadow-sm"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 animate-spin text-blue" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Grid laporan */}
      {reports.length === 0 ? (
        <div className="text-center py-20 text-navy/40">
          <svg
            className="w-14 h-14 mx-auto mb-4 opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-semibold">Laporan tidak ditemukan</p>
          <p className="text-sm mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.map((report) => {
            const priority = getPriorityLabel(report.priority_score ?? 0);
            const badgeClass = getPriorityBadgeClass(priority);
            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-blue/30 hover:shadow-lg hover:shadow-navy/5 transition-all duration-200 group flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={STATUS_STYLES[report.status] || "badge-pending"}>
                    {STATUS_LABELS[report.status] || report.status}
                  </span>
                  {report.categories?.name && (
                    <span className="text-[11px] text-navy/40 font-medium">
                      {report.categories.name}
                    </span>
                  )}
                </div>

                <Link href={`/reports/${report.id}`} className="flex-1 block">
                  <h3 className="text-navy font-semibold text-sm leading-snug mb-3 line-clamp-2 group-hover:text-blue transition-colors">
                    {report.title}
                  </h3>
                </Link>

                <div className="space-y-1">
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
                  <div className="flex items-center justify-between">
                    <p className="text-navy/35 text-xs">
                      {new Date(report.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
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