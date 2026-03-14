import Link from "next/link";

import { EmptyState } from "@/components/shared/EmptyState";
import type { VisitListItem } from "@/features/visits/types";

type VisitTableProps = {
  visits: VisitListItem[];
  patientNames?: Record<string, string>;
  staffNames?: Record<string, string>;
};

function formatStatus(value: string) {
  return value.replace("_", " ");
}

export function VisitTable({ visits, patientNames = {}, staffNames = {} }: VisitTableProps) {
  if (!visits.length) {
    return (
      <EmptyState
        title="No visits yet"
        description="Visits will appear once appointments are documented by the care team."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      <table className="min-w-[680px] text-left text-sm">
        <thead className="bg-slate-100/70">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700">Visit</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Patient</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Assigned Staff</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Timeline</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit) => (
            <tr key={visit.id} className="border-t border-slate-100/80 transition hover:bg-slate-50/80">
              <td className="px-4 py-3">
                <Link
                  href={`/visits/${visit.id}`}
                  className="font-mono text-xs text-cyan-700 hover:text-cyan-800"
                >
                  {visit.id}
                </Link>
                <p className="mt-1 text-xs text-slate-500">
                  Created {new Date(visit.createdAt).toLocaleString()}
                </p>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/patients/${visit.patientId}`}
                  className="font-medium text-slate-900 hover:text-cyan-700"
                >
                  {patientNames[visit.patientId] ?? "Unknown patient"}
                </Link>
                <p className="mt-1 font-mono text-xs text-slate-500">{visit.patientId}</p>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">
                  {visit.assignedStaffId
                    ? staffNames[visit.assignedStaffId] ?? "Assigned clinician"
                    : "Unassigned"}
                </p>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {visit.assignedStaffId ?? "No staff linked"}
                </p>
              </td>
              <td className="px-4 py-3 capitalize text-slate-900">{formatStatus(visit.status)}</td>
              <td className="px-4 py-3 text-slate-700">
                <p>{visit.startedAt ? `Started ${new Date(visit.startedAt).toLocaleString()}` : "Not started"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {visit.completedAt
                    ? `Completed ${new Date(visit.completedAt).toLocaleString()}`
                    : "Awaiting completion"}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
