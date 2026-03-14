import { createClient } from "@/lib/supabase/server";
import { listComplianceRecords } from "@/services/compliance/compliance-service";

export async function getCompliance(orgId: string) {
  const supabase = await createClient();
  return listComplianceRecords(supabase, orgId);
}
