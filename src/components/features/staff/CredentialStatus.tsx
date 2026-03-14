import type { CredentialListItem } from "@/features/credentials/types";

type CredentialStatusProps = {
  credentials: CredentialListItem[];
};

export function CredentialStatus({ credentials }: CredentialStatusProps) {
  const totals = credentials.reduce(
    (acc, credential) => {
      acc.total += 1;
      if (credential.status === "expired") acc.expired += 1;
      if (credential.status === "expiring_soon") acc.expiring += 1;
      if (credential.status === "active") acc.active += 1;
      return acc;
    },
    { total: 0, active: 0, expiring: 0, expired: 0 }
  );

  return (
    <section className="grid gap-3 sm:grid-cols-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Total Credentials
        </p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{totals.total}</p>
      </article>
      <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Active</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-950">{totals.active}</p>
      </article>
      <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Expiring Soon
        </p>
        <p className="mt-2 text-2xl font-semibold text-amber-950">{totals.expiring}</p>
      </article>
      <article className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Expired</p>
        <p className="mt-2 text-2xl font-semibold text-rose-950">{totals.expired}</p>
      </article>
    </section>
  );
}
