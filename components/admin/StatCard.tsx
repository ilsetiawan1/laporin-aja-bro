// components/admin/StatCard.tsx

type ColorVariant = "blue" | "orange" | "green" | "red";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: ColorVariant;
}

const VARIANT_STYLES: Record<ColorVariant, { bg: string; icon: string; text: string }> = {
  blue:   { bg: "bg-blue/8",   icon: "bg-blue/15 text-blue",     text: "text-blue" },
  orange: { bg: "bg-orange/8", icon: "bg-orange/15 text-orange",  text: "text-orange" },
  green:  { bg: "bg-green-50", icon: "bg-green-100 text-green-600", text: "text-green-600" },
  red:    { bg: "bg-red/8",    icon: "bg-red/15 text-red",        text: "text-red" },
};

export default function StatCard({ label, value, icon, variant = "blue" }: StatCardProps) {
  const s = VARIANT_STYLES[variant];
  return (
    <div className={`rounded-2xl p-5 border border-slate-100 ${s.bg} flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.icon}`}>
        {icon}
      </div>
      <div>
        <p className="text-navy/50 text-xs font-medium">{label}</p>
        <p className={`text-2xl font-extrabold mt-0.5 ${s.text}`}>{value.toLocaleString("id-ID")}</p>
      </div>
    </div>
  );
}