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

  const [currentStatus, setCurrentStatus] = useState(() => {
    if (initialLogs.length > 0) {
      return initialLogs[initialLogs.length - 1].status;
    }
    return initialStatus;
  });

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

        // Dedupe
        setLogs((prev) => {
          if (prev.find((l) => l.id === newLog.id)) return prev;
          return [...prev, newLog];
        });

        setCurrentStatus(newLog.status);
        onStatusChange?.(newLog.status);
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