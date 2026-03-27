import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/landing/Footer";
import ReportList from "@/components/reports/ReportList";
import Link from "next/link";

export const metadata = {
  title: "Status Laporan – Laporin Aja Bro",
  description:
    "Lihat dan cari laporan publik dari masyarakat Daerah Istimewa Yogyakarta.",
};

export default function StatusPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 bg-bg pt-24 pb-16">
        {/* Hero Banner */}
        <div className="bg-navy pt-12 pb-24 px-4 sm:px-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange/10 rounded-full blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
                backgroundSize: "36px 36px",
              }}
            />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <span className="section-label-light">📋 Laporan Publik</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-3">
              Status Laporan
            </h1>
            <p className="text-white/65 text-base max-w-md mx-auto">
              Cari dan pantau laporan publik dari masyarakat DIY. Transparan,
              terbuka untuk semua.
            </p>
            <Link
              href="/lapor"
              id="status-page-cta"
              className="mt-6 inline-flex btn-orange text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Buat Laporan Baru
            </Link>
          </div>
        </div>

        {/* Report List (overlapping the navy banner) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
          <ReportList />
        </div>
      </div>

      <Footer />
    </main>
  );
}
