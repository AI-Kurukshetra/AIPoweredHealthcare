import Link from "next/link";

import type { PatientCareTeamMember } from "@/features/patients/types";

type CareTeamPanelProps = {
  members: PatientCareTeamMember[];
};

export function CareTeamPanel({ members }: CareTeamPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Care Coordination
          </p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950">Derived Care Team</h3>
        </div>
        <p className="text-sm text-slate-500">{members.length} members</p>
      </div>

      {!members.length ? (
        <p className="mt-4 text-sm text-slate-600">
          No staff have been linked through appointments or visits for this patient yet.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {members.map((member) => (
            <article
              key={member.userId}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {member.fullName ?? "Unnamed staff member"}
                  </p>
                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {member.role.replace("_", " ")} · {member.status}
                  </p>
                </div>
                <Link
                  href={`/staff/${member.userId}`}
                  className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100"
                >
                  View Staff
                </Link>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contact
                  </p>
                  <p className="mt-1 text-sm text-slate-800">{member.phone ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Touchpoints
                  </p>
                  <p className="mt-1 text-sm text-slate-800">{member.assignmentCount}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Next Appointment
                  </p>
                  <p className="mt-1 text-sm text-slate-800">
                    {member.upcomingAppointmentAt
                      ? new Date(member.upcomingAppointmentAt).toLocaleString()
                      : "None scheduled"}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
