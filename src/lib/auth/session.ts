import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
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
};

export async function requireAuth(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError("UNAUTHORIZED", "Authentication required.");
  }

  return user;
}

export async function requireOrgMembership(userId: string, orgId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select("role, status")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data || data.status !== "active") {
    throw new AuthError("FORBIDDEN", "Organization access denied.");
  }

  return data.role;
}

export async function resolveAuthContext(orgId: string): Promise<AuthContext> {
  const user = await requireAuth();
  const role = await requireOrgMembership(user.id, orgId);

  return { user, orgId, role };
}
