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
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700">Staff</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Role</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
            <th className="px-4 py-3 font-semibold text-slate-700">User ID</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr key={member.userId} className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-900">
                {member.fullName ?? "Unspecified"}{" "}
                <span className="text-xs text-slate-500">{member.phone ?? ""}</span>
              </td>
              <td className="px-4 py-3 capitalize text-slate-700">
                {member.role.replace("_", " ")}
              </td>
              <td className="px-4 py-3 capitalize text-slate-700">{member.status}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">{member.userId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
