import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Laporin Aja Bro – Platform Laporan Publik",
  description:
    "Laporkan masalah di sekitar Anda dengan mudah dan cepat. Platform pelaporan publik berbasis AI yang aman, anonim, dan transparan.",
  keywords: ["laporan publik", "pelaporan masyarakat", "laporin aja bro"],
  openGraph: {
    title: "Laporin Aja Bro",
    description: "Platform laporan publik berbasis AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-screen antialiased bg-bg text-navy">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "bg-navy border border-blue/30 text-white rounded-xl shadow-2xl backdrop-blur-md",
            descriptionClassName: "text-white/70",
          }}
        />
      </body>
    </html>
  );
}
