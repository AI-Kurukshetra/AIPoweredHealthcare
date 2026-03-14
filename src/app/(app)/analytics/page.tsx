import dynamic from "next/dynamic";
import { Suspense } from "react";

import { env } from "@/config/env";
import { withTimeout } from "@/lib/fetch-with-timeout";
import { getInsights } from "@/services/analytics/get-insights";

const AnalyticsWorkbench = dynamic(
  () =>
    import("@/components/features/analytics/AnalyticsWorkbench").then((mod) => ({
      default: mod.AnalyticsWorkbench,
    })),
  {
    loading: () => (
      <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-slate-100/60" />
    ),
  }
);

async function AnalyticsData() {
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  try {
    const insights = await withTimeout(getInsights(orgId, 7));
    return <AnalyticsWorkbench orgId={orgId} initialInsights={insights} />;
  } catch {
    const fallbackInsights = {
      days: 7,
      refreshedAt: new Date(0).toISOString(),
      summary: {
        activePatientRate: 0,
        visitCompletionRate: 0,
        incidentRate: 0,
        complianceRisk: "low" as const,
        complianceRate: 0,
        carePlanAdherenceRate: 0,
        visitsToday: 0,
        openIncidents: 0,
      },
      counts: {
        activePatients: 0,
        totalPatients: 0,
        visitsInRange: 0,
        completedVisitsInRange: 0,
        incidentsInRange: 0,
        openComplianceChecks: 0,
        activeStaff: 0,
        scheduledAppointmentsInRange: 0,
        complianceChecksInRange: 0,
        compliantChecksInRange: 0,
        visitNotesInRange: 0,
      },
      kpis: [],
    };

    return (
      <>
        <DataUnavailableBanner />
        <AnalyticsWorkbench orgId={orgId} initialInsights={fallbackInsights} />
      </>
    );
  }
}

export default function AnalyticsPage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Intelligence
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Analytics</h2>
      </div>
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-slate-100/60" />
        }
      >
        <AnalyticsData />
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
