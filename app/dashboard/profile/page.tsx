import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import Navbar from "@/components/ui/Navbar";

export default async function ProfilePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?modal=login");
  }

  // Fetch full profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      id, email, nik, full_name, phone_number, gender, birth_date,
      city_id, district_id, avatar_url, role
    `)
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Should generally exist due to trigger, but fallback:
    return <div className="p-8 text-center">Gagal memuat profil.</div>;
  }

  return (
    <main className="flex flex-col min-h-screen bg-bg">
      <Navbar />
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-24">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-navy/10 relative overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-navy mb-2">Profil Saya</h1>
            <p className="text-navy/60 text-sm mb-8">
              Kelola informasi pribadi dan pengaturan akun Anda di sini.
            </p>
            
            <ProfileForm profile={profile} />
          </div>
        </div>
      </div>
    </main>
  );
}
