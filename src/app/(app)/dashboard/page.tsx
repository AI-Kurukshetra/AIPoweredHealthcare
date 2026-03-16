import { Suspense } from "react";

import { ActivityFeed } from "@/components/features/dashboard/ActivityFeed";
import { LineChart } from "@/components/features/dashboard/LineChart";
import { LiveMetricsPanel } from "@/components/features/dashboard/LiveMetricsPanel";
import { StatsCard } from "@/components/features/dashboard/StatsCard";
import { env } from "@/config/env";
import { withTimeout } from "@/lib/fetch-with-timeout";
import { getCharts } from "@/services/analytics/get-charts";
import { getMetrics } from "@/services/analytics/get-metrics";
import { getActivityServer } from "@/services/activity/get-activity-server";
import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import type { HealthcareRole } from "@/types/app.types";
import { CalendarDays, Map, ShieldCheck, HeartPulse } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const FALLBACK_METRICS = {
  totalPatients: 0,
  activePatients: 0,
  activeStaff: 0,
  visitsToday: 0,
  pendingBilling: 0,
  openIncidents: 0,
  openComplianceChecks: 0,
};

async function DashboardMetrics() {
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  let metrics = FALLBACK_METRICS;
  let hasError = false;

  try {
    metrics = await withTimeout(getMetrics(orgId));
  } catch {
    hasError = true;
  }

  const hasRealMetrics = !hasError && metrics !== FALLBACK_METRICS;

  return (
    <>
      {hasError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Live metrics unavailable — Supabase may be unreachable. Check your .env and project status.
        </div>
      ) : null}
      <LiveMetricsPanel orgId={orgId} initial={metrics} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Patients"
          value={hasRealMetrics ? metrics.totalPatients : 0}
        />
        <StatsCard
          label="Active Staff"
          value={hasRealMetrics ? metrics.activeStaff : 0}
        />
        <StatsCard
          label="Today's Visits"
          value={hasRealMetrics ? metrics.visitsToday : 0}
        />
        <StatsCard
          label="Pending Billing"
          value={hasRealMetrics ? metrics.pendingBilling : 0}
        />
      </div>
    </>
  );
}

function MetricsSkeleton() {
  return (
    <>
      <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100/60" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100/60"
          />
        ))}
      </div>
    </>
  );
}

async function DashboardCharts() {
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  let charts;
  let hasError = false;

  try {
    charts = await withTimeout(getCharts(orgId, 30));
  } catch {
    hasError = true;
  }

  if (!hasError && charts) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <LineChart
          title="Patient Growth"
          subtitle="New patients per day"
          data={charts.patientGrowth.data}
        />
        <LineChart
          title="Staff Utilization"
          subtitle="Staff activity per day"
          data={charts.staffUtilization.data}
        />
        <LineChart
          title="Visit Trends"
          subtitle="Visits per day"
          data={charts.visitTrends.data}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <LineChart title="Patient Growth" subtitle="Admissions and discharges" />
      <LineChart title="Staff Utilization" subtitle="Active field coverage" />
      <LineChart title="Visit Trends" subtitle="Scheduled vs completed" />
    </div>
  );
}

async function DashboardActivity() {
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  let items;
  let hasError = false;

  try {
    items = await withTimeout(getActivityServer(orgId, 10));
  } catch {
    hasError = true;
  }

  if (!hasError && items) {
    return <ActivityFeed items={items} />;
  }

  return (
    <ActivityFeed
      items={[
        {
          id: "activity-fallback",
          title: "Activity unavailable",
          description: "Could not load recent activity. Check your connection.",
          time: "—",
        },
      ]}
    />
  );
}

function ChartsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100/60"
        />
      ))}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3 animate-pulse rounded-2xl border border-slate-200/70 bg-white/95 p-5">
      <div className="h-6 w-32 rounded bg-slate-200" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  let role: HealthcareRole | undefined;

  try {
    ({ role } = await resolveAuthContext(orgId));
  } catch (error) {
    if (error instanceof AuthError && error.code === "UNAUTHORIZED") {
      redirect(`/login?next=/dashboard`);
    }
    throw error;
  }

  if (role === "org_admin" || role === "super_admin") {
    return (
      <section className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Command Center
          </p>
          <h2 className="text-3xl font-semibold text-slate-950">Operations Dashboard</h2>
        </div>
        <p className="text-sm text-slate-600">
          Live operational snapshot for your organization.
        </p>

        <Suspense fallback={<MetricsSkeleton />}>
          <DashboardMetrics />
        </Suspense>

        <Suspense fallback={<ChartsSkeleton />}>
          <DashboardCharts />
        </Suspense>

        <Suspense fallback={<ActivitySkeleton />}>
          <DashboardActivity />
        </Suspense>
      </section>
    );
  }

  // Clinical / Field worker dashboard
  const isFieldRole = role === "field_nurse";

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          {isFieldRole ? "Field Hub" : "Clinical Hub"}
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">My Workday</h2>
      </div>
      <p className="text-sm text-slate-600 mb-6">
        Here are your essential tasks and priorities for today.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <span className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
               <CalendarDays className="h-5 w-5" />
             </span>
             <h3 className="font-semibold text-slate-900">Today&apos;s Visits</h3>
          </div>
          <p className="text-3xl font-bold text-slate-950">4</p>
          <p className="text-xs text-slate-500 mt-1">Appointments scheduled for today</p>
          <Link href="/schedule" className="text-xs font-semibold text-cyan-700 mt-4 inline-block hover:underline">View My Schedule →</Link>
        </div>

        {isFieldRole && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
               <span className="rounded-2xl bg-white/70 p-3 text-amber-700">
                 <Map className="h-5 w-5" />
               </span>
               <h3 className="font-semibold text-amber-900">Routing</h3>
            </div>
            <p className="text-3xl font-bold text-amber-950">21 km</p>
            <p className="text-xs text-amber-800/80 mt-1">Estimated driving distance</p>
            <Link href="/schedule" className="text-xs font-semibold text-amber-800 mt-4 inline-block hover:underline">Open AI Routing →</Link>
          </div>
        )}

        <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <span className="rounded-2xl bg-rose-100 p-3 text-rose-700">
               <HeartPulse className="h-5 w-5" />
             </span>
             <h3 className="font-semibold text-rose-900">Patient Risk Alerts</h3>
          </div>
          <p className="text-3xl font-bold text-rose-950">1</p>
          <p className="text-xs text-rose-700/80 mt-1">Patients tagged High Risk</p>
          <Link href="/patients" className="text-xs font-semibold text-rose-800 mt-4 inline-block hover:underline">Review Profiles →</Link>
        </div>
      </div>
      
      {role === "care_coordinator" && (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm max-w-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-600"/> Needs Approval</h3>
          </div>
          <div className="mt-4 flex flex-col gap-3">
             <div className="text-sm p-3 bg-slate-50 border rounded-xl flex justify-between items-center">
                <span>Care Plan Renewal - John Doe</span>
                <button className="text-xs bg-white border shadow-sm px-3 py-1 rounded-lg">Review</button>
             </div>
          </div>
        </div>
      )}
    </section>
  );
}
