import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CreateScheduleInput,
  ScheduleListItem,
  UpdateScheduleInput,
} from "@/features/schedules/types";
import type { Database } from "@/types/database.types";

export async function listSchedules(
  supabase: SupabaseClient<Database>,
  orgId: string
): Promise<ScheduleListItem[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, patient_id, assigned_staff_id, status, starts_at, ends_at, created_at")
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("starts_at", { ascending: true })
    .limit(100);

  if (error) {
    throw new Error("SCHEDULES_LIST_FAILED");
  }

  return data.map((row) => ({
    id: row.id,
    patientId: row.patient_id,
    assignedStaffId: row.assigned_staff_id,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
  }));
}

export async function createSchedule(
  supabase: SupabaseClient<Database>,
  orgId: string,
  userId: string,
  input: CreateScheduleInput
): Promise<ScheduleListItem> {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      org_id: orgId,
      patient_id: input.patientId,
      assigned_staff_id: input.assignedStaffId ?? null,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      status: input.status ?? "scheduled",
      created_by: userId,
      updated_by: userId,
    })
    .select("id, patient_id, assigned_staff_id, status, starts_at, ends_at, created_at")
    .single();

  if (error) {
    throw new Error("SCHEDULE_CREATE_FAILED");
  }

  return {
    id: data.id,
    patientId: data.patient_id,
    assignedStaffId: data.assigned_staff_id,
    status: data.status,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    createdAt: data.created_at,
  };
}

export async function updateScheduleById(
  supabase: SupabaseClient<Database>,
  orgId: string,
  scheduleId: string,
  userId: string,
  input: UpdateScheduleInput
): Promise<ScheduleListItem | null> {
  const patch: Database["public"]["Tables"]["appointments"]["Update"] = {
    updated_by: userId,
  };

  if (typeof input.assignedStaffId !== "undefined") {
    patch.assigned_staff_id = input.assignedStaffId;
  }
  if (typeof input.startsAt !== "undefined") {
    patch.starts_at = input.startsAt;
  }
  if (typeof input.endsAt !== "undefined") {
    patch.ends_at = input.endsAt;
  }
  if (typeof input.status !== "undefined") {
    patch.status = input.status;
  }

  const { data, error } = await supabase
    .from("appointments")
    .update(patch)
    .eq("org_id", orgId)
    .eq("id", scheduleId)
    .is("deleted_at", null)
    .select("id, patient_id, assigned_staff_id, status, starts_at, ends_at, created_at")
    .maybeSingle();

  if (error) {
    throw new Error("SCHEDULE_UPDATE_FAILED");
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    patientId: data.patient_id,
    assignedStaffId: data.assigned_staff_id,
    status: data.status,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    createdAt: data.created_at,
  };
}
