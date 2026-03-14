"use client";

import { useMemo, useState } from "react";

import { ScheduleTable } from "@/components/features/schedules/ScheduleTable";
import type { ScheduleListItem } from "@/features/schedules/types";

type ApiResponse<T> = { data: T | null; error: { message: string } | null };

type ScheduleManagerProps = {
  orgId: string;
  initialSchedules: ScheduleListItem[];
};

export function ScheduleManager({ orgId, initialSchedules }: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [patientId, setPatientId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [reassignStaffId, setReassignStaffId] = useState("");
  const [reassignStatus, setReassignStatus] = useState("confirmed");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      schedules.filter((schedule) => (status === "all" ? true : schedule.status === status)),
    [schedules, status]
  );

  const conflicts = useMemo(() => {
    const byStaff = new Map<string, ScheduleListItem[]>();
    for (const schedule of schedules) {
      if (!schedule.assignedStaffId) continue;
      if (!byStaff.has(schedule.assignedStaffId)) {
        byStaff.set(schedule.assignedStaffId, []);
      }
      byStaff.get(schedule.assignedStaffId)!.push(schedule);
    }

    let count = 0;
    for (const staffSchedules of byStaff.values()) {
      const ordered = [...staffSchedules].sort((a, b) =>
        a.startsAt.localeCompare(b.startsAt)
      );
      for (let i = 1; i < ordered.length; i += 1) {
        const prevEnd = new Date(ordered[i - 1]!.endsAt).getTime();
        const currStart = new Date(ordered[i]!.startsAt).getTime();
        if (currStart < prevEnd) {
          count += 1;
        }
      }
    }

    return count;
  }, [schedules]);

  async function createSchedule() {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/schedules?orgId=${orgId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          patientId,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
          status: "scheduled",
        }),
      });
      const payload = (await response.json()) as ApiResponse<ScheduleListItem>;
      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Unable to create schedule.");
        return;
      }
      setSchedules((current) => [...current, payload.data!].sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
      setPatientId("");
      setStartsAt("");
      setEndsAt("");
    } catch {
      setError("Unable to create schedule.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function reassignSchedule() {
    if (!selectedScheduleId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/schedules/${selectedScheduleId}?orgId=${orgId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assignedStaffId: reassignStaffId || null,
          status: reassignStatus,
        }),
      });
      const payload = (await response.json()) as ApiResponse<ScheduleListItem>;
      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Unable to update schedule.");
        return;
      }
      setSchedules((current) =>
        current.map((schedule) =>
          schedule.id === payload.data!.id ? payload.data! : schedule
        )
      );
      setReassignStaffId("");
    } catch {
      setError("Unable to update schedule.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-5">
        <input
          value={patientId}
          onChange={(event) => setPatientId(event.target.value)}
          placeholder="Patient UUID"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="datetime-local"
          value={startsAt}
          onChange={(event) => setStartsAt(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="datetime-local"
          value={endsAt}
          onChange={(event) => setEndsAt(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          type="button"
          onClick={createSchedule}
          disabled={isSubmitting || !patientId.trim() || !startsAt || !endsAt}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create Schedule"}
        </button>
      </div>
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <select
          value={selectedScheduleId}
          onChange={(event) => setSelectedScheduleId(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Select schedule to update</option>
          {schedules.map((schedule) => (
            <option key={schedule.id} value={schedule.id}>
              {schedule.id}
            </option>
          ))}
        </select>
        <input
          value={reassignStaffId}
          onChange={(event) => setReassignStaffId(event.target.value)}
          placeholder="Assigned staff UUID"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={reassignStatus}
          onChange={(event) => setReassignStatus(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="confirmed">Confirmed</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          type="button"
          onClick={reassignSchedule}
          disabled={isSubmitting || !selectedScheduleId}
          className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update Schedule"}
        </button>
      </div>
      <p className="text-sm text-slate-600">
        Detected overlapping staff assignments:{" "}
        <span className="font-semibold text-slate-900">{conflicts}</span>
      </p>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <ScheduleTable schedules={filtered} />
    </div>
  );
}
