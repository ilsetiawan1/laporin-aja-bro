import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/actions/auth";
import { getUserReports } from "@/lib/actions/reports";
import Navbar from "@/components/ui/Navbar";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import type { ReportWithRelations } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange/10 text-orange border-orange/20",
  diproses: "bg-blue/10 text-blue border-blue/20",
  selesai: "bg-green-500/10 text-green-600 border-green-500/20",
  ditolak: "bg-red/10 text-red border-red/20",
};

const STATUS_TEXT: Record<string, string> = {
  pending: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

export default async function ReportsPage() {
  // Auth check via server action — no direct supabase import needed
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect("/?modal=login");
  }

  // All data fetching via service layer
  const reports = await getUserReports();


  return (
    <main className="flex flex-col min-h-screen bg-bg">
      <Navbar />
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-24">
        <div className="bg-white/80 rounded-3xl p-6 sm:p-10 shadow-xl border border-navy/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-end mb-8 border-b border-navy/10 pb-6">
              <div>
                <h1 className="text-2xl font-bold text-navy mb-2">Laporan Saya</h1>
                <p className="text-navy/60 text-sm">
                  Pantau status dan riwayat pelaporan Anda.
                </p>
              </div>
              <Link
                href="/#lapor"
                className="btn-primary px-5 py-2.5 text-sm hidden sm:block"
              >
                + Buat Laporan
              </Link>
            </div>

            {reports.length === 0 ? (
              <div className="text-center py-16 px-4 border border-dashed border-navy/20 rounded-2xl bg-navy/5">
                <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">Data Kosong</h3>
                <p className="text-navy/60 text-sm mb-6 max-w-md mx-auto">
                  Anda belum mempunyai laporan. Yuk, buat laporan pertama Anda!
                </p>
                <Link href="/#lapor" className="btn-primary px-6 py-2.5 inline-block text-sm">
                  Buat Laporan Sekarang
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report: ReportWithRelations) => (
                  <div
                    key={report.id}
                    className="bg-white border border-navy/10 rounded-xl p-5 hover:shadow-lg hover:border-blue/30 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              STATUS_COLORS[report.status] ?? STATUS_COLORS.pending
                            }`}
                          >
                            {STATUS_TEXT[report.status] ?? report.status}
                          </span>
                          <span className="text-xs text-navy/40 font-medium">
                            {formatDistanceToNow(new Date(report.created_at), {
                              addSuffix: true,
                              locale: id,
                            })}
                          </span>
                          {report.is_anonymous && (
                            <span className="text-xs text-orange bg-orange/10 px-2 py-0.5 rounded-md font-semibold shrink-0">
                              Anonim
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-navy text-lg line-clamp-1">
                          {report.title}
                        </h3>
                        <p className="text-sm text-navy/50 mt-1 capitalize">
                          Kategori: {report.categories?.name ?? "Lainnya"}
                        </p>
                      </div>

                      <div className="shrink-0 flex sm:flex-col gap-2 w-full sm:w-auto">
                        <Link
                          href={`/status?search=${encodeURIComponent(report.title)}`}
                          className="btn-outline w-full sm:w-auto px-4 py-2 text-xs text-center border-navy/20 text-navy hover:bg-navy/5"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
