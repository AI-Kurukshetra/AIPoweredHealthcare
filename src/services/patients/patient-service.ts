import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CreatePatientInput,
  PatientDetail,
  PatientListItem,
  PatientVisitItem,
  UpdatePatientInput,
} from "@/features/patients/types";
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

export async function getPatientById(
  supabase: SupabaseClient<Database>,
  orgId: string,
  patientId: string
): Promise<PatientDetail | null> {
  const { data, error } = await supabase
    .from("patients")
    .select(
      "id, first_name, last_name, care_status, phone, dob_encrypted, created_at, updated_at"
    )
    .eq("org_id", orgId)
    .eq("id", patientId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error("PATIENT_GET_FAILED");
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    careStatus: data.care_status,
    phone: data.phone,
    dobEncrypted: data.dob_encrypted,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updatePatientById(
  supabase: SupabaseClient<Database>,
  orgId: string,
  userId: string,
  patientId: string,
  input: UpdatePatientInput
): Promise<PatientDetail | null> {
  const patch: Database["public"]["Tables"]["patients"]["Update"] = {
    updated_by: userId,
  };

  if (typeof input.firstName !== "undefined") {
    patch.first_name = input.firstName;
  }
  if (typeof input.lastName !== "undefined") {
    patch.last_name = input.lastName;
  }
  if (typeof input.phone !== "undefined") {
    patch.phone = input.phone;
  }
  if (typeof input.careStatus !== "undefined") {
    patch.care_status = input.careStatus;
  }

  const { data, error } = await supabase
    .from("patients")
    .update(patch)
    .eq("org_id", orgId)
    .eq("id", patientId)
    .is("deleted_at", null)
    .select(
      "id, first_name, last_name, care_status, phone, dob_encrypted, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    throw new Error("PATIENT_UPDATE_FAILED");
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    careStatus: data.care_status,
    phone: data.phone,
    dobEncrypted: data.dob_encrypted,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function listPatientVisits(
  supabase: SupabaseClient<Database>,
  orgId: string,
  patientId: string
): Promise<PatientVisitItem[]> {
  const { data, error } = await supabase
    .from("visits")
    .select("id, status, assigned_staff_id, started_at, completed_at, created_at")
    .eq("org_id", orgId)
    .eq("patient_id", patientId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error("PATIENT_VISITS_LIST_FAILED");
  }

  return data.map((row) => ({
    id: row.id,
    status: row.status,
    assignedStaffId: row.assigned_staff_id,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  }));
}
