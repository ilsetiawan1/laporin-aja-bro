const FEATURES = [
  {
    id: "fast-easy",
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
    title: "Cepat & Mudah",
    description:
      "Laporkan masalah hanya dalam 3 langkah. Tanpa birokrasi panjang, tanpa kerumitan. Cukup isi form, kirim, dan pantau prosesnya.",
    badge: "3 Langkah",
    badgeClass: "bg-orange/20 text-orange",
  },
  {
    id: "transparent",
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
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    title: "Transparan",
    description:
      "Setiap laporan bisa dipantau publik secara real-time. Status diperbarui otomatis sehingga Anda selalu tahu perkembangan terkini.",
    badge: "Real-time",
    badgeClass: "bg-blue-300/20 text-blue-200",
  },
  {
    id: "location-based",
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
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
    title: "Berbasis Lokasi",
    description:
      "Laporan dikelompokkan berdasarkan wilayah — kota dan kecamatan — sehingga diteruskan ke instansi daerah yang paling relevan.",
    badge: "5 Wilayah DIY",
    badgeClass: "bg-green-400/20 text-green-300",
  },
  {
    id: "ai-support",
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
    title: "AI Support",
    description:
      "AI kami mengklasifikasi laporan otomatis, menentukan prioritas, dan menyarankan instansi yang tepat tanpa campur tangan manual.",
    badge: "Powered by AI",
    badgeClass: "bg-yellow-400/20 text-yellow-200",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-20 md:py-28 bg-navy relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1.5px, transparent 1.5px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="section-label-light">✨ Keunggulan Platform</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Kenapa Laporin Aja Bro?
          </h2>
          <p className="text-white/65 text-base max-w-xl mx-auto">
            Kami hadir untuk memastikan setiap suara masyarakat didengar dan
            ditindaklanjuti dengan cepat dan tepat.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              id={`feature-${feature.id}`}
              className="feature-card group"
            >
              <div className="w-14 h-14 bg-blue/25 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue/35 transition-colors duration-200">
                {feature.icon}
              </div>
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${feature.badgeClass}`}
              >
                {feature.badge}
              </span>
              <h3 className="text-lg font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <a
            href="/lapor"
            id="features-cta-btn"
            className="inline-flex items-center gap-2 bg-orange hover:bg-orange-hover text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange/30"
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
