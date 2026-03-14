import { EmptyState } from "@/components/shared/EmptyState";
import type { ScheduleListItem } from "@/features/schedules/types";

type ScheduleTableProps = {
  schedules: ScheduleListItem[];
  patientNames?: Record<string, string>;
  staffNames?: Record<string, string>;
};

export function ScheduleTable({
  schedules,
  patientNames = {},
  staffNames = {},
}: ScheduleTableProps) {
  if (!schedules.length) {
    return (
      <EmptyState
        title="No schedules yet"
        description="Upcoming appointments will appear here for coordination."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      <table className="min-w-[720px] text-left text-sm">
        <thead className="bg-slate-100/70">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700">Patient</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Staff</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Window</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr
              key={schedule.id}
              className="border-t border-slate-100/80 transition hover:bg-slate-50/80"
            >
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">
                  {patientNames[schedule.patientId] ?? "Unknown patient"}
                </p>
                <p className="mt-1 font-mono text-xs text-slate-500">{schedule.patientId}</p>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">
                  {schedule.assignedStaffId
                    ? staffNames[schedule.assignedStaffId] ?? "Assigned clinician"
                    : "Unassigned"}
                </p>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {schedule.assignedStaffId ?? "No staff linked"}
                </p>
              </td>
              <td className="px-4 py-3 text-slate-700">
                <p>{new Date(schedule.startsAt).toLocaleString()}</p>
                <p className="mt-1 text-xs text-slate-500">
                  to {new Date(schedule.endsAt).toLocaleString()}
                </p>
              </td>
              <td className="px-4 py-3 capitalize text-slate-700">{schedule.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
