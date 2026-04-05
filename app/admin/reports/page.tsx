import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getReports } from "@/lib/repositories/reportRepository";
import { getCategories, getCities } from "@/lib/actions/locations";
import { getPriorityBadgeClass, getPriorityLabel } from "@/lib/utils/priorityCalculator";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminReportsFilter from "@/components/admin/AdminReportsFilter";
import Link from "next/link";

export const metadata = { title: "Kelola Laporan – Admin" };

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};
const STATUS_STYLES: Record<string, string> = {
  pending: "badge-pending",
  diproses: "badge-diproses",
  selesai: "badge-selesai",
  ditolak: "badge-ditolak",
};

interface Props {
  searchParams: Promise<{
    search?: string;
    status?: string;
    category?: string;
    city?: string;
  }>;
}

export default async function AdminReportsPage({ searchParams }: Props) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/?modal=login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") redirect("/");

  const { search, status, category, city } = await searchParams;

  // Fetch data parallel
  const [reports, categories, cities] = await Promise.all([
    getReports(supabase, {
      search: search || undefined,
      status: status || undefined,
      category: category || undefined,
      city: city || undefined,
      limit: 100,
    }),
    getCategories(),
    getCities(),
  ]);

  return (
    <div className="min-h-screen bg-bg flex">
      <AdminSidebar fullName={profile.full_name ?? user.email ?? "Admin"} />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-navy">Kelola Laporan</h1>
              <p className="text-navy/45 text-sm mt-1">
                {reports.length} laporan ditemukan
              </p>
            </div>
          </div>

          {/* Filter Component */}
          <AdminReportsFilter
            categories={categories}
            cities={cities}
            currentSearch={search ?? ""}
            currentStatus={status ?? ""}
            currentCategory={category ?? ""}
            currentCity={city ?? ""}
          />

          {/* Tabel */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-navy/50 text-xs border-b border-slate-100">
                    <th className="text-left px-5 py-3.5 font-semibold">Judul</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Kategori</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Kota</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Status</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Prioritas</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Tanggal</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-navy/40 py-16 text-sm">
                        Tidak ada laporan yang cocok
                      </td>
                    </tr>
                  ) : (
                    reports.map((r) => {
                      const priority = getPriorityLabel(r.priority_score ?? 0);
                      const badgeClass = getPriorityBadgeClass(priority);
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5 max-w-[200px]">
                            <p className="text-navy font-semibold text-xs line-clamp-2 leading-snug">
                              {r.title}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 text-navy/50 text-xs whitespace-nowrap">
                            {r.categories?.name ?? "—"}
                          </td>
                          <td className="px-5 py-3.5 text-navy/50 text-xs whitespace-nowrap">
                            {r.cities?.name ?? "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={STATUS_STYLES[r.status] || "badge-pending"}>
                              {STATUS_LABELS[r.status] || r.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                              {priority === "tinggi" ? "↑" : priority === "sedang" ? "→" : "↓"}{" "}
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-navy/40 text-xs whitespace-nowrap">
                            {new Date(r.created_at).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </td>
                          <td className="px-5 py-3.5">
                            <Link
                              href={`/admin/reports/${r.id}`}
                              className="text-xs font-semibold text-blue hover:underline whitespace-nowrap"
                            >
                              Kelola →
                            </Link>
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