"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type DashboardMetrics = {
  totalPatients: number;
  activePatients: number;
  visitsToday: number;
  openIncidents: number;
  openComplianceChecks: number;
};

type ApiResponse<T> = { data: T | null; error: { message: string } | null };

const metricCards = [
  { key: "totalPatients", label: "Total Patients" },
  { key: "activePatients", label: "Active Patients" },
  { key: "visitsToday", label: "Visits Today" },
  { key: "openIncidents", label: "Open Incidents" },
  { key: "openComplianceChecks", label: "Open Compliance Checks" },
] as const;

type LiveMetricsPanelProps = {
  orgId: string;
  initial: DashboardMetrics;
};

export function LiveMetricsPanel({ orgId, initial }: LiveMetricsPanelProps) {
  const [metrics, setMetrics] = useState(initial);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState("Pending");

  const endpoint = useMemo(() => `/api/analytics?orgId=${orgId}`, [orgId]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const payload = (await response.json()) as ApiResponse<DashboardMetrics>;
      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Unable to refresh metrics.");
        return;
      }
      setMetrics(payload.data);
      setLastUpdatedLabel(new Date().toLocaleTimeString());
    } catch {
      setError("Unable to refresh metrics.");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    setLastUpdatedLabel(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      void refresh();
    }, 45_000);

    return () => clearInterval(timer);
  }, [refresh]);

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
