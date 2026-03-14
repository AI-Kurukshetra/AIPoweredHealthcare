import { EmptyState } from "@/components/shared/EmptyState";
import type { ComplianceListItem } from "@/features/compliance/types";

type ComplianceTableProps = {
  records: ComplianceListItem[];
};

export function ComplianceTable({ records }: ComplianceTableProps) {
  if (!records.length) {
    return (
      <EmptyState
        title="No compliance checks yet"
        description="Credential and compliance records will appear here."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100/70">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Staff</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Credential</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Checked</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              className="border-t border-slate-100/80 transition hover:bg-slate-50/80"
            >
              <td className="px-4 py-3 text-slate-900">{record.status}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">
                {record.staffId ?? "N/A"}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">
                {record.credentialId ?? "N/A"}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {new Date(record.checkedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
