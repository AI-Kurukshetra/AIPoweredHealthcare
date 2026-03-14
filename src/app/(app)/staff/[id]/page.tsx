import Link from "next/link";
import { notFound } from "next/navigation";

import { CredentialManager } from "@/components/features/staff/CredentialManager";
import { StaffProfile } from "@/components/features/staff/StaffProfile";
import { env } from "@/config/env";
import { getCredentials } from "@/features/credentials/server/get-credentials";
import { getStaffDetail } from "@/features/staff/server/get-staff-detail";
import { createClient } from "@/lib/supabase/server";
import { getStaffWorkloadSummary } from "@/services/staff/staff-service";

type StaffDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StaffDetailPage({ params }: StaffDetailPageProps) {
  const { id } = await params;
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  const supabase = await createClient();
  const [staff, credentials, workload] = await Promise.all([
    getStaffDetail(orgId, id),
    getCredentials(orgId, id),
    getStaffWorkloadSummary(supabase, orgId, id),
  ]);

  if (!staff) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Workforce Detail
          </p>
          <h2 className="text-3xl font-semibold text-slate-950">
            {staff.fullName ?? "Staff Member"}
          </h2>
          <p className="text-sm text-slate-600">{staff.userId}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/staff/${staff.userId}/credentials`}
            className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-800 transition hover:bg-cyan-100"
          >
            Credentials Page
          </Link>
          <Link
            href="/staff"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back to Staff
          </Link>
        </div>
      </div>

      <StaffProfile staff={staff} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Upcoming Appointments
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {workload.upcomingAppointments}
          </p>
        </article>
        <article className="rounded-3xl border border-cyan-200/70 bg-cyan-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Active Visits
          </p>
          <p className="mt-2 text-3xl font-semibold text-cyan-950">{workload.activeVisits}</p>
        </article>
        <article className="rounded-3xl border border-emerald-200/70 bg-emerald-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Completed Visits
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-950">
            {workload.completedVisits}
          </p>
        </article>
        <article className="rounded-3xl border border-amber-200/70 bg-amber-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Next Assignment
          </p>
          <p className="mt-2 text-sm font-semibold text-amber-950">
            {workload.nextAppointmentAt
              ? new Date(workload.nextAppointmentAt).toLocaleString()
              : "No upcoming assignment"}
          </p>
        </article>
      </div>

      <CredentialManager orgId={orgId} staffId={staff.userId} initialCredentials={credentials} />
    </section>
  );
}
