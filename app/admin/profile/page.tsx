// app/admin/profile/page.tsx



import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/app/dashboard/profile/ProfileForm";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Profil Admin — Laporin Aja Bro",
};

export default async function AdminProfilePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Pastikan user adalah admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, nik, full_name, phone_number, gender, birth_date, city_id, district_id, avatar_url, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/");

  if (user.email) profile.email = user.email;

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar fullName={profile.full_name || "Admin"} avatarUrl={profile.avatar_url} />

      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-navy/40 text-xs font-bold uppercase tracking-widest mb-1">Admin Panel</p>
          <h1 className="text-2xl font-bold text-navy">Profil Saya</h1>
          <p className="text-navy/55 text-sm mt-1">Kelola informasi dan pengaturan akun admin.</p>
        </div>

        {/* Form Card */}
        <div className="max-w-3xl">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-navy/8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <ProfileForm profile={profile} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}