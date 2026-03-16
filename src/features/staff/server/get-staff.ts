import { unstable_cache } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { listStaff } from "@/services/staff/staff-service";

const CACHE_REVALIDATE_SEC = 60;

export async function getStaff(orgId: string) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      return listStaff(supabase, orgId);
    },
    ["server-staff", orgId],
    { revalidate: CACHE_REVALIDATE_SEC }
  )();
}
