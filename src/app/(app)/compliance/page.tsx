import { Suspense } from "react";

import { ComplianceManager } from "@/components/features/compliance/ComplianceManager";
import { env } from "@/config/env";
import { getCompliance } from "@/features/compliance/server/get-compliance";
import { withTimeout } from "@/lib/fetch-with-timeout";

async function ComplianceData() {
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  let records;
  let hasError = false;

  try {
    records = await withTimeout(getCompliance(orgId));
  } catch {
    hasError = true;
  }

  if (!hasError && records) {
    return <ComplianceManager orgId={orgId} initialRecords={records} />;
  }

  return (
    <>
      <DataUnavailableBanner />
      <ComplianceManager orgId={orgId} initialRecords={[]} />
    </>
  );
}

export default function CompliancePage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Governance
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Compliance</h2>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <ComplianceData />
      </Suspense>
    </section>
  );
}

function DataUnavailableBanner() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Could not load data — Supabase may be unavailable. Check your .env and project status.
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex gap-3">
        <div className="h-9 w-40 rounded-full bg-slate-200" />
        <div className="h-9 w-24 rounded-full bg-slate-200" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 rounded-xl border border-slate-100 bg-slate-100/60" />
      ))}
    </div>
  );
}
