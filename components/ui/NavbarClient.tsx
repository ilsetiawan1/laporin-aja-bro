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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Beranda", href: "/#hero" },
    { label: "Lapor", href: "/#lapor" },
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy/95 backdrop-blur-md shadow-lg shadow-navy/20"
          : "bg-navy"
      } border-b border-white/10`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-blue/30">
              <Image
                src="/images/logo.png"
                alt="Laporin Aja Bro Logo"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority
              />
            </div>
            <span className="text-white font-bold text-base md:text-lg leading-tight hidden sm:block">
              Laporin Aja Bro
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/75 hover:text-white font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!initialProfile ? (
              <>
                <button
                  id="navbar-login-btn"
                  onClick={() => openModal("login")}
                  className="text-white/85 hover:text-white font-medium text-sm px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  Masuk
                </button>
                <button
                  id="navbar-register-btn"
                  onClick={() => openModal("register")}
                  className="bg-orange hover:bg-orange-hover text-white font-semibold text-sm px-5 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange/30 hover:-translate-y-0.5"
                >
                  Daftar
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-hidden"
                >
                  <div className="w-10 h-10 rounded-full bg-blue/20 border-2 border-white/20 overflow-hidden relative">
                    {initialProfile.avatar_url ? (
                      <Image src={initialProfile.avatar_url} alt="Avatar" fill sizes="40px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50 bg-navy font-bold">
                         {initialProfile.full_name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden z-50 py-1 transition-all">
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-navy hover:bg-navy/5 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profil Saya
                    </Link>
                    <Link
                      href="/dashboard/reports"
                      className="block px-4 py-2 text-sm text-navy hover:bg-navy/5 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Laporan Saya
                    </Link>
                    <div className="border-t border-navy/10 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red hover:bg-red/5 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
            id="navbar-mobile-toggle"
          >
            <span
              className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden border-t border-white/10 bg-navy overflow-hidden transition-all duration-300 ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 font-medium text-sm px-3 py-2.5 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-3 mt-2 border-t border-white/15">
            {!initialProfile ? (
              <>
                <button
                  id="navbar-mobile-login"
                  onClick={() => openModal("login")}
                  className="flex-1 text-center text-white/90 hover:text-white font-medium text-sm py-2.5 rounded-xl border border-white/30 hover:bg-white/10 transition-colors"
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
              <div className="flex flex-col gap-2 w-full">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center text-white/80 hover:text-white hover:bg-white/10 font-medium text-sm py-2 rounded-lg transition-colors"
                >
                  Profil Saya
                </Link>
                <Link
                  href="/dashboard/reports"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center text-white/80 hover:text-white hover:bg-white/10 font-medium text-sm py-2 rounded-lg transition-colors"
                >
                  Laporan Saya
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center text-red-300 hover:text-red-400 font-medium text-sm py-2.5 rounded-xl border border-red-500/30 hover:bg-red-500/10 transition-colors mt-2"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
