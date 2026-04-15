"use client";

import { JSX } from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

// Map status ke label dan styling
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  diproses: "bg-blue-100 text-blue-700 border border-blue-200",
  selesai: "bg-green-100 text-green-700 border border-green-200",
  ditolak: "bg-red-100 text-red-700 border border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

interface LiveStatusBadgeProps {
  initialStatus: string;
  reportId: string;
}

export default function LiveStatusBadge({
  initialStatus,
  reportId,
}: LiveStatusBadgeProps): JSX.Element {
  const [status, setStatus] = useState(initialStatus);

  // --- FIX #1: Sync dengan initialStatus dari SSR jika prop berubah ---
  // Ini menangani kasus di mana Server Component me-render ulang dengan status baru
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    // --- JALUR 1: Custom Event dari RealtimeStatusTimeline ---
    // Timeline akan dispatch event ini terlebih dahulu (dari INSERT ke report_status_logs)
    const handleStatusEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ reportId: string; status: string }>;
      const detail = customEvent.detail;

      // Guard: pastikan event ini untuk laporan yang sama
      if (detail && detail.reportId === reportId && detail.status) {
        setStatus(detail.status);
      }
    };

    window.addEventListener("statusUpdated", handleStatusEvent);

    // --- JALUR 2: Supabase Realtime langsung ke tabel `reports` ---
    // Ini adalah fallback: jika UPDATE ke tabel `reports` tiba lebih dulu dari log,
    // badge tetap langsung berubah tanpa menunggu event dari Timeline.
    const channel = supabase
      .channel(`report-badge-${reportId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "reports",
          filter: `id=eq.${reportId}`,
        },
        (payload) => {
          const newStatus = payload.new?.status as string | undefined;
          if (newStatus) {
            setStatus(newStatus);
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("statusUpdated", handleStatusEvent);
      supabase.removeChannel(channel);
    };
  }, [reportId]);

  // Normalisasi: pastikan status selalu lowercase untuk key lookup
  const normalizedStatus = (status || "pending").toLowerCase();
  const styleClass = STATUS_STYLES[normalizedStatus] ?? STATUS_STYLES.pending;
  const label = STATUS_LABELS[normalizedStatus] ?? status;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300 ${styleClass}`}
    >
      {label}
    </span>
  );
}