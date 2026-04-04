// components\admin\UpdateStatusForm.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateStatusAction } from "@/lib/actions/statusLogs";
import type { ReportStatus } from "@/types";

interface UpdateStatusFormProps {
  reportId: string;
  currentStatus: string;
  onSuccess?: (newStatus: string) => void;
}

const STATUS_OPTIONS: { value: ReportStatus; label: string; color: string }[] = [
  { value: "diproses", label: "Tandai Sedang Diproses", color: "text-blue" },
  { value: "selesai", label: "Tandai Selesai ✓", color: "text-green-700" },
  { value: "ditolak", label: "Tolak Laporan ✕", color: "text-red" },
];

// Transisi status yang valid
const VALID_TRANSITIONS: Record<string, ReportStatus[]> = {
  pending: ["diproses", "selesai", "ditolak"],
  diproses: ["selesai", "ditolak"],
  selesai: [],
  ditolak: [],
};

export default function UpdateStatusForm({
  reportId,
  currentStatus,
  onSuccess,
}: UpdateStatusFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | "">("");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const availableStatuses = VALID_TRANSITIONS[currentStatus] ?? [];

  if (availableStatuses.length === 0) {
    return (
      <div className="bg-navy/5 rounded-xl p-4 text-sm text-navy/50 text-center">
        Status laporan ini sudah final dan tidak bisa diubah lagi.
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) {
      toast.error("Pilih status baru terlebih dahulu.");
      return;
    }

    startTransition(async () => {
      const result = await updateStatusAction({
        reportId,
        newStatus: selectedStatus,
        note: note.trim() || undefined,
      });

      if (!result.success) {
        toast.error("Gagal", { description: result.error });
        return;
      }

      toast.success("Status berhasil diperbarui!", {
        description: `Laporan sekarang berstatus: ${selectedStatus}`,
      });
      onSuccess?.(selectedStatus);
      setNote("");
      setSelectedStatus("");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-navy/50 uppercase tracking-widest mb-2">
          Ubah Status
        </label>
        <div className="space-y-2">
          {STATUS_OPTIONS.filter((opt) => availableStatuses.includes(opt.value)).map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                selectedStatus === opt.value
                  ? "border-navy/30 bg-navy/5"
                  : "border-navy/10 hover:border-navy/20 hover:bg-navy/3"
              }`}
            >
              <input
                type="radio"
                name="status"
                value={opt.value}
                checked={selectedStatus === opt.value}
                onChange={() => setSelectedStatus(opt.value)}
                className="accent-blue"
              />
              <span className={`text-sm font-semibold ${opt.color}`}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-navy/50 uppercase tracking-widest mb-2">
          Catatan (opsional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tulis catatan untuk pelapor, misalnya: 'Sudah diteruskan ke Dinas PU'"
          rows={3}
          className="w-full text-sm bg-white border border-navy/15 rounded-xl px-3 py-2.5 text-navy/80 placeholder-navy/30 focus:outline-none focus:border-blue/40 resize-none"
          maxLength={300}
        />
        <p className="text-right text-[10px] text-navy/30 mt-1">{note.length}/300</p>
      </div>

      <button
        type="submit"
        disabled={!selectedStatus || isPending}
        className={`w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 ${
          selectedStatus && !isPending
            ? "bg-blue hover:bg-blue-hover shadow-sm"
            : "bg-navy/20 cursor-not-allowed"
        }`}
      >
        {isPending ? "Memperbarui..." : "Perbarui Status"}
      </button>
    </form>
  );
}
