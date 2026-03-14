import { EmptyState } from "@/components/shared/EmptyState";
import type { VisitListItem } from "@/features/visits/types";

type VisitTableProps = {
  visits: VisitListItem[];
};

export function VisitTable({ visits }: VisitTableProps) {
  if (!visits.length) {
    return (
      <EmptyState
        title="No visits yet"
        description="Visits will appear once appointments are documented by the care team."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700">Visit ID</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Patient ID</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit) => (
            <tr key={visit.id} className="border-t border-slate-100">
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{visit.id}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{visit.patientId}</td>
              <td className="px-4 py-3 capitalize text-slate-900">{visit.status.replace("_", " ")}</td>
              <td className="px-4 py-3 text-slate-700">
                {new Date(visit.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
