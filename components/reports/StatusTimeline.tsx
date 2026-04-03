// ============================================================
// components/reports/StatusTimeline.tsx
// Visual timeline status laporan — Server Component
// ============================================================

import { formatDistanceToNow, format } from "date-fns";
import { id } from "date-fns/locale";
import type { ReportStatusLog } from "@/types";

// Status config (lokal, tidak import dari service agar tetap bisa server component)
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    shortLabel: string;
    color: string;
    bgColor: string;
    borderColor: string;
    dotColor: string;
    Icon: React.FC<{ className?: string }>;
  }
> = {
  pending: {
    label: "Pending",
    shortLabel: "Pending",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    dotColor: "bg-amber-400",
    Icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  diproses: {
    label: "Sedang Diproses",
    shortLabel: "Diproses",
    color: "text-blue",
    bgColor: "bg-blue/5",
    borderColor: "border-blue/30",
    dotColor: "bg-blue",
    Icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  selesai: {
    label: "Laporan Selesai",
    shortLabel: "Selesai",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    dotColor: "bg-green-500",
    Icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  ditolak: {
    label: "Laporan Ditolak",
    shortLabel: "Ditolak",
    color: "text-red",
    bgColor: "bg-red/5",
    borderColor: "border-red/25",
    dotColor: "bg-red",
    Icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

const ORDERED_STATUSES = ["pending", "diproses", "selesai"];

interface StatusTimelineProps {
  logs: ReportStatusLog[];
  currentStatus: string;
}

export default function StatusTimeline({ logs, currentStatus }: StatusTimelineProps) {
  const isDitolak = currentStatus === "ditolak";

  // Map status ke log (ambil yang pertama kali muncul)
  const logByStatus: Record<string, ReportStatusLog | undefined> = {};
  for (const log of logs) {
    if (!logByStatus[log.status]) {
      logByStatus[log.status] = log;
    }
  }

  // Tentukan statuses yang akan ditampilkan
  const displayStatuses = isDitolak
    ? ["pending", "ditolak"]
    : ORDERED_STATUSES;

  return (
    <div className="w-full">
      {/* Progress Bar (horizontal untuk non-ditolak) */}
      {!isDitolak && (
        <div className="flex items-center justify-between mb-8 relative">
          {/* Track */}
          <div className="absolute top-4 left-4 right-4 h-1 bg-navy/10 rounded-full -z-10" />
          {/* Active Track */}
          <div
            className="absolute top-4 left-4 h-1 bg-blue rounded-full -z-10 transition-all duration-700"
            style={{
              width:
                currentStatus === "pending"
                  ? "0%"
                  : currentStatus === "diproses"
                    ? "50%"
                    : "calc(100% - 2rem)",
            }}
          />

          {ORDERED_STATUSES.map((status) => {
            const isReached = isStatusReached(currentStatus, status);
            const isCurrent = currentStatus === status;
            const cfg = STATUS_CONFIG[status];
            const log = logByStatus[status];

            return (
              <div key={status} className="flex flex-col items-center gap-2 z-10">
                {/* Step circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isReached
                    ? `${cfg.dotColor} border-transparent text-white shadow-sm`
                    : "bg-white border-navy/20 text-navy/30"
                    } ${isCurrent ? "ring-4 ring-offset-2 ring-blue/30" : ""}`}
                >
                  {isReached ? (
                    <cfg.Icon className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">
                      {ORDERED_STATUSES.indexOf(status) + 1}
                    </span>
                  )}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p
                    className={`text-xs font-bold ${isCurrent ? cfg.color : isReached ? "text-navy/60" : "text-navy/30"
                      }`}
                  >
                    {cfg.shortLabel}
                  </p>
                  {log && (
                    <p className="text-[10px] text-navy/40 mt-0.5">
                      {format(new Date(log.created_at), "d MMM", { locale: id })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vertical Timeline Detail */}
      <div className="space-y-0">
        {displayStatuses.map((status, idx) => {
          const log = logByStatus[status];
          const cfg = STATUS_CONFIG[status];
          if (!log && !isStatusReached(currentStatus, status)) return null;

          const isActive = currentStatus === status;
          const isLast = idx === displayStatuses.length - 1;

          return (
            <div key={status} className="flex gap-4">
              {/* Timeline rail */}
              <div className="flex flex-col items-center">
                {/* Dot */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 ${log
                    ? `${cfg.dotColor} border-transparent text-white`
                    : "bg-navy/5 border-navy/20 text-navy/25"
                    } ${isActive ? "shadow-md ring-4 ring-offset-1 ring-blue/20" : ""}`}
                >
                  <cfg.Icon className="w-4 h-4" />
                </div>
                {/* Connector line */}
                {!isLast && (
                  <div className={`w-0.5 flex-1 my-1 min-h-8 ${log ? "bg-navy/15" : "bg-navy/8 dashed"}`} />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 pb-6 ${isLast ? "pb-0" : ""}`}>
                <div
                  className={`rounded-xl p-4 border ${log
                    ? `${cfg.bgColor} ${cfg.borderColor}`
                    : "bg-navy/3 border-dashed border-navy/15"
                    }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4
                      className={`text-sm font-bold ${log ? cfg.color : "text-navy/30"
                        }`}
                    >
                      {cfg.label}
                    </h4>
                    {log && (
                      <span className="text-[10px] text-navy/40 shrink-0 font-medium">
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </span>
                    )}
                  </div>

                  {/* Note */}
                  {log?.note ? (
                    <p className="text-xs text-navy/60 leading-relaxed">{log.note}</p>
                  ) : log ? (
                    <p className="text-xs text-navy/40 italic">Tidak ada catatan</p>
                  ) : (
                    <p className="text-xs text-navy/25 italic">Menunggu pemrosesan...</p>
                  )}

                  {/* Timestamp */}
                  {log && (
                    <p className="text-[10px] text-navy/35 mt-2">
                      {format(new Date(log.created_at), "EEEE, d MMMM yyyy · HH:mm", {
                        locale: id,
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function isStatusReached(currentStatus: string, checkStatus: string): boolean {
  const order = ["pending", "diproses", "selesai"];
  const currentIdx = order.indexOf(currentStatus);
  const checkIdx = order.indexOf(checkStatus);
  if (currentIdx === -1) return false; // ditolak case
  return checkIdx <= currentIdx;
}
