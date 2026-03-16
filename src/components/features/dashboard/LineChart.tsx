type LineChartProps = {
  title: string;
  subtitle: string;
  data?: number[];
};

function buildPolylinePoints(data: number[], width: number, height: number): string {
  if (!data.length) return "0,0";
  const max = Math.max(...data, 1);
  const padding = 8;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const step = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

  return data
    .map((val, i) => {
      const x = padding + i * step;
      const y = height - padding - (val / max) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");
}

export function LineChart({ title, subtitle, data }: LineChartProps) {
  const chartData = data && data.length > 0 ? data : [0, 20, 15, 30, 25, 40, 35];
  const points = buildPolylinePoints(chartData, 240, 80);
  const dayCount = chartData.length;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
          Last {dayCount} days
        </span>
      </div>
      <div className="mt-4 h-40 rounded-xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
        <svg viewBox="0 0 240 80" className="h-full w-full text-cyan-500/70">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
    </div>
  );
}
