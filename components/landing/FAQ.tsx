"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Apakah laporan bisa dikirim tanpa akun?",
    a: "Untuk mengirim laporan, Anda perlu membuat akun terlebih dahulu. Namun, Anda bisa melihat dan mencari laporan publik tanpa login. Pendaftaran gratis dan hanya membutuhkan email.",
  },
  {
    q: "Berapa lama laporan saya diproses?",
    a: "Rata-rata laporan mulai diproses dalam 48 jam setelah dikirim. AI kami langsung mengklasifikasi dan meneruskan laporan ke instansi terkait. Status laporan bisa dipantau secara real-time di halaman Status.",
  },
  {
    q: "Apakah laporan saya bisa dilihat publik?",
    a: "Ya, laporan bersifat publik untuk mendorong transparansi. Namun identitas pelapor (email) tidak akan ditampilkan. Anda juga bisa memilih tidak menyertakan detail pribadi.",
  },
  {
    q: "Wilayah mana saja yang dilayani?",
    a: "Saat ini kami melayani 5 kabupaten/kota di Daerah Istimewa Yogyakarta: Kota Yogyakarta, Sleman, Bantul, Gunungkidul, dan Kulon Progo.",
  },
  {
    q: "Bagaimana AI mengklasifikasi laporan saya?",
    a: "AI kami menganalisis judul dan deskripsi laporan untuk menentukan kategori (infrastruktur, lingkungan, keamanan, dll.), prioritas, dan instansi daerah yang paling relevan untuk menangani laporan tersebut.",
  },
  {
    q: "Apa yang terjadi jika laporan saya ditolak?",
    a: "Laporan mungkin ditolak jika tidak lengkap, duplikat, atau di luar jangkauan layanan. Anda akan mendapat pemberitahuan dan bisa mengajukan laporan baru dengan informasi yang lebih lengkap.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label">❓ FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy mb-4">
            Pertanyaan yang Sering Ditanyakan
          </h2>
          <p className="text-navy/55 text-base">
            Belum menemukan jawaban?{" "}
            <a href="mailto:halo@laporinajabro.id" className="text-blue hover:underline font-medium">
              Hubungi kami
            </a>
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                openIndex === index
                  ? "border-blue/30 shadow-md shadow-blue/5"
                  : "border-slate-100 hover:border-blue/20"
              }`}
            >
              <button
                id={`faq-item-${index}`}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-blue/2 transition-colors"
                aria-expanded={openIndex === index}
              >
                <span
                  className={`font-semibold text-sm sm:text-base leading-snug ${
                    openIndex === index ? "text-blue" : "text-navy"
                  }`}
                >
                  {faq.q}
                </span>
                <div
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    openIndex === index
                      ? "bg-blue text-white rotate-45"
                      : "bg-blue/10 text-blue"
                  }`}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-60" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-5 text-navy/65 text-sm leading-relaxed border-t border-slate-50 pt-4">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
