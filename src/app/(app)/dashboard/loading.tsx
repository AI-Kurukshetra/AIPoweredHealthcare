export default function DashboardLoading() {
  return (
    <section className="space-y-5">
      <div>
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-8 w-72 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="h-4 w-96 animate-pulse rounded bg-slate-200" />
      <div className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100/60" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100/60"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border border-slate-200 bg-slate-100/60"
          />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-xl border border-slate-200 bg-slate-100/60" />
    </section>
  );
}
