import Link from "next/link";
import { notFound } from "next/navigation";

import { CredentialManager } from "@/components/features/staff/CredentialManager";
import { env } from "@/config/env";
import { getCredentials } from "@/features/credentials/server/get-credentials";
import { getStaff } from "@/features/staff/server/get-staff";

type StaffCredentialsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StaffCredentialsPage({ params }: StaffCredentialsPageProps) {
  const { id } = await params;
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  const [staff, credentials] = await Promise.all([
    getStaff(orgId),
    getCredentials(orgId, id),
  ]);

  const member = staff.find((entry) => entry.userId === id);
  if (!member) {
    notFound();
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Workforce Credentials
          </p>
          <h2 className="text-3xl font-semibold text-slate-950">
            {member.fullName ?? "Staff Member"}
          </h2>
          <p className="text-sm text-slate-600">{member.userId}</p>
        </div>
        <Link
          href="/staff"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Staff
        </Link>
      </div>
      <CredentialManager orgId={orgId} staffId={id} initialCredentials={credentials} />
    </section>
  );
}
