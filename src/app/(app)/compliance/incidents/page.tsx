import { Suspense } from "react";

import { ComplianceIncidentsManager } from "@/components/features/compliance/ComplianceIncidentsManager";
import { env } from "@/config/env";
import { getIncidents } from "@/features/incidents/server/get-incidents";
import { withTimeout } from "@/lib/fetch-with-timeout";

async function ComplianceIncidentsData() {
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  let complianceIncidents: Awaited<ReturnType<typeof getIncidents>> = [];
  let hasError = false;

  try {
    const incidents = await withTimeout(getIncidents(orgId));
    complianceIncidents = incidents.filter(
      (incident) => incident.status !== "resolved"
    );
  } catch {
    hasError = true;
  }

  if (!hasError) {
    return (
      <ComplianceIncidentsManager orgId={orgId} initialIncidents={complianceIncidents} />
    );
  }

  return (
    <>
      <DataUnavailableBanner />
      <ComplianceIncidentsManager orgId={orgId} initialIncidents={[]} />
    </>
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

export default function ComplianceIncidentsPage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Governance
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Compliance Incidents</h2>
      </div>
      <p className="text-sm text-slate-600">
        Open and pending operational incidents requiring compliance review.
      </p>
      <Suspense fallback={<TableSkeleton />}>
        <ComplianceIncidentsData />
      </Suspense>
    </section>
  );
}
