import Link from "next/link";
import { Suspense } from "react";

import { ScheduleManager } from "@/components/features/schedules/ScheduleManager";
import { env } from "@/config/env";
import { getPatients } from "@/features/patients/server/get-patients";
import { getSchedules } from "@/features/schedules/server/get-schedules";
import { getStaff } from "@/features/staff/server/get-staff";
import { withTimeout } from "@/lib/fetch-with-timeout";

async function ScheduleData() {
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  let schedules: Awaited<ReturnType<typeof getSchedules>> = [];
  let patients: Awaited<ReturnType<typeof getPatients>> = [];
  let staff: Awaited<ReturnType<typeof getStaff>> = [];
  let hasError = false;

  try {
    const result = await withTimeout(
      Promise.all([getSchedules(orgId), getPatients(orgId), getStaff(orgId)])
    );
    schedules = result[0];
    patients = result[1];
    staff = result[2];
  } catch {
    hasError = true;
  }

  if (!hasError) {
    return (
      <ScheduleManager
        orgId={orgId}
        initialSchedules={schedules}
        patients={patients}
        staff={staff}
      />
    );
  }

  return (
    <>
      <DataUnavailableBanner />
      <ScheduleManager orgId={orgId} initialSchedules={[]} patients={[]} staff={[]} />
    </>
  );
}

export default function SchedulePage() {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Coordination
          </p>
          <h2 className="text-3xl font-semibold text-slate-950">Schedule</h2>
        </div>
        <Link
          href="/schedule/auto-assign"
          className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-800 transition hover:-translate-y-0.5 hover:bg-cyan-100"
        >
          Auto Assign
        </Link>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <ScheduleData />
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
