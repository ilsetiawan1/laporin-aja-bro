"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LaporForm from "@/components/reports/LaporForm";
import AuthModal from "@/components/auth/AuthModal";

export default function LaporPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  const openAuthModal = (tab: "login" | "register" = "login") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    router.refresh();
  };

  return (
    <main className="flex flex-col min-h-screen bg-[#0b0f1a]">
      {/* Auth Modal (inline — not URL-driven, triggered by form) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        defaultTab={authModalTab}
      />

      {/* ── Hero Banner ── */}
      <div className="relative pt-20 pb-0 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-orange/8 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue/10 border border-blue/20 rounded-full px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 bg-blue rounded-full animate-pulse" />
            <span className="text-blue/80 text-xs font-bold uppercase tracking-widest">Form Pengaduan</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
            Buat{" "}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-light to-orange">Laporan</span>
            </span>{" "}
            Baru
          </h1>
          <p className="text-white/45 text-base max-w-lg mx-auto">
            Isi formulir di bawah ini. AI kami akan mengklasifikasi masalah dan
            meneruskan ke instansi yang tepat.
          </p>

          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 mt-5 text-xs text-white/25">
            <Link href="/" className="hover:text-white/50 transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white/50">Buat Laporan</span>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 px-4 sm:px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Form Card (2/3) ── */}
            <div className="lg:col-span-2">
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/40">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    BUAT LAPORAN
                  </h2>
                  <p className="text-white/35 text-sm mt-1">Semua field bertanda * wajib diisi</p>
                </div>
                <LaporForm onOpenAuthModal={openAuthModal} />
              </div>
            </div>

            {/* ── Sidebar (1/3) ── */}
            <div className="space-y-4">

              {/* Tips Card */}
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-6">
                <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 bg-orange/15 rounded-lg flex items-center justify-center text-sm">💡</span>
                  Tips Laporan Efektif
                </h3>
                <ul className="space-y-3">
                  {[
                    "Beri judul yang jelas dan spesifik",
                    "Sertakan lokasi tepat (nama jalan, RT/RW)",
                    "Jelaskan dampak pada warga sekitar",
                    "Upload foto sebagai bukti pendukung",
                    "Sebutkan waktu kejadian jika tahu",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-white/40">
                      <div className="w-4 h-4 shrink-0 bg-blue/10 border border-blue/20 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-2.5 h-2.5 text-blue/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Status Legend */}
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-6">
                <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue/15 rounded-lg flex items-center justify-center text-sm">📊</span>
                  Alur Status Laporan
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Menunggu", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", desc: "Laporan baru diterima" },
                    { label: "Diproses", color: "bg-blue/15 text-blue-400 border-blue/20", desc: "Sedang ditangani instansi" },
                    { label: "Selesai", color: "bg-green-500/15 text-green-400 border-green-500/20", desc: "Masalah telah teratasi" },
                    { label: "Ditolak", color: "bg-red/15 text-red/80 border-red/20", desc: "Tidak memenuhi kriteria" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${s.color} shrink-0`}>
                        {s.label}
                      </span>
                      <span className="text-xs text-white/30">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy Note */}
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-green-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-green-400/80 mb-1">Data Terlindungi</p>
                    <p className="text-xs text-white/30 leading-relaxed">
                      Identitas Anda aman. Pilih mode anonim jika tidak ingin nama ditampilkan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}