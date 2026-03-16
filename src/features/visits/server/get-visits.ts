import { createAdminClient } from "@/lib/supabase/admin";
import { listVisits } from "@/services/visits/visit-service";

export async function getVisits(orgId: string) {
  const supabase = createAdminClient();
  return listVisits(supabase, orgId);
}
