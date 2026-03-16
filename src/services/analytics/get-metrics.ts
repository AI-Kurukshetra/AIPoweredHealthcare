import { unstable_cache } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardMetrics } from "@/services/analytics/dashboard-service";

const CACHE_REVALIDATE_SEC = 300;

export async function getMetrics(orgId: string) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      return getDashboardMetrics(supabase, orgId);
    },
    ["analytics-metrics", orgId],
    { revalidate: CACHE_REVALIDATE_SEC }
  )();
}
