type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200/80 bg-white/70 p-8 text-center shadow-[0_16px_40px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">No results</p>
      <h3 className="mt-3 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
