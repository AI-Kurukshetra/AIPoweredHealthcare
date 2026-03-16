import { Suspense } from "react";

import { PatientManager } from "@/components/features/patients/PatientManager";
import { env } from "@/config/env";
import { getPatients } from "@/features/patients/server/get-patients";
import { withTimeout } from "@/lib/fetch-with-timeout";

async function PatientsData() {
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  let patients;
  let hasError = false;

  try {
    patients = await withTimeout(getPatients(orgId));
  } catch {
    hasError = true;
  }

  if (!hasError && patients) {
    return <PatientManager orgId={orgId} initialPatients={patients} />;
  }

  return (
    <>
      <DataUnavailableBanner />
      <PatientManager orgId={orgId} initialPatients={[]} />
    </>
  );
}

export default function PatientsPage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Care Registry
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Patients</h2>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <PatientsData />
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
