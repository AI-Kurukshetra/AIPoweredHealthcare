type LineChartProps = {
  title: string;
  subtitle: string;
};

export function LineChart({ title, subtitle }: LineChartProps) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
          Last 30 days
        </span>
      </div>
      <div className="mt-4 h-40 rounded-xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
        <svg viewBox="0 0 240 80" className="h-full w-full text-cyan-500/70">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            points="0,60 40,45 80,50 120,30 160,35 200,20 240,25"
          />
        </svg>
      </div>
    </div>
  );
}
