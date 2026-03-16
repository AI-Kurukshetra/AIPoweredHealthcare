"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

type DashboardMetrics = {
  totalPatients: number;
  activePatients: number;
  activeStaff: number;
  visitsToday: number;
  pendingBilling: number;
  openIncidents: number;
  openComplianceChecks: number;
};

const metricCards = [
  { key: "totalPatients", label: "Total Patients" },
  { key: "activePatients", label: "Active Patients" },
  { key: "activeStaff", label: "Active Staff" },
  { key: "visitsToday", label: "Visits Today" },
  { key: "pendingBilling", label: "Pending Billing" },
  { key: "openIncidents", label: "Open Incidents" },
  { key: "openComplianceChecks", label: "Open Compliance Checks" },
] as const;

type LiveMetricsPanelProps = {
  orgId: string;
  initial: DashboardMetrics;
};

export function LiveMetricsPanel({ orgId, initial }: LiveMetricsPanelProps) {
  const refreshIntervalMs = 600_000; // 10 min (reduces Disk IO from analytics polling)
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState(
    () => new Date().toLocaleTimeString()
  );
  const {
    data: metrics = initial,
    isFetching: isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.analytics(orgId),
    queryFn: () => apiGet<DashboardMetrics>("/api/analytics", { orgId }),
    initialData: initial,
    refetchInterval: refreshIntervalMs,
  });

  async function refresh() {
    setError(null);
    try {
      await refetch();
      setLastUpdatedLabel(new Date().toLocaleTimeString());
    } catch {
      setError("Unable to refresh metrics.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Last updated: {lastUpdatedLabel}
        </p>
        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metricCards.map((metric) => (
          <article
            key={metric.key}
            className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]"
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
    </div>
  );
}
