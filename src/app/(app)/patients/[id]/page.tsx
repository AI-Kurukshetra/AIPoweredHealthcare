import { notFound } from "next/navigation";
import Link from "next/link";

import { EmptyState } from "@/components/shared/EmptyState";
import { PatientProfileEditor } from "@/components/features/patients/PatientProfileEditor";
import { env } from "@/config/env";
import {
  getPatientDetail,
  getPatientVisits,
} from "@/features/patients/server/get-patient-detail";

type PatientPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString();
}

export default async function PatientDetailPage({ params }: PatientPageProps) {
  const { id } = await params;
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  const [patient, visits] = await Promise.all([
    getPatientDetail(orgId, id),
    getPatientVisits(orgId, id),
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

      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Patient Profile
        </p>
        <h2 className="mt-1 text-3xl font-semibold text-slate-950">
          {patient.firstName} {patient.lastName}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Longitudinal patient operations record and recent visit activity.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Care Status
            </p>
            <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
              {patient.careStatus}
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Phone
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {patient.phone ?? "N/A"}
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Created
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatDate(patient.createdAt)}
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Last Updated
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatDate(patient.updatedAt)}
            </p>
          </article>
        </div>
      </div>

      <PatientProfileEditor orgId={orgId} patient={patient} />

      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-slate-950">Recent Visits</h3>
        {!visits.length ? (
          <EmptyState
            title="No visits found"
            description="This patient has no documented visits in the current organization."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/70">
                <tr>
                  <th className="px-4 py-3 font-semibold tracking-wide text-slate-700">
                    Visit ID
                  </th>
                  <th className="px-4 py-3 font-semibold tracking-wide text-slate-700">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold tracking-wide text-slate-700">
                    Staff
                  </th>
                  <th className="px-4 py-3 font-semibold tracking-wide text-slate-700">
                    Started
                  </th>
                  <th className="px-4 py-3 font-semibold tracking-wide text-slate-700">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr
                    key={visit.id}
                    className="border-t border-slate-100/80 transition hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{visit.id}</td>
                    <td className="px-4 py-3 capitalize text-slate-900">
                      {visit.status.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {visit.assignedStaffId ?? "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(visit.startedAt)}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(visit.completedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
