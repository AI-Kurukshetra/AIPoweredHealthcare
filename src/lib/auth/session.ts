import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { provisionUserAccess } from "@/lib/auth/provision";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { HealthcareRole } from "@/types/app.types";

export class AuthError extends Error {
  constructor(public code: "UNAUTHORIZED" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export type AuthContext = {
  user: User;
  orgId: string;
  role: HealthcareRole;
  supabase: SupabaseClient<Database>;
};

/**
 * Resolves the full auth context for an API request using a single shared
 * Supabase client instance — avoiding the previous pattern of creating 3
 * separate clients per request (auth check + org check + route handler).
 */
export async function resolveAuthContext(orgId: string): Promise<AuthContext> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError("UNAUTHORIZED", "Authentication required.");
  }

  let { data, error } = await admin
    .from("organization_members")
    .select("role, status")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data || data.status !== "active") {
    // Auto-heal first-login provisioning gaps so RLS-protected API routes
    // can immediately read/write data for the default org.
    if (user.email) {
      await provisionUserAccess(user.id, user.email, user.user_metadata?.full_name);
      const retry = await admin
        .from("organization_members")
        .select("role, status")
        .eq("org_id", orgId)
        .eq("user_id", user.id)
        .maybeSingle();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data || data.status !== "active") {
      throw new AuthError("FORBIDDEN", "Organization access denied.");
    }
  }

  return { user, orgId, role: data.role as HealthcareRole, supabase };
}
