import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function Hero() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section
      id="hero"
      className="relative min-h-screen bg-navy flex items-center overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-blue/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-blue/10 rounded-full blur-3xl" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:pt-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
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

            {/* Description */}
            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
              Suara Anda penting! Laporkan keluhan, kerusakan, atau masalah
              lingkungan di Yogyakarta dengan mudah. AI kami membantu
              mengklasifikasi dan meneruskan laporan ke pihak yang tepat.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href={user ? "/dashboard/reports" : "#quick-report"}
                id="hero-cta-lapor"
                className="btn-orange text-base justify-center shadow-xl shadow-orange/25"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Laporkan Sekarang
              </Link>
              <Link
                href="/status"
                id="hero-cta-status"
                className="btn-outline text-base justify-center"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Lihat Laporan
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 mt-12 pt-10 border-t border-white/15">
              {[
                { value: "5.000+", label: "Laporan Terkirim" },
                { value: "92%", label: "Terproses" },
                { value: "48 Jam", label: "Waktu Rata-rata" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl sm:text-2xl font-extrabold text-orange">
                    {stat.value}
                  </div>
                  <div className="text-white/55 text-xs sm:text-sm mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-blue/20 rounded-3xl blur-2xl scale-110" />
              <div className="relative bg-white/6 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                {/* Floating card mock */}
                <div className="space-y-4 w-64 sm:w-72">
                  {[
                    { status: "selesai", title: "Jalan berlubang Jl. Malioboro", city: "Kota Yogyakarta" },
                    { status: "diproses", title: "Lampu jalan padam", city: "Sleman" },
                    { status: "pending", title: "Sampah menumpuk TPS", city: "Bantul" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-white/10 rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-white text-sm font-semibold leading-tight flex-1">
                          {item.title}
                        </p>
                        <span
                          className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                            item.status === "selesai"
                              ? "bg-green-400/20 text-green-300"
                              : item.status === "diproses"
                              ? "bg-blue/30 text-blue-300"
                              : "bg-orange/20 text-orange"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {item.city}
                      </p>
                    </div>
                  ))}

                  <div className="text-center pt-1">
                    <span className="text-white/40 text-xs">+1.200 laporan lainnya</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-auto"
        >
          <path
            d="M0 80L48 69.3C96 59 192 37 288 32C384 27 480 37 576 42.7C672 48 768 48 864 42.7C960 37 1056 27 1152 26.7C1248 27 1344 37 1392 42.7L1440 48V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z"
            fill="#f8fafc"
          />
        </svg>
      </div>
    </section>
  );
}
