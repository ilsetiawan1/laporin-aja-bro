"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCities, getDistricts } from "@/lib/actions/locations";
import { registerAction } from "@/lib/actions/auth";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface RegisterWizardProps {
  onGoToLogin: () => void;
}

export default function RegisterWizard({ onGoToLogin }: RegisterWizardProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  
  const [isPending, startTransition] = useTransition();
  const [registerState, setRegisterState] = useState<{ error?: string; success?: string } | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nik: "",
    full_name: "",
    phone_number: "",
    gender: "",
    birth_date: "",
    city_id: "",
    district_id: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Fetch Cities on Mount
  useEffect(() => {
    getCities().then(setCities);
  }, []);

  // Fetch Districts when city changes
  useEffect(() => {
    if (formData.city_id) {
      getDistricts(formData.city_id).then(setDistricts);
    } else {
      setDistricts([]);
    }
    setFormData((prev) => ({ ...prev, district_id: "" }));
  }, [formData.city_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Validation for step 1
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        toast.error("Data Belum Lengkap", { description: "Harap isi email dan password untuk melanjutkan." });
        return;
      }
      if (formData.password.length < 6) {
        toast.error("Password Terlalu Pendek", { description: "Password minimal harus 6 karakter." });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Password Tidak Cocok", { description: "Pastikan konfirmasi password sama." });
        return;
      }
    }

    // Validation for step 2
    if (step === 2) {
      if (!formData.nik || !formData.full_name || !formData.phone_number || !formData.gender || !formData.birth_date) {
        toast.error("Data Belum Lengkap", { description: "Harap lengkapi semua isian biodata." });
        return;
      }
      if (formData.nik.length !== 16) {
        toast.error("NIK Tidak Valid", { description: "NIK KTP harus berjumlah 16 digit." });
        return;
      }
    }

    if (step < totalSteps) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterState(null);

    // Basic validation frontend
    if (!formData.email || !formData.password || !formData.nik || !formData.full_name || !formData.phone_number || !formData.gender || !formData.city_id || !formData.district_id) {
      setRegisterState({ error: "Semua kolom wajib diisi kecuali dinyatakan opsional." });
      return;
    }
    if (formData.nik.length !== 16) {
      setRegisterState({ error: "NIK harus berjumlah 16 digit." });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setRegisterState({ error: "Password dan konfirmasi tidak cocok." });
      return;
    }

    startTransition(async () => {
      let avatarUrl = "";
      
      // Client-side Upload to skip payload limits in Sever Actions (although bodySizeLimit was updated)
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop() || "jpg";
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile);

        if (!uploadError) {
          const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
          avatarUrl = data.publicUrl;
        } else {
           console.error("Failed to upload avatar:", uploadError);
           setRegisterState({ error: "Gagal mengunggah avatar. Cek batas ukuran 5MB." });
           return;
        }
      }

      // Prepare payload manually to prevent missing unmounted inputs
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => payload.append(key, val));
      if (avatarUrl) payload.append("avatar", avatarUrl); // send URL string instead of file!

      const res = await registerAction(null, payload);
      setRegisterState(res);
      
      if (res?.success) {
        toast.success("Pendaftaran Berhasil!", { description: res.success });
      }
    });
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  return (
    <div className="relative overflow-hidden w-full">
      {/* State Messages */}
      {registerState?.error && (
        <div className="flex items-center gap-2.5 bg-red/10 border border-red/25 text-red rounded-xl px-4 py-3 mb-5 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {registerState.error}
        </div>
      )}

      {registerState?.success && (
        <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 mb-5 text-sm">
          <svg className="w-4 h-4 shrink-0 mt-0.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold">Pendaftaran Berhasil!</p>
            <p className="mt-0.5">{registerState.success}</p>
            <button
              onClick={onGoToLogin}
              className="mt-2 inline-block text-green-700 font-semibold hover:underline"
            >
              Pergi ke Login →
            </button>
          </div>
        </div>
      )}

      {!registerState?.success && (
        <>
          {/* Progress Indicator */}
          <div className="relative flex justify-between items-center mb-8 px-8">
            {/* Background Track */}
            <div className="absolute top-1/2 left-10 right-10 h-1 bg-navy/10 -translate-y-1/2 -z-10 rounded-full" />
            
            {/* Active Track */}
            <div 
              className="absolute top-1/2 left-10 h-1 bg-orange/80 -translate-y-1/2 -z-10 rounded-full transition-all duration-300" 
              style={{ width: step === 1 ? '0%' : step === 2 ? 'calc(50% - 1.25rem)' : 'calc(100% - 2.5rem)' }}
            />
            
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10 ${
                  step >= s ? "bg-orange text-white shadow-[0_0_0_4px_rgba(255,255,255,1)]" : "bg-slate-200 text-slate-500 shadow-[0_0_0_4px_rgba(255,255,255,1)]"
                }`}
              >
                {s}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait" custom={1}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "tween", duration: 0.2 }}
                  className="space-y-4 min-h-[300px]"
                >
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nama@email.com"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Password</label>
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimal 6 karakter"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Konfirmasi Password</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Ulangi password"
                      className="input-field"
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "tween", duration: 0.2 }}
                  className="space-y-4 min-h-[300px]"
                >
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">NIK KTP (16 Digit)</label>
                    <input
                      name="nik"
                      type="text"
                      required
                      maxLength={16}
                      value={formData.nik}
                      onChange={handleChange}
                      placeholder="3404XXXXXXXXXXXX"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Nama Lengkap</label>
                    <input
                      name="full_name"
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Budi Santoso"
                      className="input-field"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-navy mb-1.5">Gender</label>
                      <select name="gender" required value={formData.gender} onChange={handleChange} className="input-field">
                        <option value="">Pilih</option>
                        <option value="L">Laki-Laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                    <div className="flex-1">
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
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Nomor Telepon</label>
                    <input
                      name="phone_number"
                      type="tel"
                      required
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="08123456789"
                      className="input-field"
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "tween", duration: 0.2 }}
                  className="space-y-4 min-h-[300px]"
                >
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Kabupaten / Kota</label>
                    <select name="city_id" required value={formData.city_id} onChange={handleChange} className="input-field">
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
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Foto Profil / Avatar</label>
                    <input
                      name="avatar"
                      type="file"
                      accept="image/jpeg, image/png, image/webp"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setAvatarFile(e.target.files[0]);
                          setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                        } else {
                          setAvatarFile(null);
                          setAvatarPreview(null);
                        }
                      }}
                      className="block w-full text-sm text-navy/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange/10 file:text-orange hover:file:bg-orange/20 cursor-pointer"
                    />
                    {avatarPreview && (
                      <div className="mt-3 aspect-square w-20 h-20 rounded-full overflow-hidden border-2 border-orange/50">
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="pt-2 flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 py-3 text-base btn-outline justify-center border-navy/20 hover:border-navy text-navy"
                  disabled={isPending}
                >
                  Kembali
                </button>
              )}
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 text-base btn-orange justify-center"
                >
                  Lanjut
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isPending}
                  className={`flex-1 py-3 text-base btn-primary justify-center ${isPending ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {isPending ? "Mendaftar..." : "Selesai"}
                </button>
              )}
            </div>

            {step === 1 && (
              <p className="text-center text-navy/55 text-sm mt-5">
                Sudah punya akun?{" "}
                <button type="button" onClick={onGoToLogin} className="text-blue font-semibold hover:underline">
                  Masuk di sini
                </button>
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}
