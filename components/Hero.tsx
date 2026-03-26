import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen bg-[#f21913] flex items-center overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-semibold tracking-wide uppercase">
                Platform Laporan Publik #1
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Laporkan{" "}
              <span className="relative inline-block">
                Masalah
                <span className="absolute bottom-1 left-0 right-0 h-1 bg-white/40 rounded-full" />
              </span>{" "}
              <br className="hidden sm:block" />
              Sekitar Anda
            </h1>

            {/* Description */}
            <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Suara Anda penting! Laporkan keluhan, kerusakan, atau masalah
              lingkungan dengan mudah. AI kami akan membantu mengklasifikasi dan
              meneruskan laporan ke pihak yang tepat.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a
                href="#report-form"
                id="hero-cta-report"
                className="group btn-primary text-base justify-center"
              >
                <svg
                  className="w-5 h-5 group-hover:rotate-12 transition-transform"
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
                Buat Laporan
              </a>
              <a
                href="#features"
                id="hero-cta-features"
                className="btn-outline text-base justify-center"
              >
                Pelajari Lebih Lanjut
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-6 mt-10 pt-8 border-t border-white/20">
              {[
                { value: "5.000+", label: "Laporan Terkirim" },
                { value: "92%", label: "Terproses" },
                { value: "48 Jam", label: "Waktu Rata-rata" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-white/65 text-xs sm:text-sm mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Logo / Illustration */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl scale-110" />
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-2xl">
                <Image
                  src="/images/logo.png"
                  alt="Laporin Aja Bro"
                  width={320}
                  height={320}
                  className="w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 object-contain drop-shadow-2xl"
                  priority
                />
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
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
