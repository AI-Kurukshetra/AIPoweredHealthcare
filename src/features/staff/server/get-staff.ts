import { createClient } from "@/lib/supabase/server";
import { listStaff } from "@/services/staff/staff-service";

export async function getStaff(orgId: string) {
  const supabase = await createClient();
  return listStaff(supabase, orgId);
}
