import { createAdminClient } from "@/lib/supabase/admin";
import { listBillingRecords } from "@/services/billing/billing-service";

export async function getBillingRecords(orgId: string) {
  const supabase = createAdminClient();
  return listBillingRecords(supabase, orgId);
}
