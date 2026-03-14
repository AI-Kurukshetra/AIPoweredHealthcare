import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export type AutoAssignResult = {
  totalCandidates: number;
  assigned: number;
  skipped: number;
  assignments: Array<{
    appointmentId: string;
    patientId: string;
    assignedStaffId: string;
  }>;
};

export async function autoAssignSchedules(
  supabase: SupabaseClient<Database>,
  orgId: string,
  userId: string
): Promise<AutoAssignResult> {
  const nowIso = new Date().toISOString();

  const [appointmentsResult, nursesResult] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, patient_id")
      .eq("org_id", orgId)
      .is("deleted_at", null)
      .is("assigned_staff_id", null)
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true })
      .limit(200),
    supabase
      .from("organization_members")
      .select("user_id")
      .eq("org_id", orgId)
      .eq("status", "active")
      .eq("role", "field_nurse")
      .order("created_at", { ascending: true }),
  ]);

  if (appointmentsResult.error || nursesResult.error) {
    throw new Error("SCHEDULE_AUTO_ASSIGN_QUERY_FAILED");
  }

  const candidates = appointmentsResult.data;
  const nurses = nursesResult.data;

  if (!candidates.length || !nurses.length) {
    return {
      totalCandidates: candidates.length,
      assigned: 0,
      skipped: candidates.length,
      assignments: [],
    };
  }

  const assignments = candidates.map((appointment, index) => ({
    appointmentId: appointment.id,
    patientId: appointment.patient_id,
    assignedStaffId: nurses[index % nurses.length]!.user_id,
  }));

  let assigned = 0;
  for (const assignment of assignments) {
    const { error } = await supabase
      .from("appointments")
      .update({
        assigned_staff_id: assignment.assignedStaffId,
        updated_by: userId,
      })
      .eq("id", assignment.appointmentId)
      .eq("org_id", orgId)
      .is("deleted_at", null);

    if (!error) {
      assigned += 1;
    }
  }

  return {
    totalCandidates: candidates.length,
    assigned,
    skipped: candidates.length - assigned,
    assignments: assignments.slice(0, assigned),
  };
}
