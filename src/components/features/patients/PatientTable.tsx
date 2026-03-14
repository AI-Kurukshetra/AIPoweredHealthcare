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
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700">Name</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-700">ID</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-900">
                {patient.firstName} {patient.lastName}
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
