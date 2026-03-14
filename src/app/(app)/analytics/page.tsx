import { env } from "@/config/env";
import { AnalyticsWorkbench } from "@/components/features/analytics/AnalyticsWorkbench";
import { getInsights } from "@/services/analytics/get-insights";

export default async function AnalyticsPage() {
  const insights = await getInsights(env.NEXT_PUBLIC_DEFAULT_ORG_ID, 7);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Intelligence
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Analytics</h2>
      </div>
      <AnalyticsWorkbench
        orgId={env.NEXT_PUBLIC_DEFAULT_ORG_ID}
        initialInsights={insights}
      />
    </section>
  );
}
