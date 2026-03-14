import { createClient } from "@/lib/supabase/server";
import { listPatients } from "@/services/patients/patient-service";

export async function getPatients(orgId: string) {
  const supabase = await createClient();
  return listPatients(supabase, orgId);
}
