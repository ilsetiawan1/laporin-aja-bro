"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "Beranda", href: "#hero" },
    { label: "Buat Laporan", href: "#report-form" },
    { label: "Fitur", href: "#features" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f21913]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/images/logo.png"
              alt="Laporin Aja Bro Logo"
              width={48}
              height={48}
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
              priority
            />
            <span className="text-white font-bold text-base md:text-lg leading-tight hidden sm:block">
              Laporin Aja Bro
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/85 hover:text-white font-medium text-sm transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#"
              className="text-white/90 hover:text-white font-medium text-sm transition-colors duration-200"
            >
              Masuk
            </a>
            <a
              href="#"
              className="bg-white text-[#f21913] font-semibold text-sm px-4 py-2 rounded-xl hover:bg-white/90 transition-all duration-200 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5"
            >
              Daftar
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
            id="navbar-mobile-toggle"
          >
            <span
              className={`w-5 h-0.5 bg-white rounded-full transition-all duration-200 ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`w-5 h-0.5 bg-white rounded-full transition-all duration-200 ${isMenuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`w-5 h-0.5 bg-white rounded-full transition-all duration-200 ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/15 bg-[#f21913]">
          <div className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-white/85 hover:text-white hover:bg-white/10 font-medium text-sm px-3 py-2.5 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2 mt-1 border-t border-white/15">
              <a
                href="#"
                className="flex-1 text-center text-white/90 hover:text-white font-medium text-sm py-2.5 rounded-xl border border-white/30 hover:bg-white/10 transition-colors"
              >
                Masuk
              </a>
              <a
                href="#"
                className="flex-1 text-center bg-white text-[#f21913] font-semibold text-sm py-2.5 rounded-xl hover:bg-white/90 transition-colors"
              >
                Daftar
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
