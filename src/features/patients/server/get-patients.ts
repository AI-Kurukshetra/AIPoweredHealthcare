import { unstable_cache } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { listPatients } from "@/services/patients/patient-service";

const CACHE_REVALIDATE_SEC = 60;

export async function getPatients(orgId: string) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      return listPatients(supabase, orgId);
    },
    ["server-patients", orgId],
    { revalidate: CACHE_REVALIDATE_SEC }
  )();
}
