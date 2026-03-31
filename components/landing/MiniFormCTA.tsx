"use client";

import { useRouter } from "next/navigation";
import LaporForm from "@/components/reports/LaporForm";

export default function MiniFormCTA() {
  const router = useRouter();

  const handleOpenAuthModal = (tab?: "login" | "register") => {
    // AuthModalController reads ?modal=... to open the modal
    const url = new URL(window.location.href);
    url.searchParams.set("modal", tab || "login");
    router.push(url.toString(), { scroll: false });
  };

  return (
    <section id="add-report" className="py-16 bg-bg relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-blue/20 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-blue/20 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="section-label">⚡ Laporan Cepat</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-3">
            Ada masalah? Laporkan sekarang
          </h2>
          <p className="text-navy/55 text-sm">
            Isi detail laporan Anda di bawah ini—kami akan memproses dan meneruskannya ke instansi terkait.
          </p>
        </div>

        {/* Lapor Form Container (Dark Style inside Light BG) */}
        <div className="bg-[#0b0f1a] rounded-4xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-navy/10">
          {/* Decorative glows inside the dark card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <LaporForm onOpenAuthModal={handleOpenAuthModal} />
          </div>
        </div>
      </div>
    </section>
  );
}
