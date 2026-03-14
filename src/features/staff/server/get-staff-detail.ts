import { createClient } from "@/lib/supabase/server";
import { getStaffMember } from "@/services/staff/staff-service";

export async function getStaffDetail(orgId: string, userId: string) {
  const supabase = await createClient();
  return getStaffMember(supabase, orgId, userId);
}
