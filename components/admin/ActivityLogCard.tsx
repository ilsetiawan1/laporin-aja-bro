// components/admin/ActivityLogCard.tsx

"use client";

import { formatDistanceToNow, format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { STATUS_CONFIG } from "@/lib/hooks/activityStatus";
import { ActivityLog } from "@/lib/hooks/useActivityLogs";


const STATUS_ICONS: Record<string, React.FC<{ className?: string }>> = {
  pending: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  diproses: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  selesai: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ditolak: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function ActivityLogCard({ log }: { log: ActivityLog }) {
  const cfg  = STATUS_CONFIG[log.status] ?? STATUS_CONFIG.pending;
  const Icon = STATUS_ICONS[log.status]  ?? STATUS_ICONS.pending;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md transition-all duration-200 p-5">
      <div className="flex gap-4">
        {/* Status icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${cfg.bg}`}>
          <Icon className={`w-5 h-5 ${cfg.color}`} />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Badge + admin + timestamp */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
              <span className="text-xs text-navy/50">
                oleh <span className="text-navy font-bold">{log.admin_name ?? "Admin"}</span>
              </span>
            </div>
            <span className="text-[11px] text-navy/35 shrink-0">
              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: id })}
            </span>
          </div>

          {/* Report link */}
          <Link
            href={`/admin/reports/${log.report_id}`}
            className="text-sm font-semibold text-navy hover:text-blue transition-colors line-clamp-1"
          >
            {log.report_title ?? `Laporan #${log.report_id.slice(0, 8)}`}
          </Link>

          {/* Note */}
          {log.note && (
            <p className="text-xs text-navy/50 mt-1.5 bg-navy/3 rounded-lg px-3 py-2 italic">
              "{log.note}"
            </p>
          )}

          {/* Meta */}
          <p className="text-[10px] text-navy/30 mt-2">
            {format(new Date(log.created_at), "HH:mm 'WIB'", { locale: id })}
            {" · ID: "}{log.report_id.slice(0, 8)}...
          </p>
        </div>
      </div>
    </div>
  );
}