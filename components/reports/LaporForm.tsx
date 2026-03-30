"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/authContext";
import { submitReport } from "@/lib/actions/reports";
import { getCategories, getCities, getDistricts } from "@/lib/actions/locations";
import Combobox from "@/components/ui/Combobox";
import { autoCategorize } from "@/lib/utils/autoCategorize";

// ─── Local Types ─────────────────────────────────────────────
type Category = { id: string; name: string };
type City = { id: string; name: string };
type District = { id: string; name: string };

interface LaporFormProps {
  onOpenAuthModal?: (tab?: "login" | "register") => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  infrastruktur: "🏗️",
  sampah: "🗑️",
  lingkungan: "🌿",
  keamanan: "🛡️",
  kesehatan: "🏥",
  pendidikan: "📚",
  transportasi: "🚌",
  lainnya: "📋",
};

function getCategoryIcon(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return v;
  }
  return "📋";
}

export default function LaporForm({ onOpenAuthModal }: LaporFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Auth state via hook (allowed exception)
  const { user, loading: authLoading } = useAuth();

  // Form data options
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    city_id: "",
    district_id: "",
    address: "",
    is_anonymous: false,
  });

  // Image state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Result state
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);
  const [charCount, setCharCount] = useState({ title: 0, description: 0 });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [detectedCategory, setDetectedCategory] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [categoryOverridden, setCategoryOverridden] = useState(false);

  // Prefill from landing mini form
  useEffect(() => {
    const prefill = sessionStorage.getItem("report-prefill-title");
    if (prefill) {
      setFormData((prev) => ({ ...prev, title: prefill }));
      setCharCount((prev) => ({ ...prev, title: prefill.length }));
      sessionStorage.removeItem("report-prefill-title");
    }
  }, []);

  // Load categories + cities via server actions (no direct supabase)
  useEffect(() => {
    async function loadData() {
      const [cats, cits] = await Promise.all([
        getCategories(),
        getCities(),
      ]);
      setCategories(cats);
      setCities(cits);
    }
    loadData();
  }, []);

  // Load districts when city changes via server action
  useEffect(() => {
    if (!formData.city_id) {
      setDistricts([]);
      setFormData((prev) => ({ ...prev, district_id: "" }));
      return;
    }
    setLoadingDistricts(true);
    getDistricts(formData.city_id).then((data) => {
      setDistricts(data);
      setFormData((prev) => ({ ...prev, district_id: "" }));
      setLoadingDistricts(false);
    });
  }, [formData.city_id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "title") setCharCount((prev) => ({ ...prev, title: value.length }));
    if (name === "description") {
      setCharCount((prev) => ({ ...prev, description: value.length }));

      // Debounce auto-kategorisasi 500ms
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (value.length < 10) {
          setDetectedCategory(null);
          return;
        }
        const result = await autoCategorize(value, categories);
        if (result && !categoryOverridden) {
          setDetectedCategory(result);
          setFormData((prev) => ({ ...prev, category_id: result.id }));
        } else if (!result) {
          setDetectedCategory(null);
        }
      }, 500);
    }
    // Jika user manual ubah kategori, tandai sebagai override
    if (name === "category_id") {
      setCategoryOverridden(true);
      setDetectedCategory(null);
    }
  };

  // Image helpers
  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 4);
    if (arr.length === 0) return;
    setImageFiles((prev) => {
      const combined = [...prev, ...arr].slice(0, 4);
      const previews = combined.map((f) => URL.createObjectURL(f));
      setImagePreviews(previews);
      return combined;
    });
  }, []);

  const removeImage = (idx: number) => {
    setImageFiles((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      setImagePreviews(next.map((f) => URL.createObjectURL(f)));
      return next;
    });
  };

  // Drag & Drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!user) {
      onOpenAuthModal?.("login");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.set(k, String(v)));
    imageFiles.forEach((file, i) => data.set(`image_${i}`, file));

    startTransition(async () => {
      const res = await submitReport(data);
      if (res?.error) {
        toast.error("Gagal", { description: res.error });
        setResult({ error: res.error });
      } else {
        toast.success("Berhasil!", { description: "Laporan Anda telah terkirim." });
        setResult({ success: true });
        setTimeout(() => router.push("/status"), 2000);
      }
    });
  };

  // ── Form Input Styles ──
  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue/50 focus:border-transparent focus:bg-white/10 transition-all duration-300 shadow-inner";

  const labelClass = "block text-xs font-bold text-white/50 mb-2 uppercase tracking-widest";

  return (
    <div className="w-full">
      {/* Error */}
      {result?.error && (
        <div className="flex items-center gap-3 bg-red/10 border border-red/25 text-red/90 rounded-xl px-4 py-3 mb-6 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {result.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Judul ── */}
        <div>
          <label className={labelClass}>
            Judul Laporan <span className="text-red/70">*</span>
          </label>
          <input
            id="lapor-title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Contoh: Jalan berlubang di Jl. Kaliurang Km 7"
            className={inputClass}
            maxLength={120}
            required
            disabled={isPending}
          />
          <p className="text-white/25 text-xs mt-1.5 text-right">{charCount.title}/120</p>
        </div>

        {/* ── Kategori + Anonim toggle ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          <div>
            <label className={labelClass}>
              Kategori <span className="text-red/70">*</span>
            </label>
            <div className="relative">
              <select
                id="lapor-category"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                required
                disabled={isPending}
              >
                <option value="" className="bg-[#1a1f2e]">Pilih kategori...</option>
                {categories.length === 0 && (
                  <option disabled className="bg-[#1a1f2e]">Memuat...</option>
                )}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#1a1f2e]">
                    {getCategoryIcon(cat.name)} {cat.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Anonim Toggle */}
          <div>
            <label className={labelClass}>Mode Pelaporan</label>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, is_anonymous: !prev.is_anonymous }))}
              disabled={isPending}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 text-sm ${formData.is_anonymous
                  ? "bg-orange/10 border-orange/30 text-orange"
                  : "bg-white/5 border-white/10 text-white/60"
                }`}
            >
              <span className="flex items-center gap-2">
                <span>{formData.is_anonymous ? "🕶️" : "👤"}</span>
                <span className="font-semibold">
                  {formData.is_anonymous ? "Laporan Anonim" : "Atas Nama Saya"}
                </span>
              </span>
              <div className={`w-9 h-5 rounded-full transition-colors relative ${formData.is_anonymous ? "bg-orange" : "bg-white/15"}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${formData.is_anonymous ? "left-4" : "left-0.5"}`} />
              </div>
            </button>
          </div>
        </div>

        {/* ── Kota + Kecamatan ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>
              Kota/Kabupaten <span className="text-red/70">*</span>
            </label>
            <div className="relative z-20">
              <Combobox
                options={cities}
                value={formData.city_id}
                onChange={(id) => setFormData((prev) => ({ ...prev, city_id: id }))}
                placeholder={cities.length === 0 ? "Memuat..." : "Ketik atau pilih kota..."}
                disabled={isPending || cities.length === 0}
              />
            </div>
          </div>

          <div className="relative z-10">
            <label className={labelClass}>Kecamatan</label>
            <div>
              <Combobox
                options={districts}
                value={formData.district_id}
                onChange={(id) => setFormData((prev) => ({ ...prev, district_id: id }))}
                placeholder={
                  loadingDistricts
                    ? "Memuat..."
                    : formData.city_id
                      ? "Ketik atau pilih kecamatan..."
                      : "Pilih kota dulu"
                }
                disabled={isPending || !formData.city_id || loadingDistricts}
              />
            </div>
          </div>
        </div>

        {/* ── Alamat Detail ── */}
        <div>
          <label className={labelClass}>Alamat Lengkap</label>
          <input
            id="lapor-address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            placeholder="Contoh: Jl. Kaliurang KM.5"
            className={inputClass}
            disabled={isPending}
          />
        </div>

        {/* ── Deskripsi ── */}
        <div>
          <label className={labelClass}>
            Detail Laporan <span className="text-red/70">*</span>
          </label>
          <textarea
            id="lapor-description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Jelaskan masalah secara detail: kapan terjadi, dampak pada warga, sudah berapa lama, dll..."
            className={`${inputClass} resize-none`}
            required
            disabled={isPending}
            maxLength={500}
          />
          <p className="text-white/25 text-xs mt-1.5 text-right">{charCount.description}/500</p>
          {detectedCategory && (
            <div className="flex items-center justify-between mt-2">
              <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Terdeteksi: <strong>{detectedCategory.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setCategoryOverridden(true);
                  setDetectedCategory(null);
                  setFormData((prev) => ({ ...prev, category_id: "" }));
                }}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Ubah manual
              </button>
            </div>
          )}
        </div>

        {/* ── Upload Bukti Foto ── */}
        <div>
          <label className={labelClass}>
            Bukti Foto{" "}
            <span className="text-white/25 normal-case font-normal tracking-normal">
              (opsional, maks 4)
            </span>
          </label>

          {/* Drag & Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${isDragging
                ? "border-blue/60 bg-blue/10"
                : "border-white/15 hover:border-white/30 hover:bg-white/5"
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
            {imageFiles.length === 0 ? (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                  <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white/40">
                    <span className="text-blue/80 font-semibold">Klik untuk upload</span> atau drag & drop
                  </p>
                  <p className="text-xs text-white/25 mt-0.5">PNG, JPG, WebP — maks 5MB per foto</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" onClick={(e) => e.stopPropagation()}>
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative group aspect-square">
                    <Image
                      src={src}
                      alt={`Preview ${i + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {imageFiles.length < 4 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-white/15 rounded-lg flex items-center justify-center hover:border-white/30 transition-colors"
                  >
                    <span className="text-white/30 text-2xl">+</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── AI Notice ── */}
        <div className="flex items-start gap-3 bg-blue/5 border border-blue/15 rounded-xl px-4 py-3.5">
          <div className="shrink-0 mt-0.5">
            <div className="w-7 h-7 rounded-lg bg-blue/15 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-blue/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-blue/70 text-xs leading-relaxed">
            <span className="font-bold text-blue/90">AI akan menganalisis laporan Anda</span> — mengklasifikasi prioritas dan meneruskan ke instansi yang tepat secara otomatis.
          </p>
        </div>

        {/* ── Submit Button ── */}
        <button
          id="lapor-submit"
          type="submit"
          disabled={isPending || authLoading}
          className={`w-full py-4 rounded-2xl font-black text-white text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] shadow-lg ${user
              ? "bg-blue hover:bg-blue-hover shadow-blue/20 hover:shadow-blue/30"
              : "bg-orange hover:bg-orange-hover shadow-orange/20 hover:shadow-orange/30"
            } ${isPending ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {isPending ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Mengirim Laporan...
            </>
          ) : user ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Kirim Laporan
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
              Login untuk Melapor
            </>
          )}
        </button>

        {!user && !authLoading && (
          <p className="text-center text-white/30 text-xs">
            Kamu bisa isi form terlebih dahulu, lalu login saat mau kirim
          </p>
        )}
      </form>
    </div>
  );
}
