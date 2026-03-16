import { env } from "@/config/env";
import { createAdminClient } from "@/lib/supabase/admin";
import type { HealthcareRole } from "@/types/app.types";

function deriveFullName(email: string, fullName?: string) {
  if (fullName?.trim()) {
    return fullName.trim();
  }
  return email.split("@")[0]!.replace(/[._-]+/g, " ");
}

export async function provisionUserAccess(
  userId: string,
  email: string,
  fullName?: string,
  role?: HealthcareRole
) {
  try {
    const admin = createAdminClient();
    const name = deriveFullName(email, fullName);

    const member: {
      org_id: string;
      user_id: string;
      status: "active";
      role: HealthcareRole;
    } = {
      org_id: env.NEXT_PUBLIC_DEFAULT_ORG_ID,
      user_id: userId,
      status: "active",
      role: role ?? "patient",
    };

    await admin.from("organization_members").upsert(member, {
      onConflict: "org_id,user_id",
    });

    await admin.from("profiles").upsert(
      {
        id: userId,
        org_id: env.NEXT_PUBLIC_DEFAULT_ORG_ID,
        full_name: name,
        consent_given_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  } catch (error) {
    console.error("AUTH_PROVISIONING_FAILED", error);
  }
}
