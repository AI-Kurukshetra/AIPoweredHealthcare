import Link from "next/link";
import { notFound } from "next/navigation";

import { VisitDetails } from "@/components/features/visits/VisitDetails";
import { env } from "@/config/env";
import { getPatientDetail } from "@/features/patients/server/get-patient-detail";
import { getStaffDetail } from "@/features/staff/server/get-staff-detail";
import { getVisitDetail, getVisitNotes } from "@/features/visits/server/get-visit-detail";

type VisitDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function VisitDetailPage({ params }: VisitDetailPageProps) {
  const { id } = await params;
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;

  // Fetch visit + notes first (needed for patientId/staffId), then single-record lookups
  const [visit, notes] = await Promise.all([
    getVisitDetail(orgId, id),
    getVisitNotes(orgId, id),
  ]);

  if (!visit) {
    notFound();
  }

  // Fetch only the patient and staff for this visit (not full lists)
  const [patient, member] = await Promise.all([
    getPatientDetail(orgId, visit.patientId),
    visit.assignedStaffId ? getStaffDetail(orgId, visit.assignedStaffId) : Promise.resolve(null),
  ]);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Visit Record
          </p>
          <h2 className="text-3xl font-semibold text-slate-950">Visit Detail</h2>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/patients/${visit.patientId}`}
            className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-800 transition hover:bg-cyan-100"
          >
            Patient Profile
          </Link>
          <Link
            href="/visits"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back to Visits
          </Link>
        </div>
      </div>

      <VisitDetails
        visit={visit}
        patientName={
          patient ? `${patient.firstName} ${patient.lastName}` : "Unknown patient"
        }
        staffName={member?.fullName ?? member?.userId ?? "Unassigned clinician"}
        notes={notes}
      />
    </section>
  );
}
