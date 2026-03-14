import { env } from "@/config/env";
import { getMetrics } from "@/services/analytics/get-metrics";

const metricCards = [
  { key: "totalPatients", label: "Total Patients" },
  { key: "activePatients", label: "Active Patients" },
  { key: "visitsToday", label: "Visits Today" },
  { key: "openIncidents", label: "Open Incidents" },
  { key: "openComplianceChecks", label: "Open Compliance Checks" },
] as const;

export default async function DashboardPage() {
  const metrics = await getMetrics(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Operations Dashboard</h2>
      <p className="text-sm text-slate-600">
        Live operational snapshot for your organization.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metricCards.map((metric) => (
          <article
            key={metric.key}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {metrics[metric.key]}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
