import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buat Laporan – Laporin Aja Bro",
  description:
    "Laporkan masalah infrastruktur, lingkungan, atau layanan publik di Yogyakarta. AI kami akan menganalisis dan meneruskan laporan ke instansi yang tepat.",
};

export default function LaporLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
