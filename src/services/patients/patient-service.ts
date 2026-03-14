import type { SupabaseClient } from "@supabase/supabase-js";

import type { CreatePatientInput, PatientListItem } from "@/features/patients/types";
import type { Database } from "@/types/database.types";

export async function listPatients(
  supabase: SupabaseClient<Database>,
  orgId: string
): Promise<PatientListItem[]> {
  const { data, error } = await supabase
    .from("patients")
    .select("id, first_name, last_name, care_status")
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("PATIENTS_LIST_FAILED");
  }

  return data.map((row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    careStatus: row.care_status,
  }));
}

export async function createPatient(
  supabase: SupabaseClient<Database>,
  orgId: string,
  userId: string,
  input: CreatePatientInput
) {
  const { data, error } = await supabase
    .from("patients")
    .insert({
      org_id: orgId,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone ?? null,
      dob_encrypted: input.dobEncrypted ?? null,
      created_by: userId,
      updated_by: userId,
    })
    .select("id, first_name, last_name, care_status")
    .single();

  if (error) {
    throw new Error("PATIENT_CREATE_FAILED");
  }

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    careStatus: data.care_status,
  } satisfies PatientListItem;
}
