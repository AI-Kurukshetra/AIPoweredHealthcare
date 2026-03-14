import type { StaffProfile } from "@/features/staff/types";

type StaffProfileProps = {
  staff: StaffProfile;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function StaffProfile({ staff }: StaffProfileProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
        Staff Profile
      </p>
      <h2 className="mt-1 text-3xl font-semibold text-slate-950">
        {staff.fullName ?? "Unnamed Staff Member"}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Operational details for workforce management and credential compliance.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</p>
          <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
            {staff.role.replace("_", " ")}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
          <p className="mt-1 text-sm font-semibold capitalize text-slate-900">{staff.status}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {staff.phone ?? "N/A"}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Onboarded</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatDate(staff.createdAt)}
          </p>
        </article>
      </div>
    </section>
  );
}
