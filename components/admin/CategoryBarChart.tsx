// components/admin/CategoryBarChart.tsx

interface Props {
  data: Array<{ name: string; count: number }>;
}

export default function CategoryBarChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 h-full">
      <h3 className="text-navy font-bold text-sm mb-4">Laporan per Kategori</h3>
      {data.length === 0 ? (
        <p className="text-navy/40 text-sm text-center py-8">Belum ada data</p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-navy/70 text-xs font-medium truncate max-w-[60%]">
                  {item.name}
                </span>
                <span className="text-navy font-bold text-xs">{item.count}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}