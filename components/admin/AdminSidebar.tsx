// components/admin/AdminSidebar.tsx
import Link from "next/link";

interface Props {
  fullName: string;
}

export default function AdminSidebar({ fullName }: Props) {
  return (
    <aside className="w-56 shrink-0 bg-navy min-h-screen p-6 hidden md:flex flex-col gap-1">
      {/* Identity */}
      <div className="mb-6">
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">
          Admin Panel
        </p>
        <p className="text-white font-bold text-sm truncate">{fullName}</p>
      </div>

      {/* Nav Links */}
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Dashboard
      </Link>

      <Link
        href="/admin/reports"
        className="flex items-center gap-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Kelola Laporan
      </Link>

      {/* Divider */}
      <div className="my-3 border-t border-white/10" />

      {/* Bottom links */}
      <Link
        href="/"
        className="flex items-center gap-2.5 text-white/40 hover:text-white/70 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Beranda
      </Link>
    </aside>
  );
}