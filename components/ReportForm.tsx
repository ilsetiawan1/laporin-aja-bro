"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "", label: "Pilih kategori laporan..." },
  { value: "infrastruktur", label: "🏗️ Infrastruktur & Jalan" },
  { value: "lingkungan", label: "🌿 Lingkungan & Sampah" },
  { value: "keamanan", label: "🚨 Keamanan & Ketertiban" },
  { value: "pelayanan-publik", label: "🏛️ Pelayanan Publik" },
  { value: "bencana", label: "⚡ Bencana & Darurat" },
  { value: "lainnya", label: "📋 Lainnya" },
];

// Simulate "not logged in" state — will be replaced with real auth
const IS_LOGGED_IN = false;

export default function ReportForm() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!IS_LOGGED_IN) return;
    // Future: submit to Supabase
  };

  return (
    <section
      id="report-form"
      className="py-20 md:py-28 bg-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#f21913]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-[#f21913]/10 text-[#f21913] font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
            📝 Form Laporan
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Buat Laporan Sekarang
          </h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Isi formulir di bawah ini dengan lengkap agar laporan Anda dapat
            diproses dengan cepat.
          </p>
        </div>

        {/* Form Card */}
        <div className="form-card p-6 sm:p-10">
          {/* Auth warning */}
          {!IS_LOGGED_IN && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 mb-8">
              <svg
                className="w-5 h-5 text-amber-500 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
              <p className="text-amber-800 text-sm">
                <span className="font-semibold">Login diperlukan.</span>{" "}
                Silakan{" "}
                <a
                  href="#"
                  className="underline font-semibold hover:text-amber-900"
                >
                  login
                </a>{" "}
                atau{" "}
                <a
                  href="#"
                  className="underline font-semibold hover:text-amber-900"
                >
                  daftar
                </a>{" "}
                terlebih dahulu untuk mengirim laporan.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="report-title"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Judul Laporan <span className="text-[#f21913]">*</span>
              </label>
              <input
                id="report-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Jalan berlubang di Jl. Sudirman No. 12"
                className="input-field"
                disabled={!IS_LOGGED_IN}
                maxLength={120}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="report-description"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Deskripsi <span className="text-[#f21913]">*</span>
              </label>
              <textarea
                id="report-description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Jelaskan masalah secara detail: lokasi, waktu kejadian, dampak yang dirasakan..."
                className="input-field resize-none"
                disabled={!IS_LOGGED_IN}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.description.length}/1000 karakter
              </p>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="report-category"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Kategori <span className="text-[#f21913]">*</span>
              </label>
              <select
                id="report-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                disabled={!IS_LOGGED_IN}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} disabled={cat.value === ""}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {formData.category && (
                <p className="text-xs text-[#f21913] mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  AI akan mengklasifikasikan laporan secara otomatis
                </p>
              )}
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-4 border border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Kirim sebagai anonim
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Identitas Anda akan disembunyikan dari publik
                </p>
              </div>
              <label
                htmlFor="anonymous-toggle"
                className="toggle-switch cursor-pointer"
              >
                <input
                  id="anonymous-toggle"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(!isAnonymous)}
                  disabled={!IS_LOGGED_IN}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Submit */}
            <button
              id="report-submit-btn"
              type="submit"
              disabled={!IS_LOGGED_IN}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                IS_LOGGED_IN
                  ? "bg-[#f21913] text-white hover:bg-[#c91410] hover:shadow-lg hover:shadow-[#f21913]/30 hover:-translate-y-0.5"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {IS_LOGGED_IN ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Kirim Laporan
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Silakan Login untuk Mengirim Laporan
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
