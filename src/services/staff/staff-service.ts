import type { SupabaseClient } from "@supabase/supabase-js";

import type { StaffListItem } from "@/features/staff/types";
import type { Database } from "@/types/database.types";

export async function listStaff(
  supabase: SupabaseClient<Database>,
  orgId: string
): Promise<StaffListItem[]> {
  const { data: members, error: membersError } = await supabase
    .from("organization_members")
    .select("user_id, role, status")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (membersError) {
    throw new Error("STAFF_LIST_FAILED");
  }

  const userIds = members.map((member) => member.user_id);
  if (!userIds.length) {
    return [];
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .eq("org_id", orgId)
    .in("id", userIds);

  if (profilesError) {
    throw new Error("STAFF_PROFILE_LIST_FAILED");
  }

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

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
