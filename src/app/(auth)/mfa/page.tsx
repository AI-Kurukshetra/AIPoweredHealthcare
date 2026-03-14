import { redirect } from "next/navigation";

import { MfaSetupPanel } from "@/components/features/auth/MfaSetupPanel";
import { AuthSplitLayout } from "@/components/layout/AuthSplitLayout";
import { isMfaEnforced } from "@/config/env";
import { createClient } from "@/lib/supabase/server";

type MfaPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function MfaPage({ searchParams }: MfaPageProps) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/dashboard";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (!isMfaEnforced) {
    redirect(nextPath);
  }

  const { data: assuranceData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assuranceData?.currentLevel === "aal2") {
    redirect(nextPath);
  }

  return (
    <AuthSplitLayout
      badge="Identity Verification"
      title="Complete multi-factor authentication"
      description="AAL2 verification is required before access to PHI workflows and clinical operations."
    >
      <div className="w-full max-w-xl space-y-4">
        <MfaSetupPanel nextPath={nextPath} />
      </div>
    </AuthSplitLayout>
  );
}
