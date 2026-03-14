import Link from "next/link";

import { AutoAssignPanel } from "@/components/features/schedules/AutoAssignPanel";

export default function ScheduleAutoAssignPage() {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Coordination
          </p>
          <h2 className="text-3xl font-semibold text-slate-950">Schedule Auto Assign</h2>
        </div>
        <Link
          href="/schedule"
          className="text-sm font-medium text-slate-600 hover:text-cyan-800"
        >
          Back to Schedule
        </Link>
      </div>
      <AutoAssignPanel />
    </section>
  );
}
