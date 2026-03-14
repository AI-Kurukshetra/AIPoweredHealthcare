import type { PatientDetail } from "@/features/patients/types";

type PatientProfileProps = {
  patient: PatientDetail;
};

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

export function PatientProfile({ patient }: PatientProfileProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
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
    </section>
  );
}
