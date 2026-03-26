import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
    <html lang="id" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
