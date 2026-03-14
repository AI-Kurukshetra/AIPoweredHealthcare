import type { ScheduleListItem } from "@/features/schedules/types";
import { ShiftCard } from "@/components/features/schedules/ShiftCard";

type CalendarViewProps = {
  schedules: ScheduleListItem[];
  patientNames: Record<string, string>;
  staffNames: Record<string, string>;
};

export function CalendarView({ schedules, patientNames, staffNames }: CalendarViewProps) {
  if (!schedules.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        No appointments scheduled yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {schedules.slice(0, 3).map((schedule) => (
        <ShiftCard
          key={schedule.id}
          schedule={schedule}
          patientName={patientNames[schedule.patientId] ?? schedule.patientId}
          staffName={
            schedule.assignedStaffId
              ? staffNames[schedule.assignedStaffId] ?? schedule.assignedStaffId
              : "Unassigned"
          }
        />
      ))}
    </div>
  );
}
