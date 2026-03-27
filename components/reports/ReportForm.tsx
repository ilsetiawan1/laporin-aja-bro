"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * ReportForm — Legacy mini form used on the landing page.
 * Redirects to /lapor for full form submission.
 * Full form is available at /lapor (LaporForm component).
 */

const CATEGORIES = [
  { value: "", label: "Pilih kategori laporan..." },
  { value: "infrastruktur", label: "🏗️ Infrastruktur & Jalan" },
  { value: "lingkungan", label: "🌿 Lingkungan & Sampah" },
  { value: "keamanan", label: "🚨 Keamanan & Ketertiban" },
  { value: "pelayanan-publik", label: "🏛️ Pelayanan Publik" },
  { value: "bencana", label: "⚡ Bencana & Darurat" },
  { value: "lainnya", label: "📋 Lainnya" },
];

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

  return (
    <section
      id="report-form"
      className="py-20 md:py-28 bg-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="section-label">📝 Form Laporan</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy mb-3">
            Buat Laporan Sekarang
          </h2>
          <p className="text-navy/55 text-base max-w-md mx-auto">
            Isi formulir di bawah ini dengan lengkap agar laporan Anda dapat
            diproses dengan cepat.
          </p>
        </div>

        {/* Form Card */}
        <div className="form-card p-6 sm:p-10">
          {/* Auth notice */}
          <div className="flex items-start gap-3 bg-blue/5 border border-blue/15 rounded-xl px-4 py-4 mb-8">
            <svg
              className="w-5 h-5 text-blue mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-blue/80 text-sm">
              <span className="font-semibold text-blue">Login diperlukan.</span>{" "}
              Silakan{" "}
              <Link
                href="/login"
                className="underline font-semibold hover:text-navy"
              >
                login
              </Link>{" "}
              atau{" "}
              <Link
                href="/register"
                className="underline font-semibold hover:text-navy"
              >
                daftar
              </Link>{" "}
              terlebih dahulu untuk mengirim laporan.
            </p>
          </div>

          <form className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="report-title"
                className="block text-sm font-semibold text-navy mb-1.5"
              >
                Judul Laporan <span className="text-red">*</span>
              </label>
              <input
                id="report-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Jalan berlubang di Jl. Sudirman No. 12"
                className="input-field"
                disabled
                maxLength={120}
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="report-description"
                className="block text-sm font-semibold text-navy mb-1.5"
              >
                Deskripsi <span className="text-red">*</span>
              </label>
              <textarea
                id="report-description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Jelaskan masalah secara detail: lokasi, waktu kejadian, dampak yang dirasakan..."
                className="input-field resize-none"
                disabled
              />
              <p className="text-xs text-navy/35 mt-1">
                {formData.description.length}/1000 karakter
              </p>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="report-category"
                className="block text-sm font-semibold text-navy mb-1.5"
              >
                Kategori <span className="text-red">*</span>
              </label>
              <select
                id="report-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                disabled
              >
                {CATEGORIES.map((cat) => (
                  <option
                    key={cat.value}
                    value={cat.value}
                    disabled={cat.value === ""}
                  >
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-4 border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-navy">
                  Kirim sebagai anonim
                </p>
                <p className="text-xs text-navy/45 mt-0.5">
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
                  disabled
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Submit — redirects to /lapor */}
            <Link
              href="/lapor"
              id="report-submit-btn"
              className="w-full btn-primary justify-center py-3.5 text-base"
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Login untuk Mengirim Laporan
            </Link>
          </form>
        </div>
      </div>
    </section>
  );
}
