import { notFound } from "next/navigation";
import Link from "next/link";

import { CareTeamPanel } from "@/components/features/patients/CareTeamPanel";
import { CareTimeline } from "@/components/features/patients/CareTimeline";
import { PatientProfile } from "@/components/features/patients/PatientProfile";
import { PatientProfileEditor } from "@/components/features/patients/PatientProfileEditor";
import { VisitTimeline } from "@/components/features/patients/VisitTimeline";
import { env } from "@/config/env";
import {
  getPatientCareTeam,
  getPatientDetail,
  getPatientTimeline,
  getPatientVisits,
} from "@/features/patients/server/get-patient-detail";

type PatientPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PatientDetailPage({ params }: PatientPageProps) {
  const { id } = await params;
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  const [patient, visits, timeline, careTeam] = await Promise.all([
    getPatientDetail(orgId, id),
    getPatientVisits(orgId, id),
    getPatientTimeline(orgId, id),
    getPatientCareTeam(orgId, id),
  ]);

  if (!patient) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-end">
        <Link
          href={`/patients/${patient.id}/care-plan`}
          className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-medium text-cyan-800 hover:bg-cyan-100"
        >
          View Care Plan
        </Link>
      </div>

      <PatientProfile patient={patient} />

      <PatientProfileEditor orgId={orgId} patient={patient} />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <CareTimeline
          events={timeline}
          actorLabels={Object.fromEntries(
            careTeam.map((member) => [member.userId, member.fullName ?? member.userId])
          )}
        />
        <CareTeamPanel members={careTeam} />
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-slate-950">Recent Visits</h3>
        <VisitTimeline visits={visits} />
      </div>
    </section>
  );
}
