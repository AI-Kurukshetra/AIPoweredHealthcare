import Link from "next/link";

import { EmptyState } from "@/components/shared/EmptyState";
import type { StaffListItem } from "@/features/staff/types";

type StaffTableProps = {
  staff: StaffListItem[];
};

export function StaffTable({ staff }: StaffTableProps) {
  if (!staff.length) {
    return (
      <EmptyState
        title="No staff members yet"
        description="Staff assignments and roles will appear after onboarding."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      <table className="min-w-[720px] text-left text-sm">
        <thead className="bg-slate-100/70">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700">Staff</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Role</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-700">User ID</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr
              key={member.userId}
              className="border-t border-slate-100/80 transition hover:bg-slate-50/80"
            >
              <td className="px-4 py-3 text-slate-900">
                {member.fullName ?? "Unspecified"}{" "}
                <span className="text-xs text-slate-500">{member.phone ?? ""}</span>
              </td>
              <td className="px-4 py-3 capitalize text-slate-700">
                {member.role.replace("_", " ")}
              </td>
              <td className="px-4 py-3 capitalize text-slate-700">{member.status}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">
                <Link
                  href={`/staff/${member.userId}`}
                  className="text-cyan-700 hover:text-cyan-800"
                >
                  {member.userId}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
