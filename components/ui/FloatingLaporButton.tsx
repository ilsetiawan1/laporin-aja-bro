"use client";

import { useEffect, useState } from "react";

export default function FloatingLaporButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let threshold = 1000;
    let ticking = false;

    const updateThreshold = () => {
      const laporSection = document.getElementById("add-report");
      if (laporSection) {
        threshold = laporSection.offsetTop + laporSection.offsetHeight - 100;
      } else {
        threshold = 1000;
      }
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setIsVisible(window.scrollY > threshold);
        ticking = false;
      });
    };

    updateThreshold();
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateThreshold, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateThreshold);
    };
  }, []);

  const scrollToLapor = () => {
    document.getElementById("add-report")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToLapor}
      aria-label="Lapor Cepat"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={`fixed bottom-6 left-6 z-40 bg-[#c2410c] hover:bg-[#9a3412] text-white rounded-full p-4 shadow-xl shadow-orange-900/30 group border-2 border-orange-800/40 backdrop-blur-sm transition-all duration-300 ease-out cursor-pointer ${
        isVisible
          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
          : "opacity-0 scale-75 translate-y-8 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-6 h-6 group-hover:scale-110 transition-transform"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span className="font-bold tracking-wider uppercase text-sm pr-1">
          Lapor
        </span>
      </div>
    </button>
  );
}
