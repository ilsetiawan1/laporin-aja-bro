import { Suspense } from "react";
import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/landing/Hero";
import MiniFormCTA from "@/components/landing/MiniFormCTA";
import LatestReports from "@/components/landing/LatestReports";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import AuthModalController from "@/components/auth/AuthModalController";
import FloatingLaporButton from "@/components/ui/FloatingLaporButton";
import { getCategories, getCities } from "@/lib/repositories/locationRepository";

function LatestReportsSkeleton() {
  return (
    <section id="reports" className="py-20 md:py-28 bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-10 w-64 bg-slate-200 rounded-xl mb-10 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-100 h-72 animate-pulse"
            >
              <div className="h-4 w-20 bg-slate-100 rounded-full mb-3" />
              <div className="h-32 w-full bg-slate-100 rounded-xl mb-3" />
              <div className="h-4 w-full bg-slate-100 rounded-full mb-2" />
              <div className="h-4 w-2/3 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const [categories, cities] = await Promise.all([
    getCategories(),
    getCities(),
  ]);

  return (
    <main className="flex flex-col">
      <Navbar />
      <Suspense fallback={null}>
        <AuthModalController />
      </Suspense>
      <Hero />
      <MiniFormCTA initialCategories={categories} initialCities={cities} />
      <Suspense fallback={<LatestReportsSkeleton />}>
        <LatestReports initialCategories={categories} initialCities={cities} />
      </Suspense>
      <FAQ />
      <Footer />
      <FloatingLaporButton />
    </main>
  );
}
