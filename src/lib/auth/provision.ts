import { env } from "@/config/env";
import { createAdminClient } from "@/lib/supabase/admin";

function deriveFullName(email: string, fullName?: string) {
  if (fullName?.trim()) {
    return fullName.trim();
  }
  return email.split("@")[0]!.replace(/[._-]+/g, " ");
}

export async function provisionUserAccess(
  userId: string,
  email: string,
  fullName?: string
) {
  try {
    const admin = createAdminClient();
    const name = deriveFullName(email, fullName);

    await admin.from("organization_members").upsert(
      {
        org_id: env.NEXT_PUBLIC_DEFAULT_ORG_ID,
        user_id: userId,
        role: "care_coordinator",
        status: "active",
      },
      { onConflict: "org_id,user_id" }
    );

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
