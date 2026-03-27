"use client";

import { useScroll, useMotionValueEvent, AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function FloatingLaporButton() {
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Cari elemen form pelaporan
    const laporSection = document.getElementById("lapor");
    // Default threshold tinggi (kurang lebih Hero + Form)
    let threshold = 1000;
    
    if (laporSection) {
      // Munculkan button setelah user melewati batas bawah dari area lapor
      threshold = laporSection.offsetTop + laporSection.offsetHeight - 100;
    }

    if (latest > threshold) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  });

  const scrollToLapor = () => {
    document.getElementById("lapor")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={scrollToLapor}
          className="fixed bottom-6 left-6 z-40 bg-orange hover:bg-orange-hover text-white rounded-full p-4 shadow-xl shadow-orange/30 group border-2 border-orange-hover/30 backdrop-blur-sm"
          aria-label="Lapor Cepat"
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6 group-hover:scale-110 transition-transform"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="font-bold tracking-wider uppercase text-sm pr-1">
              Lapor
            </span>
          </div>
          
          {/* Cyberpunk Glow effect */}
          <div className="absolute inset-0 rounded-full bg-orange blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
