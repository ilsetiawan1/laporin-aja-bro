// components/landing/Hero.tsx
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import HeroBackground from "./HeroBackground";

export default async function Hero() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-slate-950"
    >
      {/* 🔥 Background utama */}
      <HeroBackground />

      {/* 🔥 Decorative (FIXED: lebih subtle & gelap) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-1">
        {/* Orb kanan */}
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-blue-900/30 rounded-full blur-2xl" />

        {/* Orb kiri */}
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-900/20 rounded-full blur-2xl" />

        {/* ❌ Dot grid DIHAPUS (biang silver) */}
      </div>

      {/* 🔥 Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:pt-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-orange/15 border border-orange/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-orange rounded-full animate-pulse" />
              <span className="text-orange text-xs font-bold tracking-wide uppercase">
                Platform Laporan Publik #1 DIY
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Laporkan{" "}
              <span className="relative inline-block text-orange">
                Masalah
                <span className="absolute bottom-1 left-0 right-0 h-0.5 bg-orange/40 rounded-full" />
              </span>{" "}
              <br className="hidden sm:block" />
              Sekitar Anda
            </h1>

            {/* Desc */}
            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
              Suara Anda penting! Laporkan keluhan, kerusakan, atau masalah
              lingkungan di Yogyakarta dengan mudah. AI kami membantu
              mengklasifikasi dan meneruskan laporan ke pihak yang tepat.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href={user ? "/dashboard/reports" : "#quick-report"}
                className="btn-orange text-base justify-center shadow-xl shadow-orange/25"
              >
                + Laporkan Sekarang
              </Link>

              <Link
                href="/status"
                className="btn-outline text-base justify-center border-white/20 text-white/80 hover:bg-white/10"
              >
                Lihat Laporan
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 mt-12 pt-10 border-t border-white/10">
              {[
                { value: "5.000+", label: "Laporan Terkirim" },
                { value: "92%", label: "Terproses" },
                { value: "48 Jam", label: "Waktu Rata-rata" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl sm:text-2xl font-extrabold text-orange">
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-xs sm:text-sm mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* glow belakang (lebih gelap) */}
              <div className="absolute inset-0 bg-blue-900/30 rounded-3xl blur-2xl scale-110" />

              {/* card */}
              <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="space-y-4 w-64 sm:w-72">
                  {[
                    { status: "selesai", title: "Jalan berlubang Jl. Malioboro", city: "Kota Yogyakarta" },
                    { status: "diproses", title: "Lampu jalan padam", city: "Sleman" },
                    { status: "pending", title: "Sampah menumpuk TPS", city: "Bantul" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-white/10 rounded-xl p-4 border border-white/10 hover:bg-white/15 transition"
                    >
                      <div className="flex justify-between gap-2 mb-1.5">
                        <p className="text-white text-sm font-semibold leading-snug flex-1">
                          {item.title}
                        </p>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg leading-none shrink-0 self-start ${
                            item.status === "selesai"
                              ? "bg-green-400/20 text-green-300"
                              : item.status === "diproses"
                              ? "bg-blue-400/20 text-blue-300"
                              : "bg-orange/20 text-orange"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="text-white/50 text-xs">
                        {item.city}
                      </p>
                    </div>
                  ))}

                  <div className="text-center pt-1">
                    <span className="text-white/40 text-xs">
                      +1.200 laporan lainnya
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}