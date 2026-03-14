import { ScheduleTable } from "@/components/features/schedules/ScheduleTable";
import { env } from "@/config/env";
import { getSchedules } from "@/features/schedules/server/get-schedules";

export default async function SchedulePage() {
  const schedules = await getSchedules(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Schedule</h2>
      <ScheduleTable schedules={schedules} />
    </section>
  );
}
