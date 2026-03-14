import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  PatientCareTeamMember,
  CreatePatientInput,
  PatientDetail,
  PatientListItem,
  PatientTimelineEvent,
  PatientVisitItem,
  UpdatePatientInput,
} from "@/features/patients/types";
import type { Database } from "@/types/database.types";

export async function listPatients(
  supabase: SupabaseClient<Database>,
  orgId: string,
  options: { offset?: number; limit?: number } = {}
): Promise<PatientListItem[]> {
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 50;
  const { data, error } = await supabase
    .from("patients")
    .select("id, first_name, last_name, care_status")
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`PATIENTS_LIST_FAILED: ${error.message} (code: ${error.code})`);
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
      care_status: input.careStatus ?? "active",
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
  patientId: string,
  options: { offset?: number; limit?: number } = {}
): Promise<PatientVisitItem[]> {
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 20;
  const { data, error } = await supabase
    .from("visits")
    .select("id, status, assigned_staff_id, started_at, completed_at, created_at")
    .eq("org_id", orgId)
    .eq("patient_id", patientId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

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

export async function listPatientTimeline(
  supabase: SupabaseClient<Database>,
  orgId: string,
  patientId: string
): Promise<PatientTimelineEvent[]> {
  const [appointmentsResult, visitsResult, notesResult] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, starts_at, ends_at, status, assigned_staff_id")
      .eq("org_id", orgId)
      .eq("patient_id", patientId)
      .is("deleted_at", null)
      .order("starts_at", { ascending: false })
      .limit(20),
    supabase
      .from("visits")
      .select("id, status, assigned_staff_id, started_at, completed_at, created_at")
      .eq("org_id", orgId)
      .eq("patient_id", patientId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("visit_notes")
      .select("id, note, created_at, created_by")
      .eq("org_id", orgId)
      .eq("patient_id", patientId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (appointmentsResult.error || visitsResult.error || notesResult.error) {
    throw new Error("PATIENT_TIMELINE_LIST_FAILED");
  }

  const appointmentEvents: PatientTimelineEvent[] = appointmentsResult.data.map((row) => ({
    id: row.id,
    type: "appointment",
    title: "Appointment scheduled",
    detail: `Window ${new Date(row.starts_at).toLocaleString()} to ${new Date(row.ends_at).toLocaleString()}`,
    occurredAt: row.starts_at,
    status: row.status,
    actorId: row.assigned_staff_id,
  }));

  const visitEvents: PatientTimelineEvent[] = visitsResult.data.map((row) => ({
    id: row.id,
    type: "visit",
    title: "Visit activity",
    detail: row.completed_at
      ? `Visit completed ${new Date(row.completed_at).toLocaleString()}`
      : row.started_at
      ? `Visit started ${new Date(row.started_at).toLocaleString()}`
      : "Visit created",
    occurredAt: row.completed_at ?? row.started_at ?? row.created_at,
    status: row.status,
    actorId: row.assigned_staff_id,
  }));

  const noteEvents: PatientTimelineEvent[] = notesResult.data.map((row) => ({
    id: row.id,
    type: "note",
    title: "Clinical note logged",
    detail: row.note,
    occurredAt: row.created_at,
    status: null,
    actorId: row.created_by,
  }));

  return [...appointmentEvents, ...visitEvents, ...noteEvents].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
  );
}

export async function listPatientCareTeam(
  supabase: SupabaseClient<Database>,
  orgId: string,
  patientId: string
): Promise<PatientCareTeamMember[]> {
  const [appointmentAssignmentsResult, visitAssignmentsResult] = await Promise.all([
    supabase
      .from("appointments")
      .select("assigned_staff_id, starts_at")
      .eq("org_id", orgId)
      .eq("patient_id", patientId)
      .is("deleted_at", null),
    supabase
      .from("visits")
      .select("assigned_staff_id")
      .eq("org_id", orgId)
      .eq("patient_id", patientId)
      .is("deleted_at", null),
  ]);

  if (appointmentAssignmentsResult.error || visitAssignmentsResult.error) {
    throw new Error("PATIENT_CARE_TEAM_FAILED");
  }

  const assignmentMap = new Map<
    string,
    { assignmentCount: number; upcomingAppointmentAt: string | null }
  >();

  for (const row of appointmentAssignmentsResult.data) {
    if (!row.assigned_staff_id) continue;
    const existing = assignmentMap.get(row.assigned_staff_id) ?? {
      assignmentCount: 0,
      upcomingAppointmentAt: null,
    };
    const nextAppointment =
      !existing.upcomingAppointmentAt ||
      new Date(row.starts_at).getTime() < new Date(existing.upcomingAppointmentAt).getTime()
        ? row.starts_at
        : existing.upcomingAppointmentAt;
    assignmentMap.set(row.assigned_staff_id, {
      assignmentCount: existing.assignmentCount + 1,
      upcomingAppointmentAt: nextAppointment,
    });
  }

  for (const row of visitAssignmentsResult.data) {
    if (!row.assigned_staff_id) continue;
    const existing = assignmentMap.get(row.assigned_staff_id) ?? {
      assignmentCount: 0,
      upcomingAppointmentAt: null,
    };
    assignmentMap.set(row.assigned_staff_id, {
      assignmentCount: existing.assignmentCount + 1,
      upcomingAppointmentAt: existing.upcomingAppointmentAt,
    });
  }

  const staffIds = [...assignmentMap.keys()];
  if (!staffIds.length) {
    return [];
  }

  const [{ data: members, error: membersError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      supabase
        .from("organization_members")
        .select("user_id, role, status")
        .eq("org_id", orgId)
        .in("user_id", staffIds),
      supabase
        .from("profiles")
        .select("id, full_name, phone")
        .eq("org_id", orgId)
        .in("id", staffIds),
    ]);

  if (membersError || profilesError) {
    throw new Error("PATIENT_CARE_TEAM_PROFILE_FAILED");
  }

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

  const careTeam = members
    .map((member): PatientCareTeamMember | null => {
      const assignment = assignmentMap.get(member.user_id);
      if (!assignment) return null;
      const profile = profilesById.get(member.user_id);
      return {
        userId: member.user_id,
        fullName: profile?.full_name ?? null,
        phone: profile?.phone ?? null,
        role: member.role,
        status: member.status,
        assignmentCount: assignment.assignmentCount,
        upcomingAppointmentAt: assignment.upcomingAppointmentAt,
      } satisfies PatientCareTeamMember;
    })
    .filter((member): member is PatientCareTeamMember => member !== null);

  return careTeam.sort((left, right) => right.assignmentCount - left.assignmentCount);
}
