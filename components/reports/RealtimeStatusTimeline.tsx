"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import StatusTimeline from "./StatusTimeline";
import type { ReportStatusLog } from "@/types";
import { JSX } from "react";

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
  const [logs, setLogs] = useState<ReportStatusLog[]>(initialLogs || []);

  // Derive currentStatus langsung dari logs — tidak pakai state terpisah
  // Ini mencegah konflik antara dua source of truth
  const currentStatus = logs.length > 0
    ? logs[logs.length - 1].status
    : initialStatus;

  useEffect(() => {
    const channel = supabase
      .channel(`status-logs-${reportId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "report_status_logs",
        filter: `report_id=eq.${reportId}`,
      }, (payload) => {
        const newLog = payload.new as ReportStatusLog;

        setLogs((prev) => {
          if (prev.find((l) => l.id === newLog.id)) return prev;
          return [...prev, newLog];
        });

        // PASTIKAN INI TERPANGGIL
        if (onStatusChange) onStatusChange(newLog.status);

        // Gunakan penundaan kecil untuk memastikan state lokal sudah terupdate
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('statusUpdated', { 
              detail: { reportId, status: newLog.status } 
            })
          );
        }, 50);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [reportId, onStatusChange]);

  return (
    <StatusTimeline
      logs={logs}
      currentStatus={currentStatus}
    />
  );
}