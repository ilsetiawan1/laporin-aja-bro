"use client";
// components/admin/PriorityList.tsx

import { useState } from "react";
import Link from "next/link";
import { getPriorityBadgeClass, getPriorityLabel } from "@/lib/utils/priorityCalculator";
import type { ReportWithRelations } from "@/types";

type PriorityLevel = "tinggi" | "sedang" | "rendah";

const PRIORITY_ICONS: Record<PriorityLevel, string> = {
  tinggi: "↑",
  sedang: "→",
  rendah: "↓",
};

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  tinggi: "text-red",
  sedang: "text-orange",
  rendah: "text-navy/40",
};

interface Props {
  reports: ReportWithRelations[];
}

export default function PriorityList({ reports }: Props) {
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>("sedang");

  const filtered = reports.filter((r) => {
    const p = getPriorityLabel(r.priority_score ?? 0);
    return p === selectedPriority;
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-navy font-bold text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red inline-block" />
          Prioritas
        </h3>

        {/* Dropdown filter */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value as PriorityLevel)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-navy 
                     bg-white focus:outline-none focus:ring-2 focus:ring-blue/20 cursor-pointer"
        >
          <option value="tinggi">↑ Tinggi</option>
          <option value="sedang">→ Sedang</option>
          <option value="rendah">↓ Rendah</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-navy/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
          </div>
          <p className="text-navy/40 text-sm font-medium">
            Tidak ada laporan prioritas {selectedPriority}
          </p>
        </div>
      ) : (
        <div className="space-y-1 flex-1 overflow-y-auto max-h-64">
          {filtered.map((r) => {
            const priority = getPriorityLabel(r.priority_score ?? 0) as PriorityLevel;
            return (
              <Link
                key={r.id}
                href={`/admin/reports/${r.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-sm font-bold ${PRIORITY_COLORS[priority]}`}>
                  {PRIORITY_ICONS[priority]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-navy font-semibold text-xs line-clamp-1 group-hover:text-blue transition-colors">
                    {r.title}
                  </p>
                  <p className="text-navy/40 text-[11px] mt-0.5">
                    {r.categories?.name ?? "—"}
                    {r.cities?.name && ` · ${r.cities.name}`}
                  </p>
                </div>

                {/* Score badge */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getPriorityBadgeClass(priority)}`}>
                  {PRIORITY_ICONS[priority]} {r.priority_score}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}