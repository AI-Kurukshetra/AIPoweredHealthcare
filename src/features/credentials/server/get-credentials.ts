import { createClient } from "@/lib/supabase/server";
import { listCredentials } from "@/services/credentials/credential-service";

export async function getCredentials(orgId: string, staffId?: string) {
  const supabase = await createClient();
  return listCredentials(supabase, orgId, staffId);
}
