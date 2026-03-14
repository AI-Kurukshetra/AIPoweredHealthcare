import type { PatientTimelineEvent } from "@/features/patients/types";

type CareTimelineProps = {
  events: PatientTimelineEvent[];
  actorLabels?: Record<string, string>;
};

function typeTone(type: PatientTimelineEvent["type"]) {
  switch (type) {
    case "appointment":
      return "border-cyan-200 bg-cyan-50 text-cyan-800";
    case "visit":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    default:
      return "border-amber-200 bg-amber-50 text-amber-800";
  }
}

export function CareTimeline({ events, actorLabels = {} }: CareTimelineProps) {
  if (!events.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        No timeline activity has been recorded for this patient yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Longitudinal History
          </p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950">Care Timeline</h3>
        </div>
        <p className="text-sm text-slate-500">{events.length} events</p>
      </div>
      <div className="mt-6 space-y-4">
        {events.map((event) => (
          <article key={`${event.type}-${event.id}`} className="relative pl-6">
            <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-cyan-500" />
            <span className="absolute left-[5px] top-5 h-[calc(100%+8px)] w-px bg-slate-200 last:hidden" />
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${typeTone(event.type)}`}>
                      {event.type}
                    </span>
                    {event.status ? (
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {event.status.replace("_", " ")}
                      </span>
                    ) : null}
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-slate-950">{event.title}</h4>
                </div>
                <p className="text-xs text-slate-500">
                  {new Date(event.occurredAt).toLocaleString()}
                </p>
              </div>
              <p className="mt-2 text-sm text-slate-700">{event.detail}</p>
              {event.actorId ? (
                <p className="mt-2 text-xs text-slate-500">
                  Actor: {actorLabels[event.actorId] ?? event.actorId}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
