type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
};

type ActivityFeedProps = {
  items: ActivityItem[];
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-950">Activity Feed</h3>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Live
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            <p className="mt-2 text-xs text-slate-500">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
