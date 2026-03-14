import { redirect } from "next/navigation";

import { MfaSetupPanel } from "@/components/features/auth/MfaSetupPanel";
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

  const { data: assuranceData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assuranceData?.currentLevel === "aal2") {
    redirect(nextPath);
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Multi-factor authentication</h2>
      <p className="text-sm text-slate-600">
        AAL2 verification is required before accessing PHI workflows.
      </p>
      <MfaSetupPanel nextPath={nextPath} />
    </div>
  );
}
