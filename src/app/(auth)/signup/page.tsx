import Link from "next/link";
import { UserPlus } from "lucide-react";

import { SignupForm } from "@/components/features/auth/SignupForm";
import { AuthSplitLayout } from "@/components/layout/AuthSplitLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SignupPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/dashboard";

  return (
    <AuthSplitLayout
      badge="Onboarding"
      title="Create your workforce account"
      description="Provision secure access for care coordination with MFA and role-based permissions."
    >
      <Card className="auth-card mx-auto w-full max-w-md">
        <CardHeader>
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
            <UserPlus className="h-5 w-5" />
          </div>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Start with secure login and MFA verification.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm nextPath={nextPath} />

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              className="font-semibold text-cyan-700 hover:text-cyan-600"
              href={`/login?next=${encodeURIComponent(nextPath)}`}
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthSplitLayout>
  );
}
