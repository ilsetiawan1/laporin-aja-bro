import Link from "next/link";
import { getLatestReports } from "@/lib/actions/reports";
import LatestReportsInteractive from "./LatestReportsInteractive";

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

export default async function LatestReports() {
  const reports = await getLatestReports();

  return (
    <section id="reports" className="py-20 md:py-28 bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <span className="section-label">🔥 Terbaru</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy">
              Laporan Terbaru
            </h2>
            <p className="text-navy/55 text-sm mt-2">
              Laporan publik terbaru dari masyarakat DIY
            </p>
          </div>
          <Link
            href="/reports"
            id="latest-reports-see-all"
            className="btn-outline-dark shrink-0 text-sm"
          >
            Lihat Semua
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>

        {/* Interactive Report Cards */}
        {reports.length === 0 ? (
          <div className="text-center py-20 text-navy/40">
            <svg
              className="w-14 h-14 mx-auto mb-4 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="font-semibold">Belum ada laporan</p>
            <p className="text-sm mt-1">
              Jadilah yang pertama melaporkan masalah di sekitar Anda!
            </p>
            <Link href="/lapor" className="mt-4 btn-primary inline-flex text-sm">
              Buat Laporan Pertama
            </Link>
          </div>
        ) : (
          <LatestReportsInteractive initialReports={reports}  />
        )}


      </div>
    </section>
  );
}
