// app\dashboard\profile\ProfileForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfileAction } from "@/lib/actions/profile";
import { getCities, getDistricts } from "@/lib/actions/locations";
import Image from "next/image";

export default function ProfileForm({ profile }: { profile: any }) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    phone_number: profile.phone_number || "",
    gender: profile.gender || "",
    birth_date: profile.birth_date || "",
    city_id: profile.city_id || "",
    district_id: profile.district_id || "",
    password: "",
    old_password: "",
  });

  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getCities().then(setCities);
    if (profile.city_id) {
      getDistricts(profile.city_id).then(setDistricts);
    }
  }, [profile.city_id]);

  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    setFormData((prev) => ({ ...prev, city_id: cityId, district_id: "" }));
    if (cityId) {
      const dists = await getDistricts(cityId);
      setDistricts(dists);
    } else {
      setDistricts([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const data = new FormData(e.currentTarget);
      const res = await updateProfileAction({}, data);

      if (res?.error) {
        toast.error("Gagal", { description: res.error });
      } else {
        toast.success("Berhasil", { description: "Profil berhasil diperbarui." });
        router.refresh(); // Refresh page to get latest data in layout
      }
    } catch {
      toast.error("Terjadi Kesalahan", { description: "Gagal memproses permintaan." });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Readonly Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-navy/70 mb-1.5">Email (Read-Only)</label>
          <input
            type="email"
            value={profile.email || ""}
            disabled
            className="input-field bg-navy/5 text-navy/60 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy/70 mb-1.5">NIK (Read-Only)</label>
          <input
            type="text"
            value={profile.nik || ""}
            disabled
            className="input-field bg-navy/5 text-navy/60 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="border-t border-navy/10 pt-6"></div>

      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-navy/10 flex items-center justify-center">
          {avatarPreview ? (
            <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
          ) : (
            <span className="text-2xl text-navy/40 font-bold">{profile.full_name?.charAt(0).toUpperCase() || "U"}</span>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-navy mb-1.5">Ubah Foto Profil</label>
          <input
            name="avatar"
            type="file"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleAvatarChange}
            className="block w-full text-sm text-navy/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue/10 file:text-blue hover:file:bg-blue/20 cursor-pointer"
          />
          <p className="text-xs text-navy/50 mt-1">Format: JPG, PNG, WEBP. Maks 5MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">Nama Lengkap</label>
          <input
            name="full_name"
            type="text"
            required
            value={formData.full_name}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">Nomor Telepon</label>
          <input
            name="phone_number"
            type="tel"
            required
            value={formData.phone_number}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">Gender</label>
          <select name="gender" required value={formData.gender} onChange={handleChange} className="input-field">
            <option value="">Pilih</option>
            <option value="L">Laki-Laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">Tanggal Lahir</label>
          <input
            name="birth_date"
            type="date"
            required
            value={formData.birth_date}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">Kabupaten / Kota</label>
          <select name="city_id" required value={formData.city_id} onChange={handleCityChange} className="input-field">
            <option value="">Pilih Kabupaten / Kota</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">Kecamatan</label>
          <select name="district_id" required value={formData.district_id} onChange={handleChange} className="input-field" disabled={!formData.city_id}>
            <option value="">Pilih Kecamatan</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>{district.name}</option>
            ))}
          </select>
        </div>
      </div>

<div className="border-t border-navy/10 pt-6">
  {/* Toggle ubah kata sandi */}
  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    className="flex items-center gap-2 text-sm font-semibold text-navy/70 hover:text-navy transition-colors group"
  >
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${showPassword ? "bg-blue text-white" : "bg-navy/8 text-navy/50 group-hover:bg-navy/12"}`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    Ubah Kata Sandi
    <svg
      className={`w-4 h-4 ml-auto transition-transform duration-200 ${showPassword ? "rotate-180" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {/* Password fields — collapsible */}
  {showPassword && (
    <div className="mt-4 space-y-4 bg-navy/3 rounded-xl p-4 border border-navy/8">
      <div>
        <label className="block text-sm font-semibold text-navy mb-1.5">Password Terkini</label>
        <input
          name="old_password"
          type="password"
          value={formData.old_password}
          onChange={handleChange}
          placeholder="Masukkan password terkini..."
          className="input-field"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-semibold text-navy">Password Baru</label>
          {/* Karakter counter */}
          <span className={`text-xs font-bold tabular-nums transition-colors ${
            formData.password.length === 0
              ? "text-navy/30"
              : formData.password.length <= 5
              ? "text-red"
              : formData.password.length <= 9
              ? "text-yellow-500"
              : "text-green-600"
          }`}>
            {formData.password.length}/12
          </span>
        </div>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          maxLength={12}
          placeholder="Minimal 6, maksimal 12 karakter..."
          className={`input-field transition-colors ${
            formData.password.length > 0 && formData.password.length <= 5
              ? "border-red focus:border-red"
              : formData.password.length >= 6 && formData.password.length <= 9
              ? "border-yellow-400 focus:border-yellow-400"
              : formData.password.length >= 10
              ? "border-green-500 focus:border-green-500"
              : ""
          }`}
        />
        {/* Progress bar */}
        {formData.password.length > 0 && (
          <div className="mt-1.5 h-1 bg-navy/8 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                formData.password.length <= 5
                  ? "bg-red"
                  : formData.password.length <= 9
                  ? "bg-yellow-400"
                  : "bg-green-500"
              }`}
              style={{ width: `${(formData.password.length / 12) * 100}%` }}
            />
          </div>
        )}
        {/* Hint text */}
        <p className={`text-xs mt-1 transition-colors ${
          formData.password.length === 0
            ? "text-navy/40"
            : formData.password.length <= 5
            ? "text-red"
            : formData.password.length <= 9
            ? "text-yellow-600"
            : "text-green-600"
        }`}>
          {formData.password.length === 0
            ? "Minimal 6 karakter, maksimal 12 karakter"
            : formData.password.length <= 5
            ? `Kurang ${6 - formData.password.length} karakter lagi`
            : formData.password.length <= 9
            ? "Cukup kuat, bisa lebih panjang"
            : "Password kuat!"}
        </p>
      </div>
    </div>
  )}
</div>

      <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="px-8 py-3 w-full sm:w-auto text-sm font-semibold text-navy border border-navy/20 rounded-xl hover:bg-navy/5 transition-colors disabled:opacity-50"
        >
          Kembali
        </button>

        <button
          type="submit"
          disabled={isPending}
          className={`btn-primary px-8 py-3 w-full sm:w-auto flex items-center justify-center gap-2 ${isPending ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </button>
      </div>
    </form>
  );
}
