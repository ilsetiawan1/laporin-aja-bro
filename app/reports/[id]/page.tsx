import { notFound } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/landing/Footer";
import ReportComments from "@/components/reports/ReportComments";
import VoteButton, { PriorityBadge } from "@/components/reports/VoteButton";
import RealtimeStatusTimeline from "@/components/reports/RealtimeStatusTimeline";
import { getReportDetailAction } from "@/lib/actions/reports";
import { checkUserVoteAction } from "@/lib/actions/votes";
import { getStatusTimeline } from "@/lib/actions/statusLogs";
import { getAuthUser } from "@/lib/actions/auth";
import { getPriorityBadgeClass, getPriorityLabel } from "@/lib/utils/priorityCalculator";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-400/15 text-yellow-700 border-yellow-400/30",
  diproses: "bg-blue/10 text-blue border-blue/25",
  selesai: "bg-green-500/10 text-green-700 border-green-500/25",
  ditolak: "bg-red/10 text-red border-red/25",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id: reportId } = await params;
  const report = await getReportDetailAction(reportId);
  if (!report) return { title: "Laporan tidak ditemukan" };
  return {
    title: `${report.title} — Laporin Aja Bro`,
    description: report.description.slice(0, 160),
  };
}

export default async function ReportDetailPage({ params }: Props) {
  const { id: reportId } = await params;

  // Fetch semua data secara parallel
  const [report, authUser, voteData, statusLogs] = await Promise.all([
    getReportDetailAction(reportId),
    getAuthUser(),
    checkUserVoteAction(reportId),
    getStatusTimeline(reportId),
  ]);

  if (!report) notFound();

  const priority = getPriorityLabel(report.priority_score ?? 0);
  const badgeClass = getPriorityBadgeClass(priority);

  return (
    <main className="flex flex-col min-h-screen bg-bg">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-navy/40 mb-6">
          <Link href="/" className="hover:text-navy/70 transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/status" className="hover:text-navy/70 transition-colors">Status Laporan</Link>
          <span>/</span>
          <span className="text-navy/70 line-clamp-1">{report.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Kolom Kiri: Main Info (2/3) ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Main Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

              {/* Header */}
              <div className="p-6 sm:p-8 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_STYLES[report.status] ?? STATUS_STYLES.pending}`}>
                    {STATUS_LABELS[report.status] ?? report.status}
                  </span>
                  {report.categories?.name && (
                    <span className="text-xs font-medium text-navy/50 bg-navy/5 px-2.5 py-1 rounded-full">
                      {report.categories.name}
                    </span>
                  )}
                  <PriorityBadge priority={priority} badgeClass={badgeClass} />
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-navy leading-snug mb-4">
                  {report.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-3 text-sm text-navy/50">
                  {report.cities?.name && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-orange shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {report.cities.name}
                      {report.districts?.name && `, ${report.districts.name}`}
                    </span>
                  )}
                  {report.address && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {report.address}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: id })}
                  </span>
                  {report.is_anonymous && (
                    <span className="flex items-center gap-1.5 text-orange">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Anonim
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="p-6 sm:p-8 border-b border-slate-100">
                <h2 className="text-xs font-bold text-navy/40 uppercase tracking-widest mb-3">Detail Laporan</h2>
                <p className="text-navy/80 leading-relaxed whitespace-pre-wrap text-sm">{report.description}</p>

                {/* Similar reports */}
                {(report.similar_count ?? 0) > 0 && (
                  <div className="mt-5 flex items-center gap-2.5 bg-orange/5 border border-orange/15 rounded-xl px-4 py-3">
                    <svg className="w-5 h-5 text-orange shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm text-orange font-medium">
                      <span className="font-bold">{report.similar_count} warga lain</span> juga melaporkan masalah serupa
                    </p>
                  </div>
                )}
              </div>

              {/* Image Gallery */}
              {report.image_urls && report.image_urls.length > 0 && (
                <div className="p-6 sm:p-8 border-b border-slate-100">
                  <h2 className="text-xs font-bold text-navy/40 uppercase tracking-widest mb-3">Bukti Foto</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {report.image_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 hover:opacity-90 transition-opacity">
                          <Image src={url} alt={`Bukti ${i + 1}`} fill className="object-cover" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Vote Section */}
              <div className="p-6 sm:p-8">
                <h2 className="text-xs font-bold text-navy/40 uppercase tracking-widest mb-3">Dukungan Masyarakat</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <VoteButton
                    reportId={report.id}
                    initialVoteCount={report.vote_count ?? 0}
                    initialHasVoted={voteData.hasVoted}
                    initialPriorityScore={report.priority_score ?? 0}
                    initialPriority={priority}
                    userId={authUser?.id ?? null}
                    size="md"
                  />
                  {!authUser && (
                    <p className="text-xs text-navy/40">
                      <Link href="/?modal=login" className="text-blue underline font-medium">Login</Link> untuk memberikan dukungan
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div id="komentar" className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 scroll-mt-24">
              <ReportComments
                reportId={report.id}
                user={authUser ? { id: authUser.id } : null}
              />
            </div>
          </div>

          {/* ── Kolom Kanan: Status Timeline (1/3) ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 rounded-lg bg-blue/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy">Status Laporan</h3>
                  <p className="text-[11px] text-navy/40">Update realtime</p>
                </div>
              </div>

              <RealtimeStatusTimeline
                reportId={report.id}
                initialLogs={statusLogs}
                initialStatus={report.status}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
