"use client";

// ============================================================
// components/reports/RealtimeStatusTimeline.tsx
// StatusTimeline dengan Realtime update via Supabase channel
// ALLOWED EXCEPTION: supabase.channel() harus di client
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import StatusTimeline from "./StatusTimeline";
import type { ReportStatusLog } from "@/types";

interface RealtimeStatusTimelineProps {
  reportId: string;
  initialLogs: ReportStatusLog[];
  initialStatus: string;
}

export default function RealtimeStatusTimeline({
  reportId,
  initialLogs,
  initialStatus,
}: RealtimeStatusTimelineProps) {
  const [logs, setLogs] = useState<ReportStatusLog[]>(initialLogs);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);

  const handleNewLog = useCallback((payload: { new: Record<string, unknown> }) => {
    const raw = payload.new;
    const newLog: ReportStatusLog = {
      id: raw.id as string,
      report_id: raw.report_id as string,
      status: raw.status as string,
      changed_by: (raw.changed_by as string) ?? null,
      note: (raw.note as string) ?? null,
      created_at: raw.created_at as string,
    };

    setLogs((prev) => {
      // Dedupe: jangan tambah kalau sudah ada
      if (prev.find((l) => l.id === newLog.id)) return prev;
      return [...prev, newLog];
    });

    // Update status saat ini
    setCurrentStatus(newLog.status);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`status_logs:${reportId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "report_status_logs",
          filter: `report_id=eq.${reportId}`,
        },
        handleNewLog
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reportId, handleNewLog]);

  return (
    <StatusTimeline
      logs={logs}
      currentStatus={currentStatus}
    />
  );
}
