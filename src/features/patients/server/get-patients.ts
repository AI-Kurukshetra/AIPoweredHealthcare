import { createClient } from "@/lib/supabase/server";
import { provisionUserAccess } from "@/lib/auth/provision";
import { listPatients } from "@/services/patients/patient-service";

export async function getPatients(orgId: string) {
  const supabase = await createClient();
  const patients = await listPatients(supabase, orgId);

  if (patients.length > 0) {
    return patients;
  }

  // RLS returns an empty result set when the signed-in user is not yet an active
  // org member. Provision access and retry once to recover existing records.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) {
    return patients;
  }

  await provisionUserAccess(user.id, user.email, user.user_metadata?.full_name);
  return listPatients(supabase, orgId);
}
