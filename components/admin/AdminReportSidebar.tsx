// AdminReportSidebar.tsx
"use client";

import { useState } from "react";
import UpdateStatusForm from "@/components/admin/UpdateStatusForm";
import RealtimeStatusTimeline from "@/components/reports/RealtimeStatusTimeline";
import type { ReportStatusLog } from "@/types";

interface Props {
  reportId: string;
  currentStatus: string;
  initialLogs: ReportStatusLog[];
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

export default function AdminReportSidebar({ reportId, currentStatus, initialLogs }: Props) {
  const [liveStatus, setLiveStatus] = useState(currentStatus);

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <p className="text-xs font-bold text-navy/40 uppercase tracking-widest mb-2">Status Saat Ini</p>
        <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${STATUS_STYLES[liveStatus]}`}>
          {STATUS_LABELS[liveStatus] ?? liveStatus}
        </span>
      </div>

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
        {/*
          liveStatus dipakai di sini agar opsi transisi ikut update
          setelah realtime push log baru
        */}
        <UpdateStatusForm
          reportId={reportId}
          currentStatus={liveStatus}
          onSuccess={(newStatus) => setLiveStatus(newStatus)}
        />
      </div>

      {/* Status Timeline Realtime */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-navy">Riwayat Status</h3>
        </div>

        <RealtimeStatusTimeline
          reportId={reportId}
          initialLogs={initialLogs}
          initialStatus={currentStatus}
          onStatusChange={setLiveStatus}
        />
      </div>
    </div>
  );
}