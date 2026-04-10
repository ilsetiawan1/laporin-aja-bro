"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface TableSortHeaderProps {
  column: "created_at" | "priority_score";
  label: string;
  currentSort: string;
  currentOrder: string;
  searchParams: Record<string, string>;
  className?: string;
}

export default function TableSortHeader({
  column,
  label,
  currentSort,
  currentOrder,
  searchParams,
  className = "",
}: TableSortHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isActive = currentSort === column;
  const nextOrder = isActive && currentOrder === "desc" ? "asc" : "desc";

  const handleSort = () => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", column);
    params.set("order", nextOrder);
    params.delete("page"); // reset to page 1 on sort change
    startTransition(() => {
      router.push(`/admin/reports?${params.toString()}`);
    });
  };

  return (
    <th
      className={`text-left px-4 py-3 font-semibold select-none ${className}`}
    >
      <button
        onClick={handleSort}
        disabled={isPending}
        className={`inline-flex items-center gap-1 transition-colors ${
          isActive ? "text-blue" : "text-navy/50 hover:text-navy/80"
        }`}
      >
        <span>{label}</span>
        <span className="text-[10px] leading-none">
          {isActive ? (
            currentOrder === "desc" ? "↓" : "↑"
          ) : (
            <span className="text-navy/25">↕</span>
          )}
        </span>
      </button>
    </th>
  );
}
