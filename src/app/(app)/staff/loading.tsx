export default function StaffLoading() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Staff</h2>
      <div className="animate-pulse rounded-lg border border-slate-200 bg-white p-6">
        <div className="h-4 w-48 rounded bg-slate-200" />
        <div className="mt-4 h-4 w-full rounded bg-slate-200" />
        <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
      </div>
    </section>
  );
}
