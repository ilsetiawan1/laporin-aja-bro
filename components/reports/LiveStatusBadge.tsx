"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { JSX } from "react";

interface LiveStatusBadgeProps {
  initialStatus: string;
  reportId: string;
}

export default function LiveStatusBadge({
  initialStatus,
  reportId
}: LiveStatusBadgeProps): JSX.Element {
  const [status, setStatus] = useState(initialStatus);

  // Sync dengan initialStatus untuk antisipasi isu race-condition atau re-render pada SSR
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    // 1. Listen via Custom Event (dari Timeline)
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        // Mendeteksi data dari custom event yang memiliki reportId (terbaru)
        if (customEvent.detail.reportId && customEvent.detail.reportId === reportId) {
          setStatus(customEvent.detail.status);
        }
        // Mendeteksi fallback data string murni
        else if (typeof customEvent.detail === 'string') {
          setStatus(customEvent.detail);
        }
      }
    };
    
    window.addEventListener('statusUpdated', handleUpdate);

    // 2. Listen via Realtime Supabase (Langsung ke tabel reports)
    const channel = supabase
      .channel(`report-badge-${reportId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "reports",
          filter: `id=eq.${reportId}`
        },
        (payload) => {
          if (payload.new && payload.new.status) {
            setStatus(payload.new.status);
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('statusUpdated', handleUpdate);
      supabase.removeChannel(channel);
    };
  }, [reportId]);

  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    diproses: "bg-blue-100 text-blue-700 border border-blue-200",
    selesai: "bg-green-100 text-green-700 border border-green-200",
    ditolak: "bg-red-100 text-red-700 border border-red-200",
  };

  const labels: Record<string, string> = {
    pending: "Menunggu",
    diproses: "Diproses",
    selesai: "Selesai",
    ditolak: "Ditolak",
  };

  const normalizedStatus = status?.toLowerCase() || 'pending';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300 ${styles[normalizedStatus] || styles.pending}`}>
      {labels[normalizedStatus] || status}
    </span>
  );
}