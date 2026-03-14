import { Suspense } from "react";

import { VisitManager } from "@/components/features/visits/VisitManager";
import { env } from "@/config/env";
import { getPatients } from "@/features/patients/server/get-patients";
import { getStaff } from "@/features/staff/server/get-staff";
import { getVisits } from "@/features/visits/server/get-visits";
import { withTimeout } from "@/lib/fetch-with-timeout";

async function VisitsData() {
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  try {
    const [visits, patients, staff] = await withTimeout(
      Promise.all([getVisits(orgId), getPatients(orgId), getStaff(orgId)])
    );
    return (
      <VisitManager orgId={orgId} initialVisits={visits} patients={patients} staff={staff} />
    );
  } catch {
    return (
      <>
        <DataUnavailableBanner />
        <VisitManager orgId={orgId} initialVisits={[]} patients={[]} staff={[]} />
      </>
    );
  }
}

export default function VisitsPage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Field Operations
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Visits</h2>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <VisitsData />
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
