import { createClient } from "@/lib/supabase/server";
import { listSchedules } from "@/services/schedules/schedule-service";

export async function getSchedules(orgId: string) {
  const supabase = await createClient();
  return listSchedules(supabase, orgId);
}
