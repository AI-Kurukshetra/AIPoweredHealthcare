export default function PatientDetailLoading() {
  return (
    <section className="space-y-6">
      <div className="flex justify-end">
        <div className="h-9 w-32 animate-pulse rounded-md bg-slate-200" />
      </div>
      <div className="space-y-4">
        <div className="h-32 rounded-2xl border border-slate-200 bg-slate-100/60" />
        <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100/60" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="h-64 rounded-2xl border border-slate-200 bg-slate-100/60" />
        <div className="h-64 rounded-2xl border border-slate-200 bg-slate-100/60" />
      </div>
      <div className="space-y-3">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-32 rounded-2xl border border-slate-200 bg-slate-100/60" />
      </div>
    </section>
  );
}
