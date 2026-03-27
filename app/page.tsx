import { Suspense } from "react";
import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/landing/Hero";
import MiniFormCTA from "@/components/landing/MiniFormCTA";
import LatestReports from "@/components/landing/LatestReports";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import AuthModalController from "@/components/auth/AuthModalController";
import FloatingLaporButton from "@/components/ui/FloatingLaporButton";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Navbar />
      <Suspense fallback={null}>
        <AuthModalController />
      </Suspense>
      <Hero />
      <MiniFormCTA />
      <LatestReports />
      <FAQ />
      <Footer />
      <FloatingLaporButton />
    </main>
  );
}
