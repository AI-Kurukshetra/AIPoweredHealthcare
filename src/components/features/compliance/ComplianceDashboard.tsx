import type { ComplianceListItem } from "@/features/compliance/types";

type ComplianceDashboardProps = {
  records: ComplianceListItem[];
};

export function ComplianceDashboard({ records }: ComplianceDashboardProps) {
  const totals = records.reduce(
    (acc, record) => {
      acc.total += 1;
      if (record.status === "compliant") acc.compliant += 1;
      if (record.status === "attention_required") acc.attention += 1;
      if (record.status === "review_pending") acc.pending += 1;
      return acc;
    },
    { total: 0, compliant: 0, attention: 0, pending: 0 }
  );

  return (
    <section className="grid gap-3 sm:grid-cols-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{totals.total}</p>
      </article>
      <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Compliant
        </p>
        <p className="mt-2 text-2xl font-semibold text-emerald-950">{totals.compliant}</p>
      </article>
      <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Attention
        </p>
        <p className="mt-2 text-2xl font-semibold text-amber-950">{totals.attention}</p>
      </article>
      <article className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
          Review Pending
        </p>
        <p className="mt-2 text-2xl font-semibold text-cyan-950">{totals.pending}</p>
      </article>
    </section>
  );
}
