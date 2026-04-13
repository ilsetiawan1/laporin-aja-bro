import AdminSidebar from "@/components/admin/AdminSidebar";
import ActivityHistoryReports from "@/components/admin/ActivityHistoryReports";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminActivityPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/?modal=login");

  const { data: profile } = await supabase
    .from("profiles").select("role, full_name").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-bg flex">
      <AdminSidebar fullName={profile.full_name ?? user.email ?? "Admin"} />
      <main className="flex-1 px-6 pb-6 pt-20 lg:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <ActivityHistoryReports />
        </div>
      </main>
    </div>
  );
}