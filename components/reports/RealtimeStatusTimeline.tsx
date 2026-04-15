"use client";

import { JSX } from "react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import StatusTimeline from "./StatusTimeline";
import type { ReportStatusLog } from "@/types";

interface RealtimeStatusTimelineProps {
  reportId: string;
  initialLogs: ReportStatusLog[];
  initialStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

export default function RealtimeStatusTimeline({
  reportId,
  initialLogs,
  initialStatus,
  onStatusChange,
}: RealtimeStatusTimelineProps): JSX.Element {
  // Pastikan initialLogs selalu array yang valid (guard SSR)
  const [logs, setLogs] = useState<ReportStatusLog[]>(
    Array.isArray(initialLogs) ? initialLogs : []
  );

  // --- FIX: currentStatus SELALU bersumber dari log terbaru ---
  // Ini adalah satu-satunya "source of truth" untuk status saat ini.
  const currentStatus =
    logs.length > 0 ? logs[logs.length - 1].status : initialStatus;

  // Callback stabil agar useEffect tidak re-subscribe tiap render
  const handleStatusChange = useCallback(
    (newStatus: string) => {
      if (onStatusChange) onStatusChange(newStatus);
    },
    [onStatusChange]
  );

  useEffect(() => {
    const channel = supabase
      .channel(`status-logs-${reportId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "report_status_logs",
          filter: `report_id=eq.${reportId}`,
        },
        (payload) => {
          const newLog = payload.new as ReportStatusLog;

          setLogs((prev) => {
            // Cegah duplikat berdasarkan id
            if (prev.some((l) => l.id === newLog.id)) return prev;
            // Tambahkan di akhir (urutan ascending = terlama → terbaru)
            return [...prev, newLog];
          });

          // Beritahu parent (mis: AdminReportSidebar) tentang status terbaru
          handleStatusChange(newLog.status);

          // Dispatch custom event setelah state selesai di-update
          // Detail berisi reportId agar Badge tidak salah menangkap event laporan lain
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("statusUpdated", {
                detail: { reportId, status: newLog.status },
              })
            );
          }, 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reportId, handleStatusChange]);

  return (
    <StatusTimeline
      logs={logs}
      currentStatus={currentStatus}
    />
  );
}