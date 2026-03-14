import { createClient } from "@/lib/supabase/server";
import { listIncidents } from "@/services/incidents/incident-service";

export async function getIncidents(orgId: string) {
  const supabase = await createClient();
  return listIncidents(supabase, orgId);
}
