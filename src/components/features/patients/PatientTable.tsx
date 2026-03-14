import Link from "next/link";

import { EmptyState } from "@/components/shared/EmptyState";
import type { PatientListItem } from "@/features/patients/types";

type PatientTableProps = {
  patients: PatientListItem[];
};

export function PatientTable({ patients }: PatientTableProps) {
  if (!patients.length) {
    return (
      <EmptyState
        title="No patients yet"
        description="Patients will appear here once they are assigned to your organization."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      <table className="min-w-[640px] text-left text-sm">
        <thead className="bg-slate-100/70">
          <tr>
            <th className="px-4 py-3 font-semibold tracking-wide text-slate-700">Name</th>
            <th className="px-4 py-3 font-semibold tracking-wide text-slate-700">Status</th>
            <th className="px-4 py-3 font-semibold tracking-wide text-slate-700">ID</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr
              key={patient.id}
              className="border-t border-slate-100/80 transition hover:bg-slate-50/80"
            >
              <td className="px-4 py-3 text-slate-900">
                <Link
                  href={`/patients/${patient.id}`}
                  className="font-medium text-slate-900 hover:text-cyan-700"
                >
                  {patient.firstName} {patient.lastName}
                </Link>
              </td>
              <td className="px-4 py-3 capitalize text-slate-700">{patient.careStatus}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">{patient.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
