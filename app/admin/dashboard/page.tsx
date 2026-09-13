import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getAdminStats } from "@/lib/repositories/reportRepository";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardStatCards from "@/components/admin/DashboardStatCards";
import CategoryBarChart from "@/components/admin/CategoryBarChart";
import PriorityList from "@/components/admin/PriorityList";
import RecentReportsTable from "@/components/admin/RecentReportsTable";

export const metadata = { title: "Admin Dashboard – Laporin Aja Bro" };

export default async function AdminDashboardPage() {
  const supabase = await createServerClient();

  // 1. Auth & Role Protection
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/?modal=login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/");

  // 2. Fetch Data Stats
  const stats = await getAdminStats(supabase);

  return (
    <div className="min-h-screen bg-bg md:flex">
      {/* Sidebar Kiri */}
      <AdminSidebar fullName={profile.full_name ?? user.email ?? "Admin"} />

      {/* Konten Utama */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* ── Header ── */}
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Dashboard</h1>
            <p className="text-navy/45 text-sm mt-1">Ringkasan data laporan publik</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            <div className="lg:col-span-2 space-y-6">
              
              <DashboardStatCards
                total={stats.total}
                pending={stats.byStatus.pending ?? 0}
                diproses={stats.byStatus.diproses ?? 0}
                selesai={stats.byStatus.selesai ?? 0}
              />

              {/* Tabel Laporan Terbaru */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <RecentReportsTable reports={stats.recent} />
              </div>
            </div>


            <div className="flex flex-col gap-6 lg:sticky lg:top-8">
              <div >
                <CategoryBarChart data={stats.byCategory} />
              </div>
              <PriorityList reports={[...stats.highPriority, ...stats.recent]} />
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}