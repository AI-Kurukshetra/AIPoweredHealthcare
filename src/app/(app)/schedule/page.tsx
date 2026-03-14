import Link from "next/link";

import { ScheduleManager } from "@/components/features/schedules/ScheduleManager";
import { env } from "@/config/env";
import { getSchedules } from "@/features/schedules/server/get-schedules";

export default async function SchedulePage() {
  const schedules = await getSchedules(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Coordination
          </p>
          <h2 className="text-3xl font-semibold text-slate-950">Schedule</h2>
        </div>
        <Link
          href="/schedule/auto-assign"
          className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-800 transition hover:-translate-y-0.5 hover:bg-cyan-100"
        >
          Auto Assign
        </Link>
      </div>
      <ScheduleManager
        orgId={env.NEXT_PUBLIC_DEFAULT_ORG_ID}
        initialSchedules={schedules}
      />
    </section>
  );
}
