import { createClient } from "@/lib/supabase/server";
import {
  getPatientById,
  listPatientCareTeam,
  listPatientTimeline,
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

export async function getPatientTimeline(orgId: string, patientId: string) {
  const supabase = await createClient();
  return listPatientTimeline(supabase, orgId, patientId);
}

export async function getPatientCareTeam(orgId: string, patientId: string) {
  const supabase = await createClient();
  return listPatientCareTeam(supabase, orgId, patientId);
}
