type StatsCardProps = {
  label: string;
  value: string | number;
  helper?: string;
};

export function StatsCard({ label, value, helper }: StatsCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </article>
  );
}
