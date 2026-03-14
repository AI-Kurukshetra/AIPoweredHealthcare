import type { VisitListItem, VisitNoteItem } from "@/features/visits/types";

type VisitDetailsProps = {
  visit: VisitListItem;
  patientName: string;
  staffName: string;
  notes: VisitNoteItem[];
};

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

export function VisitDetails({ visit, patientName, staffName, notes }: VisitDetailsProps) {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Visit Details
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">Visit {visit.id}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Patient</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{patientName}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Staff</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{staffName}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
            <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
              {visit.status.replace("_", " ")}
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Created
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatDate(visit.createdAt)}
            </p>
          </article>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Started</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatDate(visit.startedAt)}
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Completed
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatDate(visit.completedAt)}
            </p>
          </article>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
        <h3 className="text-lg font-semibold text-slate-950">Clinical Notes</h3>
        {!notes.length ? (
          <p className="mt-3 text-sm text-slate-600">
            No notes logged yet for this visit.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <p className="text-sm text-slate-900">{note.note}</p>
                {note.vitals ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Vitals:{" "}
                    {Object.entries(note.vitals)
                      .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
                      .join(", ")}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-slate-500">
                  Logged {new Date(note.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
