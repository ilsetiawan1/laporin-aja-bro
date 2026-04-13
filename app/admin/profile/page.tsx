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
    <div className="flex min-h-screen bg-bg md:flex">
      <AdminSidebar fullName={profile.full_name || "Admin"} avatarUrl={profile.avatar_url} />

      {/* Main Container */}
      <main className="flex-1 overflow-x-hidden">
        
        {/* ── STICKY HEADER (Mobile First) ── */}
        {/* Mobile: pt-24 agar di bawah Navbar Mobile | Desktop: md:pt-10 & md:static (lepas sticky) */}
        <div className="sticky top-0 z-20 bg-bg/95 backdrop-blur-sm px-6 pt-24 pb-6 md:static md:bg-transparent md:backdrop-blur-none md:px-8 md:pt-10 md:pb-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-navy/40 text-[10px] font-bold uppercase tracking-widest mb-1">Admin Panel</p>
            <h1 className="text-2xl font-bold text-navy">Profil Saya</h1>
            {/* Deskripsi sembunyi di mobile pas sticky biar ringkas, muncul di desktop */}
            <p className="hidden md:block text-navy/55 text-sm mt-1">Kelola informasi dan pengaturan akun admin.</p>
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="px-6 pb-20 md:px-8 md:py-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Deskripsi khusus mobile (muncul di bawah header pas scroll) */}
            <p className="md:hidden text-navy/55 text-sm mb-8">Kelola informasi dan pengaturan akun admin.</p>

            {/* Form Card */}
            <div className="max-w-3xl">
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-navy/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <ProfileForm profile={profile} />
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}