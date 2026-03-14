import { EmptyState } from "@/components/shared/EmptyState";
import type { BillingRecordListItem } from "@/features/billing/types";

type BillingTableProps = {
  records: BillingRecordListItem[];
};

function formatCents(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}

export function BillingTable({ records }: BillingTableProps) {
  if (!records.length) {
    return (
      <EmptyState
        title="No billing records yet"
        description="Billable services and claims-ready entries will appear here."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      <table className="min-w-[720px] text-left text-sm">
        <thead className="bg-slate-100/70">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700">CPT/ICD-10</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Units</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Amount</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              className="border-t border-slate-100/80 transition hover:bg-slate-50/80"
            >
              <td className="px-4 py-3 text-slate-900">
                {record.cptCode}
                {record.icd10Code ? ` / ${record.icd10Code}` : ""}
              </td>
              <td className="px-4 py-3 text-slate-700">{record.units}</td>
              <td className="px-4 py-3 text-slate-700">{formatCents(record.amountCents)}</td>
              <td className="px-4 py-3 capitalize text-slate-700">{record.status}</td>
              <td className="px-4 py-3 text-slate-700">
                {new Date(record.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
