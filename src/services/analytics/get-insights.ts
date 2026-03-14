import { createClient } from "@/lib/supabase/server";
import { getAnalyticsInsights } from "@/services/analytics/insights-service";

export async function getInsights(orgId: string, days: number) {
  const supabase = await createClient();
  return getAnalyticsInsights(supabase, orgId, days);
}
