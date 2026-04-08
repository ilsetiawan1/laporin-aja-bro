// components/admin/RecentReportsTable.tsx

import Link from "next/link";
import { getPriorityBadgeClass, getPriorityLabel } from "@/lib/utils/priorityCalculator";
import type { ReportWithRelations } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-yellow-50 text-yellow-700 border border-yellow-200",
  diproses: "bg-blue/10 text-blue border border-blue/20",
  selesai:  "bg-green-50 text-green-700 border border-green-200",
  ditolak:  "bg-red/10 text-red border border-red/20",
};

interface Props {
  reports: ReportWithRelations[];
}

export default function RecentReportsTable({ reports }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-navy font-bold text-sm">Laporan Terbaru</h3>
        <Link href="/admin/reports" className="text-xs text-blue font-semibold hover:underline">
          Lihat semua →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-navy/40 text-xs border-b border-slate-50">
              <th className="text-left px-5 py-3 font-semibold">Judul</th>
              <th className="text-left px-5 py-3 font-semibold">Kategori</th>
              <th className="text-left px-5 py-3 font-semibold">Status</th>
              <th className="text-left px-5 py-3 font-semibold">Prioritas</th>
              <th className="text-left px-5 py-3 font-semibold">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-navy/40 py-10 text-sm">
                  Tidak ada data laporan
                </td>
              </tr>
            ) : (
              reports.map((r) => {
                const priority = getPriorityLabel(r.priority_score ?? 0);
                const badgeClass = getPriorityBadgeClass(priority);
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/reports/${r.id}`}
                        className="text-navy font-semibold text-xs hover:text-blue transition-colors line-clamp-1 max-w-[200px] block"
                      >
                        {r.title}
                      </Link>
                      {r.cities?.name && (
                        <p className="text-navy/35 text-[11px] mt-0.5">{r.cities.name}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-navy/50 text-xs">
                      {r.categories?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[r.status] ?? STATUS_STYLES.pending}`}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                        {priority === "tinggi" ? "↑" : priority === "sedang" ? "→" : "↓"}{" "}
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-navy/40 text-xs whitespace-nowrap">
                      {new Date(r.created_at.endsWith("Z") ? r.created_at : r.created_at + "Z")
                        .toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}