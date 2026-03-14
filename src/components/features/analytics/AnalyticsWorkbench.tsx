"use client";

import { useState } from "react";

type Insights = {
  days: number;
  summary: {
    activePatientRate: number;
    visitCompletionRate: number;
    incidentRate: number;
    complianceRisk: "low" | "moderate" | "high";
  };
  counts: {
    activePatients: number;
    totalPatients: number;
    visitsInRange: number;
    completedVisitsInRange: number;
    incidentsInRange: number;
    openComplianceChecks: number;
    activeStaff: number;
    scheduledAppointmentsInRange: number;
  };
};

type ApiResponse<T> = { data: T | null; error: { message: string } | null };

type AnalyticsWorkbenchProps = {
  orgId: string;
  initialInsights: Insights;
};

export function AnalyticsWorkbench({ orgId, initialInsights }: AnalyticsWorkbenchProps) {
  const [insights, setInsights] = useState(initialInsights);
  const [days, setDays] = useState(initialInsights.days);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await fetch(`/api/analytics?orgId=${orgId}&days=${days}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiResponse<Insights>;
      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Unable to refresh analytics.");
        return;
      }
      setInsights(payload.data);
    } catch {
      setError("Unable to refresh analytics.");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-3">
        <select
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
        <button
          type="button"
          onClick={refresh}
          disabled={isRefreshing}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {isRefreshing ? "Refreshing..." : "Refresh Analytics"}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Active Patient Rate</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{insights.summary.activePatientRate}%</p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Incident Rate (Today)</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{insights.summary.incidentRate}%</p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Compliance Risk</p>
          <p className="mt-2 text-2xl font-semibold capitalize text-slate-900">{insights.summary.complianceRisk}</p>
        </article>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Visits in Range</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{insights.counts.visitsInRange}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Completed Visits</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{insights.counts.completedVisitsInRange}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Active Staff</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{insights.counts.activeStaff}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Scheduled Appointments</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{insights.counts.scheduledAppointmentsInRange}</p>
        </article>
      </div>
    </div>
  );
}
