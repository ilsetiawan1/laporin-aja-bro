// components\ui\NavbarClient.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";

export default function NavbarClient({ initialProfile }: { initialProfile: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHash(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-20% 0px -79% 0px" }
    );

    const sections = ["hero", "add-report", "reports", "faq"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    sections.forEach((s) => s && observer.observe(s));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      sections.forEach((s) => s && observer.unobserve(s));
    };
  }, []);

  const navLinks = [
    { label: "Beranda", href: "/#hero" },
    { label: "Lapor", href: "/#add-report" },
    { label: "Laporan Terbaru", href: "/#reports" },
    { label: "FAQ", href: "/#faq" },
  ];

  const openModal = (tab: "login" | "register") => {
    setIsMenuOpen(false);
    if (pathname !== "/") {
      router.push(`/?modal=${tab}`);
    } else {
      router.push(`/?modal=${tab}`, { scroll: false });
    }
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    setDropdownOpen(false);
    await logoutAction();
  };

  return (
    <>
      {/* ── Desktop Navbar — floating pill, lebih lebar ── */}
      <nav className="fixed top-5 left-0 right-0 z-50 hidden md:flex justify-center pointer-events-none">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">

        <div
          className={`pointer-events-auto flex items-center justify-evenly gap-1 px-5 py-2.5 rounded-2xl border transition-all duration-300 ${
            scrolled
              ? "bg-navy/85 backdrop-blur-xl border-white/10 shadow-2xl shadow-navy/50"
              : "bg-navy/70 backdrop-blur-lg border-white/10"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 pr-5 mr-2 border-r border-white/10 shrink-0">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden shadow-md shadow-blue/40">
              <Image
                src="/images/logo.png"
                alt="Laporin Aja Bro Logo"
                fill
                sizes="28px"
                className="object-cover"
                priority
              />
            </div>
            <span className="text-white font-bold text-sm whitespace-nowrap">
              Laporin Aja Bro
            </span>
          </Link>

          {/* Nav Links — gap lebih lapang */}
          <div className="flex items-center gap-1 px-2">
            {navLinks.map((link) => {
              const isActive = pathname === "/" && activeHash === link.href.replace("/", "");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium text-sm px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "text-orange bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/8"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 mx-2 shrink-0" />

          {/* CTA */}
          {!initialProfile ? (
            <div className="flex items-center gap-2 pl-1">
              <button
                id="navbar-login-btn"
                onClick={() => openModal("login")}
                className="text-white/75 hover:text-white font-medium text-sm px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 whitespace-nowrap"
              >
                Masuk
              </button>
              <button
                id="navbar-register-btn"
                onClick={() => openModal("register")}
                className="bg-orange hover:bg-orange-hover text-white font-semibold text-sm px-5 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange/30 whitespace-nowrap"
              >
                Daftar
              </button>
            </div>
          ) : (
            <div className="relative pl-1">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 focus:outline-none px-2 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-blue/20 border-2 border-white/20 overflow-hidden relative shrink-0">
                  {initialProfile.avatar_url ? (
                    <Image src={initialProfile.avatar_url} alt="Avatar" fill sizes="28px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/80 bg-navy font-bold text-xs">
                      {initialProfile.full_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <span className="text-white/85 text-sm font-medium max-w-[90px] truncate">
                  {initialProfile.full_name?.split(" ")[0] || "Akun"}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 shrink-0 ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-navy/20 border border-white/60 overflow-hidden py-1.5">
                  <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy hover:bg-navy/5 transition-colors" onClick={() => setDropdownOpen(false)}>
                    <svg className="w-4 h-4 text-navy/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profil Saya
                  </Link>
                  <Link href="/dashboard/reports" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy hover:bg-navy/5 transition-colors" onClick={() => setDropdownOpen(false)}>
                    <svg className="w-4 h-4 text-navy/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Laporan Saya
                  </Link>
                  <div className="border-t border-navy/8 my-1" />
                  <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red hover:bg-red/5 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </nav>

      {/* ── Mobile Navbar — floating pill juga ── */}
      <nav className="fixed top-4 left-4 right-4 z-50 md:hidden">
        <div className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
          scrolled
            ? "bg-navy/90 backdrop-blur-xl border-white/10 shadow-2xl shadow-navy/40"
            : "bg-navy/75 backdrop-blur-lg border-white/10"
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden shadow-md shadow-blue/40">
              <Image src="/images/logo.png" alt="Laporin Aja Bro Logo" fill sizes="28px" className="object-cover" priority />
            </div>
            <span className="text-white font-bold text-sm">Laporin Aja Bro</span>
          </Link>

          {/* Kanan: avatar atau hamburger */}
          <div className="flex items-center gap-2">
            {initialProfile && (
              <div className="w-7 h-7 rounded-full bg-blue/20 border-2 border-white/20 overflow-hidden relative">
                {initialProfile.avatar_url ? (
                  <Image src={initialProfile.avatar_url} alt="Avatar" fill sizes="28px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/80 font-bold text-xs bg-navy">
                    {initialProfile.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col gap-1.5 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
              id="navbar-mobile-toggle"
            >
              <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`} />
              <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown — muncul di bawah pill */}
        <div className={`mt-2 overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className={`px-4 py-3 flex flex-col gap-1 rounded-2xl border border-white/10 ${
            scrolled ? "bg-navy/90 backdrop-blur-xl" : "bg-navy/80 backdrop-blur-lg"
          }`}>
            {navLinks.map((link) => {
              const isActive = pathname === "/" && activeHash === link.href.replace("/", "");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-medium text-sm px-4 py-2.5 rounded-xl transition-colors ${
                    isActive ? "text-orange bg-white/10" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="flex gap-2.5 pt-2 mt-1 border-t border-white/10">
              {!initialProfile ? (
                <>
                  <button
                    id="navbar-mobile-login"
                    onClick={() => openModal("login")}
                    className="flex-1 text-center text-white/85 hover:text-white font-medium text-sm py-2.5 rounded-xl border border-white/20 hover:bg-white/10 transition-colors"
                  >
                    Masuk
                  </button>
                  <button
                    id="navbar-mobile-register"
                    onClick={() => openModal("register")}
                    className="flex-1 text-center bg-orange hover:bg-orange-hover text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
                  >
                    Daftar
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-1.5 w-full">
                  <Link href="/dashboard/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 font-medium text-sm px-4 py-2.5 rounded-xl transition-colors">
                    <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profil Saya
                  </Link>
                  <Link href="/dashboard/reports" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 font-medium text-sm px-4 py-2.5 rounded-xl transition-colors">
                    <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Laporan Saya
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 hover:text-red-400 font-medium text-sm px-4 py-2.5 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-colors mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}