import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/features/auth/LoginForm";
import { AuthSplitLayout } from "@/components/layout/AuthSplitLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/dashboard";

  return (
    <AuthSplitLayout
      badge="Secure Access"
      title="Healthcare Workforce Platform"
      description="Sign in to coordinate scheduling, compliance, and patient operations from a single secure workspace."
    >
      <Card className="auth-card mx-auto w-full max-w-md">
        <CardHeader>
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to access secure clinical operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm nextPath={nextPath} />

          <p className="mt-5 text-center text-sm text-slate-600">
            New here?{" "}
            <Link
              className="font-semibold text-cyan-700 hover:text-cyan-600"
              href={`/signup?next=${encodeURIComponent(nextPath)}`}
            >
              Create account
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthSplitLayout>
  );
}
