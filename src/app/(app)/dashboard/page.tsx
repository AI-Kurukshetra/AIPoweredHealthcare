import { env } from "@/config/env";
import { LiveMetricsPanel } from "@/components/features/dashboard/LiveMetricsPanel";
import { getMetrics } from "@/services/analytics/get-metrics";

export default async function DashboardPage() {
  const metrics = await getMetrics(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

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
      <LiveMetricsPanel orgId={env.NEXT_PUBLIC_DEFAULT_ORG_ID} initial={metrics} />
    </section>
  );
}
