import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/config/env";
import type { Database } from "@/types/database.types";

let _adminClient: SupabaseClient<Database> | null = null;

export function createAdminClient(): SupabaseClient<Database> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SERVICE_ROLE_KEY_MISSING");
  }

  if (_adminClient) return _adminClient;

  _adminClient = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return _adminClient;
}
