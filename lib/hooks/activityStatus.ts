// lib/constants/activityStatus.ts

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "Menunggu", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  diproses: { label: "Diproses", color: "text-blue-700",   bg: "bg-blue-50 border-blue-200"    },
  selesai:  { label: "Selesai",  color: "text-green-700",  bg: "bg-green-50 border-green-200"  },
  ditolak:  { label: "Ditolak",  color: "text-red-700",    bg: "bg-red-50 border-red-200"      },
};