import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export type DashboardMetrics = {
  totalPatients: number;
  activePatients: number;
  visitsToday: number;
  openIncidents: number;
  openComplianceChecks: number;
};

function startOfUtcDayIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

export async function getDashboardMetrics(
  supabase: SupabaseClient<Database>,
  orgId: string
): Promise<DashboardMetrics> {
  const [totalPatientsResult, activePatientsResult, visitsTodayResult, openIncidentsResult, openComplianceResult] =
    await Promise.all([
      supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .is("deleted_at", null),
      supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("care_status", "active")
        .is("deleted_at", null),
      supabase
        .from("visits")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .gte("created_at", startOfUtcDayIso())
        .is("deleted_at", null),
      supabase
        .from("incidents")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("status", "open")
        .is("deleted_at", null),
      supabase
        .from("compliance_records")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .neq("status", "compliant"),
    ]);

  if (
    totalPatientsResult.error ||
    activePatientsResult.error ||
    visitsTodayResult.error ||
    openIncidentsResult.error ||
    openComplianceResult.error
  ) {
    throw new Error("DASHBOARD_METRICS_QUERY_FAILED");
  }

  return {
    totalPatients: totalPatientsResult.count ?? 0,
    activePatients: activePatientsResult.count ?? 0,
    visitsToday: visitsTodayResult.count ?? 0,
    openIncidents: openIncidentsResult.count ?? 0,
    openComplianceChecks: openComplianceResult.count ?? 0,
  };
}
