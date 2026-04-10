"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { updateStatusAction } from "@/lib/actions/statusLogs";
import type { ReportStatus } from "@/types";

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

const STATUS_STYLES: Record<ReportStatus, string> = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  diproses: "bg-blue/10 text-blue border-blue/20 hover:bg-blue/15",
  selesai:
    "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
  ditolak: "bg-red/10 text-red border-red/20 hover:bg-red/15",
};

// Mirror of VALID_TRANSITIONS from UpdateStatusForm.tsx 
const VALID_TRANSITIONS: Record<string, ReportStatus[]> = {
  pending: ["diproses", "selesai", "ditolak"],
  diproses: ["selesai", "ditolak"],
  selesai: [],
  ditolak: [],
};

const TRANSITION_LABELS: Record<ReportStatus, string> = {
  pending: "Kembalikan ke Menunggu",
  diproses: "Tandai Diproses",
  selesai: "Tandai Selesai ✓",
  ditolak: "Tolak Laporan ✕",
};

const TRANSITION_STYLES: Record<ReportStatus, string> = {
  pending: "text-navy/70 hover:bg-amber-50",
  diproses: "text-blue hover:bg-blue/5",
  selesai: "text-green-700 hover:bg-green-50",
  ditolak: "text-red hover:bg-red/5",
};

interface QuickStatusBadgeProps {
  reportId: string;
  initialStatus: ReportStatus;
}

export default function QuickStatusBadge({
  reportId,
  initialStatus,
}: QuickStatusBadgeProps) {
  const [status, setStatus] = useState<ReportStatus>(initialStatus);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  const availableTransitions = VALID_TRANSITIONS[status] ?? [];

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (newStatus: ReportStatus) => {
    const previousStatus = status;
    // Optimistic update
    setStatus(newStatus);
    setOpen(false);

    startTransition(async () => {
      const result = await updateStatusAction({ reportId, newStatus });
      if (!result.success) {
        // Revert on failure
        setStatus(previousStatus);
        toast.error("Gagal memperbarui status", { description: result.error });
      } else {
        toast.success(`Status diperbarui ke "${STATUS_LABELS[newStatus]}"`);
      }
    });
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        onClick={() => availableTransitions.length > 0 && setOpen((v) => !v)}
        disabled={isPending}
        title={
          availableTransitions.length === 0
            ? "Status final — tidak bisa diubah"
            : "Klik untuk ubah status"
        }
        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border transition-colors select-none ${
          STATUS_STYLES[status]
        } ${availableTransitions.length > 0 ? "cursor-pointer" : "cursor-default"} ${
          isPending ? "opacity-60" : ""
        }`}
      >
        {STATUS_LABELS[status]}
        {availableTransitions.length > 0 && (
          <svg
            className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && availableTransitions.length > 0 && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[160px]">
          {availableTransitions.map((s) => (
            <button
              key={s}
              onClick={() => handleSelect(s)}
              className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${TRANSITION_STYLES[s]}`}
            >
              {TRANSITION_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
