import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  StaffListItem,
  StaffProfile,
  StaffWorkloadSummary,
} from "@/features/staff/types";
import type { Database } from "@/types/database.types";

export async function listStaff(
  supabase: SupabaseClient<Database>,
  orgId: string,
  options: { offset?: number; limit?: number } = {}
): Promise<StaffListItem[]> {
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 100;

  const [membersResult, profilesResult] = await Promise.all([
    supabase
      .from("organization_members")
      .select("user_id, role, status")
      .eq("org_id", orgId)
      .neq("role", "patient")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1),
    supabase
      .from("profiles")
      .select("id, full_name, phone")
      .eq("org_id", orgId),
  ]);

  if (membersResult.error) {
    throw new Error(
      `STAFF_LIST_FAILED: ${membersResult.error.message} (code: ${membersResult.error.code})`
    );
  }
  if (profilesResult.error) {
    throw new Error(
      `STAFF_PROFILE_LIST_FAILED: ${profilesResult.error.message} (code: ${profilesResult.error.code})`
    );
  }

  const members = membersResult.data;
  const profiles = profilesResult.data ?? [];

  if (!members.length) return [];

  const profilesById = new Map(profiles.map((p) => [p.id, p]));

  return members.map((member) => {
    const profile = profilesById.get(member.user_id);
    return {
      userId: member.user_id,
      fullName: profile?.full_name ?? null,
      phone: profile?.phone ?? null,
      role: member.role,
      status: member.status,
    };
  });
}

export async function getStaffMember(
  supabase: SupabaseClient<Database>,
  orgId: string,
  userId: string
): Promise<StaffProfile | null> {
  const { data: member, error: memberError } = await supabase
    .from("organization_members")
    .select("user_id, role, status, created_at")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();

  if (memberError) {
    throw new Error("STAFF_MEMBER_FAILED");
  }

  if (!member) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .eq("org_id", orgId)
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error("STAFF_PROFILE_FAILED");
  }

  return {
    userId: member.user_id,
    fullName: profile?.full_name ?? null,
    phone: profile?.phone ?? null,
    role: member.role,
    status: member.status,
    createdAt: member.created_at,
  };
}

export async function getStaffWorkloadSummary(
  supabase: SupabaseClient<Database>,
  orgId: string,
  userId: string
): Promise<StaffWorkloadSummary> {
  const now = new Date().toISOString();
  const [appointmentsResult, completedVisitsResult, activeVisitsResult] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, starts_at", { count: "exact" })
      .eq("org_id", orgId)
      .eq("assigned_staff_id", userId)
      .gte("starts_at", now)
      .is("deleted_at", null)
      .order("starts_at", { ascending: true }),
    supabase
      .from("visits")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("assigned_staff_id", userId)
      .eq("status", "completed")
      .is("deleted_at", null),
    supabase
      .from("visits")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("assigned_staff_id", userId)
      .eq("status", "in_progress")
      .is("deleted_at", null),
  ]);

  if (appointmentsResult.error || completedVisitsResult.error || activeVisitsResult.error) {
    throw new Error("STAFF_WORKLOAD_FAILED");
  }

  return {
    upcomingAppointments: appointmentsResult.count ?? appointmentsResult.data.length,
    completedVisits: completedVisitsResult.count ?? 0,
    activeVisits: activeVisitsResult.count ?? 0,
    nextAppointmentAt: appointmentsResult.data[0]?.starts_at ?? null,
  };
}
