import { createClient } from "@/lib/supabase/server";
import { getVisitById, listVisitNotes } from "@/services/visits/visit-service";

export async function getVisitDetail(orgId: string, visitId: string) {
  const supabase = await createClient();
  return getVisitById(supabase, orgId, visitId);
}

export async function getVisitNotes(orgId: string, visitId: string) {
  const supabase = await createClient();
  return listVisitNotes(supabase, orgId, visitId);
}
