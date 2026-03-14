import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { getDashboardMetrics } from "@/services/analytics/dashboard-service";

export type AnalyticsInsights = {
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

function rangeStartIso(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function percent(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

export async function getAnalyticsInsights(
  supabase: SupabaseClient<Database>,
  orgId: string,
  days: number
): Promise<AnalyticsInsights> {
  const start = rangeStartIso(days);
  const dashboard = await getDashboardMetrics(supabase, orgId);

  const [
    visitsInRangeResult,
    completedVisitsResult,
    incidentsInRangeResult,
    activeStaffResult,
    scheduledAppointmentsResult,
  ] = await Promise.all([
    supabase
      .from("visits")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .gte("created_at", start)
      .is("deleted_at", null),
    supabase
      .from("visits")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("status", "completed")
      .gte("created_at", start)
      .is("deleted_at", null),
    supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .gte("occurred_at", start)
      .is("deleted_at", null),
    supabase
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("status", "active"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .gte("starts_at", start)
      .is("deleted_at", null),
  ]);

  const visitsInRange = visitsInRangeResult.count ?? 0;
  const completedVisitsInRange = completedVisitsResult.count ?? 0;
  const incidentsInRange = incidentsInRangeResult.count ?? 0;
  const activeStaff = activeStaffResult.count ?? 0;
  const scheduledAppointmentsInRange = scheduledAppointmentsResult.count ?? 0;

  const complianceRisk: AnalyticsInsights["summary"]["complianceRisk"] =
    dashboard.openComplianceChecks >= 6
      ? "high"
      : dashboard.openComplianceChecks >= 2
      ? "moderate"
      : "low";

  return {
    days,
    summary: {
      activePatientRate: percent(dashboard.activePatients, dashboard.totalPatients),
      visitCompletionRate: percent(completedVisitsInRange, visitsInRange),
      incidentRate: percent(incidentsInRange, Math.max(visitsInRange, 1)),
      complianceRisk,
    },
    counts: {
      activePatients: dashboard.activePatients,
      totalPatients: dashboard.totalPatients,
      visitsInRange,
      completedVisitsInRange,
      incidentsInRange,
      openComplianceChecks: dashboard.openComplianceChecks,
      activeStaff,
      scheduledAppointmentsInRange,
    },
  };
}
