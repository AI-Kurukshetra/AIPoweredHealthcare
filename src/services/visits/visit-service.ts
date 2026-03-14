import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CreateVisitInput,
  UpdateVisitInput,
  VisitListItem,
  VisitNoteItem,
} from "@/features/visits/types";
import type { Database } from "@/types/database.types";

export async function listVisits(
  supabase: SupabaseClient<Database>,
  orgId: string,
  options: { offset?: number; limit?: number } = {}
): Promise<VisitListItem[]> {
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 50;
  const { data, error } = await supabase
    .from("visits")
    .select("id, patient_id, appointment_id, assigned_staff_id, status, started_at, completed_at, created_at")
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

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

export async function getVisitById(
  supabase: SupabaseClient<Database>,
  orgId: string,
  visitId: string
): Promise<VisitListItem | null> {
  const { data, error } = await supabase
    .from("visits")
    .select(
      "id, patient_id, appointment_id, assigned_staff_id, status, started_at, completed_at, created_at"
    )
    .eq("org_id", orgId)
    .eq("id", visitId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error("VISIT_GET_FAILED");
  }

  if (!data) {
    return null;
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

export async function updateVisitById(
  supabase: SupabaseClient<Database>,
  orgId: string,
  visitId: string,
  userId: string,
  input: UpdateVisitInput
): Promise<VisitListItem | null> {
  const patch: Database["public"]["Tables"]["visits"]["Update"] = {
    updated_by: userId,
  };

  if (typeof input.status !== "undefined") {
    patch.status = input.status;
  }
  if (typeof input.startedAt !== "undefined") {
    patch.started_at = input.startedAt;
  }
  if (typeof input.completedAt !== "undefined") {
    patch.completed_at = input.completedAt;
  }

  const { data, error } = await supabase
    .from("visits")
    .update(patch)
    .eq("org_id", orgId)
    .eq("id", visitId)
    .is("deleted_at", null)
    .select(
      "id, patient_id, appointment_id, assigned_staff_id, status, started_at, completed_at, created_at"
    )
    .maybeSingle();

  if (error) {
    throw new Error("VISIT_UPDATE_FAILED");
  }

  if (!data) {
    return null;
  }

  if (input.note) {
    const { error: noteError } = await supabase.from("visit_notes").insert({
      org_id: orgId,
      visit_id: data.id,
      patient_id: data.patient_id,
      note: input.note,
      vitals: input.vitals ?? null,
      created_by: userId,
      updated_by: userId,
    });

    if (noteError) {
      throw new Error("VISIT_NOTE_UPDATE_FAILED");
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

export async function listVisitNotes(
  supabase: SupabaseClient<Database>,
  orgId: string,
  visitId: string,
  options: { offset?: number; limit?: number } = {}
): Promise<VisitNoteItem[]> {
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 20;
  const { data, error } = await supabase
    .from("visit_notes")
    .select("id, note, vitals, created_at, created_by")
    .eq("org_id", orgId)
    .eq("visit_id", visitId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error("VISIT_NOTES_LIST_FAILED");
  }

  return data.map((row) => ({
    id: row.id,
    note: row.note,
    vitals: row.vitals as Record<string, string> | null,
    createdAt: row.created_at,
    createdBy: row.created_by,
  }));
}
