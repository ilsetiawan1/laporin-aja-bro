"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface PaginationBarProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  searchParams: Record<string, string>;
}

export default function PaginationBar({
  currentPage,
  totalCount,
  pageSize,
  searchParams,
}: PaginationBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    startTransition(() => {
      router.push(`/admin/reports?${params.toString()}`);
    });
  };

  // Build page number array with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <p className="text-xs text-navy/40">
        Menampilkan{" "}
        <span className="font-semibold text-navy/60">
          {from}–{to}
        </span>{" "}
        dari{" "}
        <span className="font-semibold text-navy/60">{totalCount}</span>{" "}
        laporan
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1 || isPending}
          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-navy/50 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>

        {/* Pages */}
        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-xs text-navy/30">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => goToPage(p as number)}
              disabled={isPending}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                currentPage === p
                  ? "bg-blue text-white shadow-sm"
                  : "text-navy/60 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages || isPending}
          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-navy/50 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
