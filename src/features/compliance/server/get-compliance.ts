import { createAdminClient } from "@/lib/supabase/admin";
import { listComplianceRecords } from "@/services/compliance/compliance-service";

export async function getCompliance(orgId: string) {
  const supabase = createAdminClient();
  return listComplianceRecords(supabase, orgId);
}
