import { EmptyState } from "@/components/shared/EmptyState";
import type { ScheduleListItem } from "@/features/schedules/types";

type ScheduleTableProps = {
  schedules: ScheduleListItem[];
};

export function ScheduleTable({ schedules }: ScheduleTableProps) {
  if (!schedules.length) {
    return (
      <EmptyState
        title="No schedules yet"
        description="Upcoming appointments will appear here for coordination."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100/70">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700">Patient ID</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Staff ID</th>
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
              <td className="px-4 py-3 font-mono text-xs text-slate-600">
                {schedule.patientId}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">
                {schedule.assignedStaffId ?? "Unassigned"}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {new Date(schedule.startsAt).toLocaleString()} -{" "}
                {new Date(schedule.endsAt).toLocaleString()}
              </td>
              <td className="px-4 py-3 capitalize text-slate-700">{schedule.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
