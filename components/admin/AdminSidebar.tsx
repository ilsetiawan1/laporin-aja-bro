// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/lib/actions/auth";

interface Props {
  fullName: string;
  avatarUrl?: string | null;
}

const navLinks = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/admin/reports",
    label: "Kelola Laporan",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: "/admin/activity",
    label: "Riwayat Aktivitas",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

// ── Shared Avatar ─────────────────────────────────────────────
function Avatar({ avatarUrl, fullName, size = "md" }: { avatarUrl?: string | null; fullName: string; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${dim} rounded-full bg-blue/20 border-2 border-white/20 overflow-hidden relative shrink-0 flex items-center justify-center`}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="text-white/80 font-bold">
          {fullName?.charAt(0).toUpperCase() || "A"}
        </span>
      )}
    </div>
  );
}

// ── Desktop Sidebar Content ───────────────────────────────────
function SidebarContent({ fullName, avatarUrl, onClose }: { fullName: string; avatarUrl?: string | null; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full p-5">
      {/* Identity */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/admin/profile" className="flex items-center gap-2.5 group min-w-0" onClick={onClose}>
          <Avatar avatarUrl={avatarUrl} fullName={fullName} />
          <div className="min-w-0">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Admin Panel</p>
            <p className="text-white font-bold text-sm truncate group-hover:text-orange transition-colors">
              {fullName}
            </p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-white/40 hover:text-white transition-colors p-1 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1 flex-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/65 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 pt-3 mt-3 space-y-1">
        <Link
          href="/admin/profile"
          onClick={onClose}
          className="flex items-center gap-2.5 text-white/50 hover:text-white/80 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profil Saya
        </Link>
        <button
          onClick={() => logoutAction()}
          className="flex items-center gap-2.5 w-full text-left text-red-400/70 hover:text-red-400 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar
        </button>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────
export default function AdminSidebar({ fullName, avatarUrl }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-56 shrink-0 bg-navy sticky top-0 h-screen flex-col">
        <SidebarContent fullName={fullName} avatarUrl={avatarUrl} />
      </aside>

      {/* ── Mobile: Floating Pill Top Bar ── */}
      <div className="md:hidden fixed top-4 left-4 right-4 z-40">
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-navy/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-navy/40">
          {/* Identity */}
          <Link href="/admin/profile" className="flex items-center gap-2.5">
            <Avatar avatarUrl={avatarUrl} fullName={fullName} size="sm" />
            <div>
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest leading-none mb-0.5">Admin Panel</p>
              <p className="text-white font-bold text-sm leading-none truncate max-w-[140px]">{fullName}</p>
            </div>
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col gap-1.5 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Buka menu"
          >
            <span className="w-5 h-0.5 bg-white rounded-full" />
            <span className="w-5 h-0.5 bg-white rounded-full" />
            <span className="w-5 h-0.5 bg-white rounded-full" />
          </button>
        </div>
      </div>

      {/* ── Mobile: Drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-navy h-full shadow-2xl flex flex-col">
            <SidebarContent fullName={fullName} avatarUrl={avatarUrl} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Mobile spacer ── */}
      <div className="md:hidden h-16 shrink-0" />
    </>
  );
}