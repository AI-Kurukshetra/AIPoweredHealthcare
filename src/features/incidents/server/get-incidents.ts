import { createAdminClient } from "@/lib/supabase/admin";
import { listIncidents } from "@/services/incidents/incident-service";

export async function getIncidents(orgId: string) {
  const supabase = createAdminClient();
  return listIncidents(supabase, orgId);
}
