import type { SupabaseClient } from "@supabase/supabase-js";

export type ChartSeries = {
  labels: string[];
  data: number[];
};

export type DashboardCharts = {
  patientGrowth: ChartSeries;
  staffUtilization: ChartSeries;
  visitTrends: ChartSeries;
};

function getDateLabels(days: number): string[] {
  const labels: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  }
  return labels;
}

function startOfDay(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
}

/**
 * Prefer RPC (single DB round-trip, aggregated in Postgres) to avoid full table scans.
 * Falls back to per-day count queries (lightweight, no row transfer) if RPC is not available.
 */
export async function getDashboardCharts(
  supabase: SupabaseClient,
  orgId: string,
  days = 30
): Promise<DashboardCharts> {
  const labels = getDateLabels(days);

  const rpcResult = await supabase.rpc("get_dashboard_charts", {
    p_org_id: orgId,
    p_days: days,
  });

  if (!rpcResult.error && rpcResult.data) {
    const r = rpcResult.data as {
      labels?: string[];
      patientGrowth?: number[];
      staffUtilization?: number[];
      visitTrends?: number[];
    };
    return {
      patientGrowth: {
        labels: Array.isArray(r.labels) ? r.labels : labels,
        data: Array.isArray(r.patientGrowth) ? r.patientGrowth : new Array(days).fill(0),
      },
      staffUtilization: {
        labels: Array.isArray(r.labels) ? r.labels : labels,
        data: Array.isArray(r.staffUtilization) ? r.staffUtilization : new Array(days).fill(0),
      },
      visitTrends: {
        labels: Array.isArray(r.labels) ? r.labels : labels,
        data: Array.isArray(r.visitTrends) ? r.visitTrends : new Array(days).fill(0),
      },
    };
  }

  return getDashboardChartsFallback(supabase, orgId, days, labels);
}

/**
 * Fallback: per-day count queries (count only, no row transfer = minimal disk IO).
 * Used when get_dashboard_charts RPC migration has not been applied.
 * Runs in batches of 5 days at a time to avoid overwhelming the connection pool.
 */
async function getDashboardChartsFallback(
  supabase: SupabaseClient,
  orgId: string,
  days: number,
  labels: string[]
): Promise<DashboardCharts> {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const tasks: Array<() => Promise<{ p: number; a: number; v: number }>> = [];
  for (let i = 0; i < days; i++) {
    const dayStart = new Date(startDate);
    dayStart.setDate(dayStart.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const startIso = startOfDay(dayStart);
    const endIso = startOfDay(dayEnd);
    tasks.push(async () => {
      const [p, a, v] = await Promise.all([
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("org_id", orgId)
          .gte("created_at", startIso)
          .lt("created_at", endIso)
          .is("deleted_at", null),
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("org_id", orgId)
          .gte("starts_at", startIso)
          .lt("starts_at", endIso)
          .is("deleted_at", null),
        supabase
          .from("visits")
          .select("id", { count: "exact", head: true })
          .eq("org_id", orgId)
          .gte("created_at", startIso)
          .lt("created_at", endIso)
          .is("deleted_at", null),
      ]);
      return { p: p.count ?? 0, a: a.count ?? 0, v: v.count ?? 0 };
    });
  }

  const BATCH_SIZE = 5;
  const results: { p: number; a: number; v: number }[] = [];
  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map((t) => t()));
    results.push(...batchResults);
  }

  const patientGrowthData = results.map((r) => r.p);
  const staffUtilizationData = results.map((r) => r.a);
  const visitTrendsData = results.map((r) => r.v);

  return {
    patientGrowth: { labels, data: patientGrowthData },
    staffUtilization: { labels, data: staffUtilizationData },
    visitTrends: { labels, data: visitTrendsData },
  };
}
