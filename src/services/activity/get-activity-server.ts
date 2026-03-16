import { unstable_cache } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getActivity } from "./get-activity";

const CACHE_REVALIDATE_SEC = 120;

export async function getActivityServer(orgId: string, limit = 10) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      return getActivity(supabase, orgId, limit);
    },
    ["activity-feed", orgId, String(limit)],
    { revalidate: CACHE_REVALIDATE_SEC }
  )();
}
