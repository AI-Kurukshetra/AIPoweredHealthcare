import { EmptyState } from "@/components/shared/EmptyState";
import type { IncidentListItem } from "@/features/incidents/types";

type IncidentTableProps = {
  incidents: IncidentListItem[];
};

function severityLabel(severity: IncidentListItem["severity"]) {
  if (severity === "1") return "Critical";
  if (severity === "2") return "Serious";
  if (severity === "3") return "Moderate";
  if (severity === "4") return "Low";
  return "Minor";
}

export function IncidentTable({ incidents }: IncidentTableProps) {
  if (!incidents.length) {
    return (
      <EmptyState
        title="No incidents logged"
        description="Operational safety incidents will appear here for coordinator review."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      <table className="min-w-[680px] text-left text-sm">
        <thead className="bg-slate-100/70">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700">Title</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Severity</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Occurred</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr
              key={incident.id}
              className="border-t border-slate-100/80 transition hover:bg-slate-50/80"
            >
              <td className="px-4 py-3 text-slate-900">{incident.title}</td>
              <td className="px-4 py-3 text-slate-700">S{incident.severity} - {severityLabel(incident.severity)}</td>
              <td className="px-4 py-3 capitalize text-slate-700">{incident.status}</td>
              <td className="px-4 py-3 text-slate-700">
                {new Date(incident.occurredAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
