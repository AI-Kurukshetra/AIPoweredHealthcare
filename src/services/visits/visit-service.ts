import type { SupabaseClient } from "@supabase/supabase-js";

import type { CreateVisitInput, VisitListItem } from "@/features/visits/types";
import type { Database } from "@/types/database.types";

export async function listVisits(
  supabase: SupabaseClient<Database>,
  orgId: string
): Promise<VisitListItem[]> {
  const { data, error } = await supabase
    .from("visits")
    .select("id, patient_id, appointment_id, assigned_staff_id, status, started_at, completed_at, created_at")
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error("VISITS_LIST_FAILED");
  }

  return data.map((row) => ({
    id: row.id,
    patientId: row.patient_id,
    appointmentId: row.appointment_id,
    assignedStaffId: row.assigned_staff_id,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  }));
}

export async function createVisit(
  supabase: SupabaseClient<Database>,
  orgId: string,
  userId: string,
  input: CreateVisitInput
): Promise<VisitListItem> {
  const { data, error } = await supabase
    .from("visits")
    .insert({
      org_id: orgId,
      patient_id: input.patientId,
      appointment_id: input.appointmentId ?? null,
      assigned_staff_id: input.assignedStaffId ?? null,
      started_at: input.startedAt ?? null,
      completed_at: input.completedAt ?? null,
      status: input.status ?? "in_progress",
      created_by: userId,
      updated_by: userId,
    })
    .select("id, patient_id, appointment_id, assigned_staff_id, status, started_at, completed_at, created_at")
    .single();

  if (error) {
    throw new Error("VISIT_CREATE_FAILED");
  }

  if (input.note) {
    const { error: noteError } = await supabase.from("visit_notes").insert({
      org_id: orgId,
      visit_id: data.id,
      patient_id: input.patientId,
      note: input.note,
      vitals: input.vitals ?? null,
      created_by: userId,
      updated_by: userId,
    });

    if (noteError) {
      throw new Error("VISIT_NOTE_CREATE_FAILED");
    }
  }

  return {
    id: data.id,
    patientId: data.patient_id,
    appointmentId: data.appointment_id,
    assignedStaffId: data.assigned_staff_id,
    status: data.status,
    startedAt: data.started_at,
    completedAt: data.completed_at,
    createdAt: data.created_at,
  };
}
