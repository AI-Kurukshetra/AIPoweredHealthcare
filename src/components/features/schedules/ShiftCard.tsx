import type { ScheduleListItem } from "@/features/schedules/types";

type ShiftCardProps = {
  schedule: ScheduleListItem;
  patientName: string;
  staffName: string;
};

export function ShiftCard({ schedule, patientName, staffName }: ShiftCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{patientName}</p>
      <p className="mt-1 text-xs text-slate-500">{staffName}</p>
      <p className="mt-3 text-xs text-slate-600">
        {new Date(schedule.startsAt).toLocaleString()} -{" "}
        {new Date(schedule.endsAt).toLocaleString()}
      </p>
      <span className="mt-3 inline-flex rounded-full border border-slate-200 px-2.5 py-1 text-xs capitalize text-slate-600">
        {schedule.status}
      </span>
    </article>
  );
}
