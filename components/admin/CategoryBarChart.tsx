"use client";
// components/admin/CategoryBarChart.tsx

const COLORS = [
  "#06b6d4", // cyan
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#6366f1", // indigo
];

interface Props {
  data: { name: string; count: number }[];
}

export default function CategoryBarChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.count), 1);

  // Kelompokkan "lainnya" jika lebih dari 5 kategori
  const top = data.slice(0, 5);
  const rest = data.slice(5);
  const lainnya = rest.reduce((sum, d) => sum + d.count, 0);
  const display = lainnya > 0 ? [...top, { name: "Lainnya", count: lainnya }] : top;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <h3 className="text-navy font-bold text-sm mb-5">Laporan per Kategori</h3>
      {display.length === 0 ? (
        <p className="text-navy/40 text-sm text-center py-8">Belum ada data kategori</p>
      ) : (
        <div className="space-y-3">
          {display.map((item, i) => (
            <div key={item.name} className="flex items-center gap-3">
              <p className="text-xs text-navy/70 font-medium w-32 shrink-0 truncate">{item.name}</p>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.count / max) * 100}%`,
                    backgroundColor: COLORS[i % COLORS.length],
                  }}
                />
              </div>
              <p className="text-xs font-bold text-navy/60 w-5 text-right shrink-0">{item.count}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}