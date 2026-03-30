// app/admin/reports/[id]/page.tsx
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";
import Image from "next/image";
import { getReportDetailAction } from "@/lib/actions/reports";
import { getStatusTimeline } from "@/lib/actions/statusLogs";
import StatusTimeline from "@/components/reports/StatusTimeline";
import UpdateStatusForm from "@/components/admin/UpdateStatusForm";
import { getPriorityBadgeClass, getPriorityLabel } from "@/lib/utils/priorityCalculator";
import { createServerClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-400/15 text-yellow-700",
  diproses: "bg-blue/10 text-blue",
  selesai: "bg-green-500/10 text-green-700",
  ditolak: "bg-red/10 text-red",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

export default async function AdminReportDetailPage({ params }: Props) {
  const { id: reportId } = await params;

  // Auth + admin check
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/?modal=login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") redirect("/");

  // Fetch data
  const [report, statusLogs] = await Promise.all([
    getReportDetailAction(reportId),
    getStatusTimeline(reportId),
  ]);

  if (!report) notFound();

  const priority = getPriorityLabel(report.priority_score ?? 0);
  const badgeClass = getPriorityBadgeClass(priority);

  return (
    <div className="min-h-screen bg-bg flex">
      <AdminSidebar fullName={profile.full_name ?? user.email ?? "Admin"} />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-xs text-navy/50">
            <Link
              href="/admin/dashboard"
              className="hover:text-navy transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-navy/20">/</span>
            <Link
              href="/admin/reports"
              className="hover:text-navy transition-colors"
            >
              Kelola Laporan
            </Link>
            <span className="text-navy/20">/</span>
            <span className="text-navy/70 line-clamp-1 max-w-[200px]">
              {report.title}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Main Content (2/3) ── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6">

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[report.status]}`}>
                      {STATUS_LABELS[report.status]}
                    </span>
                    {report.categories?.name && (
                      <span className="text-xs text-navy/50 bg-navy/5 px-2.5 py-1 rounded-full font-medium">
                        {report.categories.name}
                      </span>
                    )}
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeClass}`}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </span>
                    {report.is_anonymous && (
                      <span className="text-xs text-orange bg-orange/10 px-2.5 py-1 rounded-full font-semibold">
                        Anonim
                      </span>
                    )}
                  </div>

                  <h1 className="text-xl font-bold text-navy mb-4">{report.title}</h1>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-xs text-navy/50 mb-5">
                    {report.cities?.name && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {report.cities.name}
                        {report.districts?.name && `, ${report.districts.name}`}
                      </span>
                    )}
                    {report.address && (
                      <span>📍 {report.address}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDistanceToNow(new Date(report.created_at), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 mb-2">
                    <div className="text-center bg-navy/5 rounded-xl px-4 py-2.5">
                      <p className="text-lg font-bold text-navy">{report.vote_count ?? 0}</p>
                      <p className="text-[10px] text-navy/50 font-medium">Dukungan</p>
                    </div>
                    <div className="text-center bg-navy/5 rounded-xl px-4 py-2.5">
                      <p className="text-lg font-bold text-navy">{report.similar_count ?? 0}</p>
                      <p className="text-[10px] text-navy/50 font-medium">Laporan Mirip</p>
                    </div>
                    <div className="text-center bg-navy/5 rounded-xl px-4 py-2.5">
                      <p className="text-lg font-bold text-navy">{report.priority_score ?? 0}</p>
                      <p className="text-[10px] text-navy/50 font-medium">Priority Score</p>
                    </div>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="px-6 pb-6 border-t border-slate-100 pt-4">
                  <h3 className="text-xs font-bold text-navy/40 uppercase tracking-widest mb-3">
                    Deskripsi
                  </h3>
                  <p className="text-sm text-navy/70 leading-relaxed whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>

                {/* Foto */}
                {report.image_urls && report.image_urls.length > 0 && (
                  <div className="px-6 pb-6">
                    <h3 className="text-xs font-bold text-navy/40 uppercase tracking-widest mb-3">
                      Bukti Foto
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {report.image_urls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="relative aspect-video rounded-xl overflow-hidden hover:opacity-80 transition-opacity">
                            <Image
                              src={url}
                              alt={`Bukti ${i + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Sidebar Actions (1/3) ── */}
            <div className="space-y-4">

              {/* Update Status */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-orange/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-navy">Kelola Status</h3>
                </div>
                <UpdateStatusForm
                  reportId={report.id}
                  currentStatus={report.status}
                />
              </div>

              {/* Status Timeline */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-blue/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-navy">Riwayat Status</h3>
                </div>
                <StatusTimeline logs={statusLogs} currentStatus={report.status} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}