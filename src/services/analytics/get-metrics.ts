import { createClient } from "@/lib/supabase/server";
import { getDashboardMetrics } from "@/services/analytics/dashboard-service";

export async function getMetrics(orgId: string) {
  const supabase = await createClient();
  return getDashboardMetrics(supabase, orgId);
}
