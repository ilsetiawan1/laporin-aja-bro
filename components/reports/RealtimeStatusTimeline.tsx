"use client";

import { useState, useEffect } from "react";
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
}: RealtimeStatusTimelineProps) {
  const [logs, setLogs] = useState<ReportStatusLog[]>(initialLogs);

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
        const newStatus = payload.new.status;

        // 1. Update logs local state
        setLogs((prev) => {
          if (prev.find((l) => l.id === newLog.id)) return prev;
          return [...prev, newLog];
        });

        if (onStatusChange) onStatusChange(newStatus);
        window.dispatchEvent(new CustomEvent('statusUpdated', { detail: newStatus }));
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