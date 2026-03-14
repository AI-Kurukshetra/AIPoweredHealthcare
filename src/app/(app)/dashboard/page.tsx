import { Suspense } from "react";

import { ActivityFeed } from "@/components/features/dashboard/ActivityFeed";
import { LineChart } from "@/components/features/dashboard/LineChart";
import { LiveMetricsPanel } from "@/components/features/dashboard/LiveMetricsPanel";
import { StatsCard } from "@/components/features/dashboard/StatsCard";
import { env } from "@/config/env";
import { withTimeout } from "@/lib/fetch-with-timeout";
import { getMetrics } from "@/services/analytics/get-metrics";

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
  try {
    const metrics = await withTimeout(getMetrics(orgId));
    return (
      <>
        <LiveMetricsPanel orgId={orgId} initial={metrics} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard label="Total Patients" value={metrics.totalPatients} />
          <StatsCard label="Active Staff" value={metrics.activeStaff} />
          <StatsCard label="Today's Visits" value={metrics.visitsToday} />
          <StatsCard label="Pending Billing" value={metrics.pendingBilling} />
        </div>
      </>
    );
  } catch {
    return (
      <>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Live metrics unavailable — Supabase may be unreachable. Check your .env and project status.
        </div>
        <LiveMetricsPanel orgId={orgId} initial={FALLBACK_METRICS} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard label="Total Patients" value={0} />
          <StatsCard label="Active Staff" value={0} />
          <StatsCard label="Today's Visits" value={0} />
          <StatsCard label="Pending Billing" value={0} />
        </div>
      </>
    );
  }
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

export default function DashboardPage() {
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

      <div className="grid gap-4 lg:grid-cols-3">
        <LineChart title="Patient Growth" subtitle="Admissions and discharges" />
        <LineChart title="Staff Utilization" subtitle="Active field coverage" />
        <LineChart title="Visit Trends" subtitle="Scheduled vs completed" />
      </div>

      <ActivityFeed
        items={[
          {
            id: "activity-1",
            title: "Care coordinator assigned",
            description: "Visit assigned to field nurse for afternoon shift.",
            time: "5 minutes ago",
          },
          {
            id: "activity-2",
            title: "Compliance check completed",
            description: "Credential review closed for new hire.",
            time: "25 minutes ago",
          },
          {
            id: "activity-3",
            title: "Billing draft created",
            description: "New pending claim generated from completed visit.",
            time: "1 hour ago",
          },
        ]}
      />
    </section>
  );
}
