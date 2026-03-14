"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CalendarPlus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { CalendarView } from "@/components/features/schedules/CalendarView";
import { ScheduleEditor } from "@/components/features/schedules/ScheduleEditor";
import { ScheduleTable } from "@/components/features/schedules/ScheduleTable";
import { Pagination } from "@/components/shared/Pagination";
import type { PatientListItem } from "@/features/patients/types";
import type { StaffListItem } from "@/features/staff/types";
import type { ScheduleListItem } from "@/features/schedules/types";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
type ScheduleStatus = "scheduled" | "confirmed" | "completed" | "cancelled";

type ScheduleManagerProps = {
  orgId: string;
  initialSchedules: ScheduleListItem[];
  patients: PatientListItem[];
  staff: StaffListItem[];
};

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function ScheduleManager({
  orgId,
  initialSchedules,
  patients,
  staff,
}: ScheduleManagerProps) {
  const queryClient = useQueryClient();
  const [schedules, setSchedules] = useState(initialSchedules);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | ScheduleStatus>("all");
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [assignedStaffId, setAssignedStaffId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [createStatus, setCreateStatus] = useState<ScheduleStatus>("scheduled");
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [reassignStaffId, setReassignStaffId] = useState("");
  const [reassignStatus, setReassignStatus] = useState<ScheduleStatus>("confirmed");
  const [editStartsAt, setEditStartsAt] = useState("");
  const [editEndsAt, setEditEndsAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: fetchedSchedules = initialSchedules } = useQuery({
    queryKey: queryKeys.schedules(orgId, 1, 200),
    queryFn: () =>
      apiGet<ScheduleListItem[]>("/api/schedules", { orgId, page: 1, limit: 200 }),
    initialData: initialSchedules,
  });

  useEffect(() => {
    setSchedules(fetchedSchedules);
  }, [fetchedSchedules]);

  const patientNameMap = useMemo(
    () =>
      Object.fromEntries(
        patients.map((patient) => [patient.id, `${patient.firstName} ${patient.lastName}`])
      ),
    [patients]
  );

  const staffNameMap = useMemo(
    () =>
      Object.fromEntries(
        staff.map((member) => [member.userId, member.fullName ?? member.userId])
      ),
    [staff]
  );

  const filtered = useMemo(
    () =>
      schedules.filter((schedule) => {
        const patientLabel = patientNameMap[schedule.patientId] ?? schedule.patientId;
        const staffLabel = schedule.assignedStaffId
          ? staffNameMap[schedule.assignedStaffId] ?? schedule.assignedStaffId
          : "unassigned";
        const haystack = `${patientLabel} ${staffLabel} ${schedule.id}`.toLowerCase();
        const matchesSearch = haystack.includes(search.toLowerCase());
        const matchesStatus = status === "all" ? true : schedule.status === status;
        return matchesSearch && matchesStatus;
      }),
    [patientNameMap, schedules, search, staffNameMap, status]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const selectedSchedule = useMemo(
    () => schedules.find((schedule) => schedule.id === selectedScheduleId) ?? null,
    [schedules, selectedScheduleId]
  );

  const conflicts = useMemo(() => {
    const byStaff = new Map<string, ScheduleListItem[]>();
    for (const schedule of schedules) {
      if (!schedule.assignedStaffId || schedule.status === "cancelled") continue;
      if (!byStaff.has(schedule.assignedStaffId)) {
        byStaff.set(schedule.assignedStaffId, []);
      }
      byStaff.get(schedule.assignedStaffId)!.push(schedule);
    }

    let count = 0;
    for (const staffSchedules of byStaff.values()) {
      const ordered = [...staffSchedules].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
      for (let i = 1; i < ordered.length; i += 1) {
        const previous = ordered[i - 1]!;
        const current = ordered[i]!;
        if (new Date(current.startsAt).getTime() < new Date(previous.endsAt).getTime()) {
          count += 1;
        }
      }
    }
    return count;
  }, [schedules]);

  const stats = useMemo(
    () => ({
      total: schedules.length,
      unassigned: schedules.filter((schedule) => !schedule.assignedStaffId).length,
      confirmed: schedules.filter((schedule) => schedule.status === "confirmed").length,
      today: schedules.filter((schedule) => {
        const date = new Date(schedule.startsAt);
        const now = new Date();
        return date.toDateString() === now.toDateString();
      }).length,
    }),
    [schedules]
  );

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const createScheduleMutation = useMutation({
    mutationFn: (payload: {
      patientId: string;
      assignedStaffId?: string;
      startsAt: string;
      endsAt: string;
      status: ScheduleStatus;
    }) => apiPost<ScheduleListItem>("/api/schedules", payload, { orgId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["schedules", orgId] });
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: (payload: {
      selectedScheduleId: string;
      assignedStaffId: string | null;
      startsAt?: string;
      endsAt?: string;
      status: ScheduleStatus;
    }) =>
      apiPatch<ScheduleListItem>(
        `/api/schedules/${payload.selectedScheduleId}`,
        {
          assignedStaffId: payload.assignedStaffId,
          startsAt: payload.startsAt,
          endsAt: payload.endsAt,
          status: payload.status,
        },
        { orgId }
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["schedules", orgId] });
    },
  });

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  async function createSchedule() {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createScheduleMutation.mutateAsync({
          patientId,
          assignedStaffId: assignedStaffId || undefined,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
          status: createStatus,
      });
      setSchedules((current) =>
        [...current, created].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      );
      setSelectedScheduleId(created.id);
      setAssignedStaffId("");
      setStartsAt("");
      setEndsAt("");
      setCreateStatus("scheduled");
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : "Unable to create schedule."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function reassignSchedule() {
    if (!selectedScheduleId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await updateScheduleMutation.mutateAsync({
        selectedScheduleId,
          assignedStaffId: reassignStaffId || null,
          startsAt: editStartsAt ? new Date(editStartsAt).toISOString() : undefined,
          endsAt: editEndsAt ? new Date(editEndsAt).toISOString() : undefined,
          status: reassignStatus,
      });
      setSchedules((current) =>
        current
          .map((schedule) => (schedule.id === updated.id ? updated : schedule))
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      );
      setSelectedScheduleId(updated.id);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : "Unable to update schedule."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function loadScheduleForEditing(scheduleId: string) {
    setSelectedScheduleId(scheduleId);
    const schedule = schedules.find((item) => item.id === scheduleId);
    if (!schedule) return;
    setReassignStaffId(schedule.assignedStaffId ?? "");
    setReassignStatus(schedule.status as ScheduleStatus);
    setEditStartsAt(toDateTimeLocal(schedule.startsAt));
    setEditEndsAt(toDateTimeLocal(schedule.endsAt));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Total Appointments
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{stats.total}</p>
        </article>
        <article className="rounded-3xl border border-cyan-200/70 bg-cyan-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Today
          </p>
          <p className="mt-2 text-3xl font-semibold text-cyan-950">{stats.today}</p>
        </article>
        <article className="rounded-3xl border border-amber-200/70 bg-amber-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Unassigned
          </p>
          <p className="mt-2 text-3xl font-semibold text-amber-950">{stats.unassigned}</p>
        </article>
        <article className="rounded-3xl border border-emerald-200/70 bg-emerald-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Confirmed
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-950">{stats.confirmed}</p>
        </article>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
              <CalendarPlus className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Create Appointment</h3>
              <p className="text-sm text-slate-600">
                Book the patient, assign a clinician, and define the visit window in one flow.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Patient
              </label>
              <select
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Assigned Staff
              </label>
              <select
                value={assignedStaffId}
                onChange={(event) => setAssignedStaffId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
              >
                <option value="">Leave unassigned</option>
                {staff.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.fullName ?? member.userId}  -  {member.role.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Starts At
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Ends At
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Initial Status
              </label>
              <select
                value={createStatus}
                onChange={(event) => setCreateStatus(event.target.value as ScheduleStatus)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={createSchedule}
              disabled={isSubmitting || !patientId || !startsAt || !endsAt}
              className="rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create Appointment"}
            </button>
          </div>
        </section>

        <ScheduleEditor
          title="Assignment Control"
          description="Reassign staff, move time windows, and resolve schedule conflicts directly."
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Select Appointment
              </label>
              <select
                value={selectedScheduleId}
                onChange={(event) => loadScheduleForEditing(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
              >
                <option value="">Select appointment</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {patientNameMap[schedule.patientId] ?? schedule.patientId}  - {" "}
                    {new Date(schedule.startsAt).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {selectedSchedule ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {patientNameMap[selectedSchedule.patientId] ?? selectedSchedule.patientId}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedSchedule.assignedStaffId
                    ? staffNameMap[selectedSchedule.assignedStaffId] ??
                      selectedSchedule.assignedStaffId
                    : "Unassigned clinician"}
                </p>
                <p className="mt-2 font-mono text-xs text-slate-500">{selectedSchedule.id}</p>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Staff
                </label>
                <select
                  value={reassignStaffId}
                  onChange={(event) => setReassignStaffId(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
                >
                  <option value="">Unassigned</option>
                  {staff.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.fullName ?? member.userId}  -  {member.role.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Status
                </label>
                <select
                  value={reassignStatus}
                  onChange={(event) => setReassignStatus(event.target.value as ScheduleStatus)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Starts At
                </label>
                <input
                  type="datetime-local"
                  value={editStartsAt}
                  onChange={(event) => setEditStartsAt(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Ends At
                </label>
                <input
                  type="datetime-local"
                  value={editEndsAt}
                  onChange={(event) => setEditEndsAt(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={reassignSchedule}
              disabled={isSubmitting || !selectedScheduleId}
              className="w-full rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Apply Assignment Update"}
            </button>
          </div>
        </ScheduleEditor>
      </div>

      <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Calendar View
            </p>
            <h3 className="text-lg font-semibold text-slate-950">Upcoming Shifts</h3>
          </div>
          <span className="text-xs text-slate-500">Next 3 appointments</span>
        </div>
        <div className="mt-4">
          <CalendarView
            schedules={filtered}
            patientNames={patientNameMap}
            staffNames={staffNameMap}
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section
          className={`rounded-3xl border p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] ${
            conflicts > 0
              ? "border-rose-200 bg-rose-50/80"
              : "border-emerald-200 bg-emerald-50/80"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`rounded-2xl p-3 ${
                conflicts > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {conflicts > 0 ? <AlertCircle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Conflict Monitor</h3>
              <p className="text-sm text-slate-600">
                Overlaps are computed locally from active appointments assigned to the same staff member.
              </p>
            </div>
          </div>
          <p className="mt-5 text-4xl font-semibold text-slate-950">{conflicts}</p>
          <p className="mt-2 text-sm text-slate-600">
            {conflicts > 0
              ? "Resolve overlaps before finalizing the day's field assignments."
              : "Current staffing windows do not overlap."}
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Master Schedule</h3>
              <p className="text-sm text-slate-600">
                Search the appointment roster with patient and staff context instead of raw identifiers.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search patient or staff"
                  className="rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm"
                />
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                {(["all", "scheduled", "confirmed", "completed", "cancelled"] as const).map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStatus(option)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
                        status === option
                          ? "bg-white text-cyan-700 shadow-sm"
                          : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <UserCheck className="h-4 w-4 text-cyan-600" />
                Staff Coverage
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{staff.length}</p>
              <p className="text-xs text-slate-500">Available organization members in roster.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Calendar className="h-4 w-4 text-amber-600" />
                Filtered View
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{filtered.length}</p>
              <p className="text-xs text-slate-500">Appointments match the active query.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <RefreshCw className="h-4 w-4 text-emerald-600" />
                Assignment Health
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {stats.total ? Math.round(((stats.total - stats.unassigned) / stats.total) * 100) : 0}%
              </p>
              <p className="text-xs text-slate-500">Appointments already linked to clinicians.</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80">
            <ScheduleTable
              schedules={paged}
              patientNames={patientNameMap}
              staffNames={staffNameMap}
            />
          </div>
          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
