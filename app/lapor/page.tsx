
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/landing/Footer";
import LaporPageClient from "./LaporPageClient";

export default function LaporPage() {

  return (
    <main className="flex flex-col min-h-screen bg-[#0b0f1a]">
      <Navbar />

      <LaporPageClient/>

      <Footer />
    </main>
  );
}

