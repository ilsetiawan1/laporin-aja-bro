"use client";

import { useState, useEffect } from "react";

export default function LiveStatusBadge({ initialStatus }: { initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const handleUpdate = (e: any) => setStatus(e.detail);
    window.addEventListener('statusUpdated', handleUpdate);
    return () => window.removeEventListener('statusUpdated', handleUpdate);
  }, []);

  const styles: any = {
    pending: "bg-yellow-100 text-yellow-700",
    diproses: "bg-blue-100 text-blue-700",
    selesai: "bg-green-100 text-green-700",
    ditolak: "bg-red-100 text-red-700",
  };

  const labels: any = {
    pending: "Menunggu",
    diproses: "Diproses",
    selesai: "Selesai",
    ditolak: "Ditolak",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
}