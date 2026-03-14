import { createClient } from "@/lib/supabase/server";
import { listBillingRecords } from "@/services/billing/billing-service";

export async function getBillingRecords(orgId: string) {
  const supabase = await createClient();
  return listBillingRecords(supabase, orgId);
}
