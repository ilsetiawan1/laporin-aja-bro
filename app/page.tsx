import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ReportForm from "@/components/ReportForm";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Navbar />
      <Hero />
      <ReportForm />
      <Features />
      <Footer />
    </main>
  );
}
