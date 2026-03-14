import type { BillingRecordListItem } from "@/features/billing/types";

type PaymentStatusProps = {
  records: BillingRecordListItem[];
};

export function PaymentStatus({ records }: PaymentStatusProps) {
  const totals = records.reduce(
    (acc, record) => {
      acc.total += 1;
      if (record.status === "pending") acc.pending += 1;
      if (record.status === "submitted") acc.submitted += 1;
      if (record.status === "paid") acc.paid += 1;
      if (record.status === "denied") acc.denied += 1;
      return acc;
    },
    { total: 0, pending: 0, submitted: 0, paid: 0, denied: 0 }
  );

  return (
    <section className="grid gap-3 sm:grid-cols-5">
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{totals.total}</p>
      </article>
      <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pending</p>
        <p className="mt-2 text-2xl font-semibold text-amber-950">{totals.pending}</p>
      </article>
      <article className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Submitted</p>
        <p className="mt-2 text-2xl font-semibold text-cyan-950">{totals.submitted}</p>
      </article>
      <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Paid</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-950">{totals.paid}</p>
      </article>
      <article className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Denied</p>
        <p className="mt-2 text-2xl font-semibold text-rose-950">{totals.denied}</p>
      </article>
    </section>
  );
}
