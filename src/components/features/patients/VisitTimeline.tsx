import type { PatientVisitItem } from "@/features/patients/types";

type VisitTimelineProps = {
  visits: PatientVisitItem[];
};

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

export function VisitTimeline({ visits }: VisitTimelineProps) {
  if (!visits.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        No visits found for this patient.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      <table className="min-w-[760px] text-left text-sm">
        <thead className="bg-slate-100/70">
          <tr>
            <th className="px-4 py-3 font-semibold tracking-wide text-slate-700">Visit ID</th>
            <th className="px-4 py-3 font-semibold tracking-wide text-slate-700">Status</th>
            <th className="px-4 py-3 font-semibold tracking-wide text-slate-700">Staff</th>
            <th className="px-4 py-3 font-semibold tracking-wide text-slate-700">Started</th>
            <th className="px-4 py-3 font-semibold tracking-wide text-slate-700">Completed</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit) => (
            <tr
              key={visit.id}
              className="border-t border-slate-100/80 transition hover:bg-slate-50/80"
            >
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{visit.id}</td>
              <td className="px-4 py-3 capitalize text-slate-900">
                {visit.status.replace("_", " ")}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">
                {visit.assignedStaffId ?? "Unassigned"}
              </td>
              <td className="px-4 py-3 text-slate-700">{formatDate(visit.startedAt)}</td>
              <td className="px-4 py-3 text-slate-700">{formatDate(visit.completedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
