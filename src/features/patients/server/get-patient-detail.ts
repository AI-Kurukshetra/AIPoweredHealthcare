import { createClient } from "@/lib/supabase/server";
import {
  getPatientById,
  listPatientVisits,
} from "@/services/patients/patient-service";

export async function getPatientDetail(orgId: string, patientId: string) {
  const supabase = await createClient();
  return getPatientById(supabase, orgId, patientId);
}

export async function getPatientVisits(orgId: string, patientId: string) {
  const supabase = await createClient();
  return listPatientVisits(supabase, orgId, patientId);
}
