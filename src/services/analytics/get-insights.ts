import { unstable_cache } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAnalyticsInsights } from "@/services/analytics/insights-service";

const CACHE_REVALIDATE_SEC = 300;

export async function getInsights(orgId: string, days: number) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      return getAnalyticsInsights(supabase, orgId, days);
    },
    ["analytics-insights", orgId, String(days)],
    { revalidate: CACHE_REVALIDATE_SEC }
  )();
}
