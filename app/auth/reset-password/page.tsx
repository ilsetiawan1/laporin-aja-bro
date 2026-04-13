// app/auth/reset-password/page.tsx
"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.updateUser({ password });
    setDone(true);
    setLoading(false);
    setTimeout(() => router.push("/"), 2000);
  };

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border border-slate-100">
        <h1 className="text-xl font-bold text-navy mb-2">Reset Password</h1>
        {done ? (
          <p className="text-green-600 text-sm font-medium">Password berhasil diubah! Mengalihkan...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Password Baru</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="input-field"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-3">
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}