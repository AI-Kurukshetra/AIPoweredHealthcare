import { createAdminClient } from "@/lib/supabase/admin";
import { listSchedules } from "@/services/schedules/schedule-service";

export async function getSchedules(orgId: string) {
  const supabase = createAdminClient();
  return listSchedules(supabase, orgId);
}
