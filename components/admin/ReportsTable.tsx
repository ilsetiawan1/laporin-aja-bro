"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReportWithRelations, ReportStatus } from "@/types";
import {
  getPriorityBadgeClass,
  getPriorityLabel,
} from "@/lib/utils/priorityCalculator";
import QuickStatusBadge from "@/components/admin/QuickStatusBadge";
import TableSortHeader from "@/components/admin/TableSortHeader";

interface ReportsTableProps {
  reports: ReportWithRelations[];
  currentSort: string;
  currentOrder: string;
  searchParams: Record<string, string>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}h lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

// Empty state when no reports match the current filters
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <tr>
      <td colSpan={7}>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-navy/25"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0H10.5A2.251 2.251 0 008.35 3.836M6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-navy/50 mb-1">
            {hasFilters ? "Tidak ada laporan yang cocok" : "Belum ada laporan"}
          </p>
          <p className="text-xs text-navy/35 max-w-xs">
            {hasFilters
              ? "Coba ubah atau reset filter untuk melihat lebih banyak laporan."
              : "Laporan dari masyarakat akan muncul di sini."}
          </p>
        </div>
      </td>
    </tr>
  );
}

export default function ReportsTable({
  reports,
  currentSort,
  currentOrder,
  searchParams,
}: ReportsTableProps) {
  const router = useRouter();
  const hasFilters = !!(
    searchParams.search ||
    searchParams.status ||
    searchParams.category ||
    searchParams.city
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-50 text-navy/50 border-b border-slate-100">
            {/* Laporan — non-sortable, flex */}
            <th className="text-left px-4 py-3 font-semibold text-navy/50">
              Laporan
            </th>
            {/* Kategori */}
            <th className="text-left px-4 py-3 font-semibold text-navy/50 w-[140px]">
              Kategori
            </th>
            {/* Lokasi */}
            <th className="text-left px-4 py-3 font-semibold text-navy/50 w-[120px]">
              Lokasi
            </th>
            {/* Status */}
            <th className="text-left px-4 py-3 font-semibold text-navy/50 w-[110px]">
              Status
            </th>
            {/* Prioritas — sortable */}
            <TableSortHeader
              column="priority_score"
              label="Prioritas"
              currentSort={currentSort}
              currentOrder={currentOrder}
              searchParams={searchParams}
              className="w-[100px]"
            />
            {/* Tanggal — sortable */}
            <TableSortHeader
              column="created_at"
              label="Tanggal"
              currentSort={currentSort}
              currentOrder={currentOrder}
              searchParams={searchParams}
              className="w-[90px]"
            />
            {/* Aksi */}
            <th className="text-left px-4 py-3 font-semibold text-navy/50 w-[80px]">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {reports.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            reports.map((r) => {
              const priority = getPriorityLabel(r.priority_score ?? 0);
              const badgeClass = getPriorityBadgeClass(priority);
              const reporterName = r.is_anonymous
                ? "Anonim"
                : (r.profiles?.full_name ?? "Pengguna");

              return (
                <tr
                  key={r.id}
                  onClick={() => router.push(`/admin/reports/${r.id}`)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  {/* Laporan — judul + pelapor */}
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy leading-snug line-clamp-2 group-hover:text-blue transition-colors max-w-[260px]">
                      {r.title}
                    </p>
                    <p className="text-navy/40 text-[10px] mt-0.5">
                      {reporterName}
                    </p>
                  </td>

                  {/* Kategori */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-navy/60 max-w-[130px] truncate">
                      {r.categories?.name ?? "—"}
                    </span>
                  </td>

                  {/* Lokasi */}
                  <td className="px-4 py-3 text-navy/50 whitespace-nowrap">
                    <p>{r.cities?.name ?? "—"}</p>
                    {r.districts?.name && (
                      <p className="text-navy/35 text-[10px]">
                        {r.districts.name}
                      </p>
                    )}
                  </td>

                  {/* Status — quick badge; stop propagation so row-click doesn't fire */}
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <QuickStatusBadge
                      reportId={r.id}
                      initialStatus={r.status as ReportStatus}
                    />
                  </td>

                  {/* Prioritas */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}
                    >
                      {priority === "tinggi"
                        ? "↑"
                        : priority === "sedang"
                        ? "→"
                        : "↓"}{" "}
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </span>
                    <p className="text-navy/30 text-[10px] mt-0.5">
                      score {r.priority_score ?? 0}
                    </p>
                  </td>

                  {/* Tanggal */}
                  <td className="px-4 py-3 text-navy/40 whitespace-nowrap">
                    {timeAgo(r.created_at)}
                  </td>

                  {/* Aksi */}
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/admin/reports/${r.id}`}
                      className="text-[10px] font-semibold text-blue hover:underline whitespace-nowrap"
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
