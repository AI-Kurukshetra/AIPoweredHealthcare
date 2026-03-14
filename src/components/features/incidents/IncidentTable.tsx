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
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700">Title</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Severity</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Occurred</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id} className="border-t border-slate-100">
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
