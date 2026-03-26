const FEATURES = [
  {
    id: "ai-classification",
    icon: (
      <svg
        className="w-8 h-8 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    title: "AI Klasifikasi Otomatis",
    description:
      "Teknologi AI kami secara otomatis mengidentifikasi kategori laporan, menentukan prioritas, dan meneruskan ke instansi yang tepat tanpa proses manual.",
    badge: "Powered by AI",
    badgeColor: "bg-yellow-400/20 text-yellow-200",
  },
  {
    id: "anonymous-report",
    icon: (
      <svg
        className="w-8 h-8 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    ),
    title: "Laporan Anonim",
    description:
      "Laporkan masalah tanpa mengungkap identitas Anda. Data Anda dienkripsi dan dilindungi sepenuhnya. Keamanan dan privasi adalah prioritas kami.",
    badge: "100% Aman",
    badgeColor: "bg-green-400/20 text-green-200",
  },
  {
    id: "fast-process",
    icon: (
      <svg
        className="w-8 h-8 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
    title: "Proses Cepat",
    description:
      "Laporan Anda langsung diteruskan ke pihak yang berwenang. Pantau status laporan secara real-time dan dapatkan pembaruan dalam 48 jam.",
    badge: "Real-time",
    badgeColor: "bg-blue-400/20 text-blue-200",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-[#f21913] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-white/15 border border-white/25 text-white font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
            ✨ Keunggulan Platform
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Kenapa Laporin Aja Bro?
          </h2>
          <p className="text-white/75 text-base max-w-xl mx-auto">
            Kami hadir untuk memastikan setiap suara masyarakat didengar dan
            ditindaklanjuti dengan cepat dan tepat.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.id} id={`feature-${feature.id}`} className="feature-card group">
              {/* Icon Container */}
              <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-white/20 transition-colors duration-200">
                {feature.icon}
              </div>

              {/* Badge */}
              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${feature.badgeColor}`}
              >
                {feature.badge}
              </span>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <a
            href="#report-form"
            id="features-cta-btn"
            className="inline-flex items-center gap-2 bg-white text-[#f21913] font-bold px-8 py-4 rounded-xl hover:bg-white/90 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
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
            Mulai Buat Laporan
          </a>
        </div>
      </div>
    </section>
  );
}
