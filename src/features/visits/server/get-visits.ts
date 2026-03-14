import { createClient } from "@/lib/supabase/server";
import { listVisits } from "@/services/visits/visit-service";

export async function getVisits(orgId: string) {
  const supabase = await createClient();
  return listVisits(supabase, orgId);
}
