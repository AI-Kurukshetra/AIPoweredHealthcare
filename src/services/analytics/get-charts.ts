import { unstable_cache } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardCharts } from "@/services/analytics/charts-service";

const CACHE_REVALIDATE_SEC = 300;

export async function getCharts(orgId: string, days = 30) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      return getDashboardCharts(supabase, orgId, days);
    },
    ["analytics-charts", orgId, String(days)],
    { revalidate: CACHE_REVALIDATE_SEC }
  )();
}
