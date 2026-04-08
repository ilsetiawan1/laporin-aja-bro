// components/admin/DashboardStatCards.tsx

interface StatCardProps {
  label: string;
  value: number;
  sub: string;
  color: "blue" | "orange" | "purple" | "green";
}

const COLOR_MAP = {
  blue:   { bg: "bg-blue/5",   text: "text-blue",       sub: "text-blue/60"   },
  orange: { bg: "bg-orange/5", text: "text-orange",     sub: "text-orange/60" },
  purple: { bg: "bg-purple-500/5", text: "text-purple-600", sub: "text-purple-400" },
  green:  { bg: "bg-green-500/5", text: "text-green-600",  sub: "text-green-500/70" },
};

function StatCard({ label, value, sub, color }: StatCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={`${c.bg} rounded-2xl p-5 flex flex-col gap-1`}>
      <p className="text-navy/40 text-xs font-bold uppercase tracking-widest">{label}</p>
      <p className={`text-4xl font-extrabold ${c.text}`}>{value}</p>
      <p className={`text-xs font-medium ${c.sub}`}>{sub}</p>
    </div>
  );
}

interface Props {
  total: number;
  pending: number;
  diproses: number;
  selesai: number;
}

export default function DashboardStatCards({ total, pending, diproses, selesai }: Props) {
  const selesaiPct = total > 0 ? Math.round((selesai / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Laporan" value={total}    sub="Semua waktu"        color="blue"   />
      <StatCard label="Menunggu"      value={pending}  sub="Perlu tindakan"     color="orange" />
      <StatCard label="Diproses"      value={diproses} sub="Sedang berjalan"    color="purple" />
      <StatCard label="Selesai"       value={selesai}  sub={`${selesaiPct}% selesai`} color="green" />
    </div>
  );
}