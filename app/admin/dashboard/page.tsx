// app/admin/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getAdminStats } from "@/lib/repositories/reportRepository";
import StatCard from "@/components/admin/StatCard";
import CategoryBarChart from "@/components/admin/CategoryBarChart";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";
import { getPriorityBadgeClass, getPriorityLabel } from "@/lib/utils/priorityCalculator";

export const metadata = { title: "Admin Dashboard – Laporin Aja Bro" };

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu", diproses: "Diproses", selesai: "Selesai", ditolak: "Ditolak",
};
const STATUS_STYLES: Record<string, string> = {
  pending: "badge-pending", diproses: "badge-diproses",
  selesai: "badge-selesai", ditolak: "badge-ditolak",
};

export default async function AdminDashboardPage() {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/?modal=login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") redirect("/");

  const stats = await getAdminStats(supabase);

  return (
    <div className="min-h-screen bg-bg flex">
      <AdminSidebar fullName={profile.full_name ?? user.email ?? "Admin"} />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-navy">Dashboard</h1>
            <p className="text-navy/45 text-sm mt-1">Ringkasan data laporan publik</p>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Laporan"
              value={stats.total}
              variant="blue"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              }
            />
            <StatCard
              label="Menunggu"
              value={stats.byStatus.pending ?? 0}
              variant="orange"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="Diproses"
              value={stats.byStatus.diproses ?? 0}
              variant="blue"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            />
            <StatCard
              label="Selesai"
              value={stats.byStatus.selesai ?? 0}
              variant="green"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* High Priority + Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Prioritas Tinggi */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="text-navy font-bold text-sm mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red inline-block" />
                Prioritas Tinggi
              </h3>
              {stats.highPriority.length === 0 ? (
                <p className="text-navy/40 text-sm text-center py-8">
                  Tidak ada laporan prioritas tinggi
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.highPriority.map((r) => {
                    const priority = getPriorityLabel(r.priority_score ?? 0);
                    const badgeClass = getPriorityBadgeClass(priority);
                    return (
                      <Link
                        key={r.id}
                        href={`/admin/reports/${r.id}`}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-navy font-semibold text-xs line-clamp-1 group-hover:text-blue transition-colors">
                            {r.title}
                          </p>
                          <p className="text-navy/40 text-[11px] mt-0.5">{r.cities?.name}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${badgeClass}`}>
                          ↑ {r.priority_score}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bar Chart Kategori */}
            <CategoryBarChart data={stats.byCategory} />
          </div>

          {/* Tabel Laporan Terbaru */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-navy font-bold text-sm">Laporan Terbaru</h3>
              <Link
                href="/admin/reports"
                className="text-xs text-blue font-semibold hover:underline"
              >
                Lihat semua →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-navy/50 text-xs">
                    <th className="text-left px-5 py-3 font-semibold">Judul</th>
                    <th className="text-left px-5 py-3 font-semibold">Kategori</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                    <th className="text-left px-5 py-3 font-semibold">Prioritas</th>
                    <th className="text-left px-5 py-3 font-semibold">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.recent.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-navy/40 py-10 text-sm">
                        Tidak ada data laporan
                      </td>
                    </tr>
                  ) : (
                    stats.recent.map((r) => {
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
                          </td>
                          <td className="px-5 py-3 text-navy/50 text-xs">
                            {r.categories?.name ?? "—"}
                          </td>
                          <td className="px-5 py-3">
                            <span className={STATUS_STYLES[r.status] || "badge-pending"}>
                              {STATUS_LABELS[r.status] || r.status}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                              {priority === "tinggi" ? "↑" : priority === "sedang" ? "→" : "↓"}{" "}
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-navy/40 text-xs whitespace-nowrap">
                            {new Date(r.created_at).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}