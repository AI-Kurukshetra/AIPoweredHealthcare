"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, ClipboardCheck, FileText, HeartPulse, Search } from "lucide-react";

import { VisitForm } from "@/components/features/visits/VisitForm";
import { VisitTable } from "@/components/features/visits/VisitTable";
import { Pagination } from "@/components/shared/Pagination";
import type { PatientListItem } from "@/features/patients/types";
import type { StaffListItem } from "@/features/staff/types";
import type { VisitListItem } from "@/features/visits/types";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { useToast } from "@/hooks/useToast";
type VisitStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

type VisitManagerProps = {
  orgId: string;
  initialVisits: VisitListItem[];
  patients: PatientListItem[];
  staff: StaffListItem[];
};

type VitalsForm = {
  systolic: string;
  diastolic: string;
  pulse: string;
  temperature: string;
  spo2: string;
};

const emptyVitals: VitalsForm = {
  systolic: "",
  diastolic: "",
  pulse: "",
  temperature: "",
  spo2: "",
};

function normalizeVitals(vitals: VitalsForm) {
  const entries = Object.entries(vitals).filter(([, value]) => value.trim());
  if (!entries.length) return undefined;
  return Object.fromEntries(entries);
}

function statusTone(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "in_progress":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export function VisitManager({ orgId, initialVisits, patients, staff }: VisitManagerProps) {
  const queryClient = useQueryClient();
  const [visits, setVisits] = useState(initialVisits);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | VisitStatus>("all");
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [assignedStaffId, setAssignedStaffId] = useState("");
  const [status, setStatus] = useState<VisitStatus>("scheduled");
  const [note, setNote] = useState("");
  const [vitals, setVitals] = useState<VitalsForm>(emptyVitals);
  const [selectedVisitId, setSelectedVisitId] = useState("");
  const [updateStatus, setUpdateStatus] = useState<VisitStatus>("completed");
  const [updateNote, setUpdateNote] = useState("");
  const [updateVitals, setUpdateVitals] = useState<VitalsForm>(emptyVitals);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: fetchedVisits = initialVisits } = useQuery({
    queryKey: queryKeys.visits(orgId, 1, 200),
    queryFn: () => apiGet<VisitListItem[]>("/api/visits", { orgId, page: 1, limit: 50 }),
    initialData: initialVisits,
  });

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    setVisits(fetchedVisits);
  }, [fetchedVisits]);

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
      visits.filter((visit) => {
        const patientName = patientNameMap[visit.patientId] ?? visit.patientId;
        const matchesSearch = `${patientName} ${visit.id}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus = filter === "all" ? true : visit.status === filter;
        return matchesSearch && matchesStatus;
      }),
    [filter, patientNameMap, search, visits]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectedVisit = useMemo(
    () => visits.find((visit) => visit.id === selectedVisitId) ?? null,
    [selectedVisitId, visits]
  );

  const visitSummary = useMemo(
    () => ({
      total: visits.length,
      completed: visits.filter((visit) => visit.status === "completed").length,
      inProgress: visits.filter((visit) => visit.status === "in_progress").length,
      pendingDocumentation: visits.filter(
        (visit) => visit.status === "completed" && !visit.completedAt
      ).length,
    }),
    [visits]
  );

  const createVisitMutation = useMutation({
    mutationFn: (payload: {
      patientId: string;
      assignedStaffId?: string;
      status: VisitStatus;
      startedAt?: string;
      completedAt?: string;
      note?: string;
      vitals?: Record<string, string>;
    }) => apiPost<VisitListItem>("/api/visits", payload, { orgId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["visits", orgId] });
      showSuccess({
        title: "Visit created",
        description: "The visit has been added to the queue.",
      });
    },
  });

  const updateVisitMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      status: VisitStatus;
      startedAt?: string | null;
      completedAt?: string | null;
      note?: string;
      vitals?: Record<string, string>;
    }) =>
      apiPatch<VisitListItem>(`/api/visits/${payload.id}`, payload, {
        orgId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["visits", orgId] });
      showSuccess({
        title: "Visit updated",
        description: "Visit status and details have been updated.",
      });
    },
  });

  async function createVisit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const startedAt =
        status === "in_progress" || status === "completed" ? new Date().toISOString() : undefined;
      const completedAt = status === "completed" ? new Date().toISOString() : undefined;
      const createdVisit = await createVisitMutation.mutateAsync({
          patientId,
          assignedStaffId: assignedStaffId || undefined,
          status,
          startedAt,
          completedAt,
          note: note || undefined,
          vitals: normalizeVitals(vitals),
      });
      setVisits((current) => [createdVisit, ...current]);
      setSelectedVisitId(createdVisit.id);
      setStatus("scheduled");
      setAssignedStaffId("");
      setNote("");
      setVitals(emptyVitals);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : "Unable to create visit.";
      setError(message);
      showError({
        title: "Visit not created",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateVisit() {
    if (!selectedVisitId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const updatedVisit = await updateVisitMutation.mutateAsync({
        id: selectedVisitId,
          status: updateStatus,
          startedAt:
            updateStatus === "in_progress"
              ? selectedVisit?.startedAt ?? now
              : updateStatus === "scheduled"
              ? null
              : undefined,
          completedAt:
            updateStatus === "completed"
              ? selectedVisit?.completedAt ?? now
              : updateStatus === "cancelled" || updateStatus === "in_progress"
              ? null
              : undefined,
          note: updateNote || undefined,
          vitals: normalizeVitals(updateVitals),
      });
      setVisits((current) =>
        current.map((visit) => (visit.id === updatedVisit.id ? updatedVisit : visit))
      );
      setUpdateNote("");
      setUpdateVitals(emptyVitals);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : "Unable to update visit.";
      setError(message);
      showError({
        title: "Visit not updated",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Total Visits
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{visitSummary.total}</p>
        </article>
        <article className="rounded-3xl border border-emerald-200/70 bg-emerald-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Completed
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-950">{visitSummary.completed}</p>
        </article>
        <article className="rounded-3xl border border-cyan-200/70 bg-cyan-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            In Progress
          </p>
          <p className="mt-2 text-3xl font-semibold text-cyan-950">{visitSummary.inProgress}</p>
        </article>
        <article className="rounded-3xl border border-amber-200/70 bg-amber-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Follow-Up Needed
          </p>
          <p className="mt-2 text-3xl font-semibold text-amber-950">
            {visitSummary.pendingDocumentation}
          </p>
        </article>
      </div>

      <section className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            AI Voice-to-Text Visit Documentation
          </p>
        </div>
        <p className="mt-2 text-sm text-slate-600 mb-3">
          Paste or dictate your clinical notes below. We will use AI to automatically extract vitals and action items.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Patient BP 120/80 today, HR 72, temp 98.6. Follow up in one week."
          className="w-full rounded-xl border border-amber-200/60 bg-white/80 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none"
          rows={3}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled={!note || isSubmitting}
            onClick={async () => {
              try {
                setIsSubmitting(true);
                const res = await fetch("/api/ai/nlp", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ note }),
                });
                if (!res.ok) {
                  const message = "Unable to extract vitals with AI.";
                  showError({
                    title: "AI extraction failed",
                    description: message,
                  });
                  return;
                }
                const data = await res.json();
                if (data.vitals) {
                  setVitals((v) => ({ ...v, ...data.vitals }));
                  showSuccess({
                    title: "Vitals extracted",
                    description: "AI populated vitals from your note.",
                  });
                }
              } catch {
                showError({
                  title: "AI extraction failed",
                  description: "We could not reach the AI service. Try again in a moment.",
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
          >
            Extract Vitals with AI
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <VisitForm
          title="Document New Visit"
          description="Capture the patient, clinician, care note, and vitals in a single coordinator workflow."
        >
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
                Visit Status
              </label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as VisitStatus)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Care Note
              </label>
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Brief visit summary"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              />
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-5">
            {(
              [
                ["systolic", "SBP"],
                ["diastolic", "DBP"],
                ["pulse", "Pulse"],
                ["temperature", "Temp"],
                ["spo2", "SpO2"],
              ] as const
            ).map(([key, label]) => (
              <input
                key={key}
                value={vitals[key]}
                onChange={(event) =>
                  setVitals((current) => ({ ...current, [key]: event.target.value }))
                }
                placeholder={label}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={createVisit}
              disabled={isSubmitting || !patientId}
              className="rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Create Visit"}
            </button>
          </div>
        </VisitForm>

        <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Visit Status Control</h3>
              <p className="text-sm text-slate-600">
                Advance, complete, or cancel documentation without leaving the queue.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Select Visit
              </label>
              <select
                value={selectedVisitId}
                onChange={(event) => setSelectedVisitId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
              >
                <option value="">Select visit</option>
                {visits.map((visit) => (
                  <option key={visit.id} value={visit.id}>
                    {patientNameMap[visit.patientId] ?? visit.patientId}  -  {visit.status}
                  </option>
                ))}
              </select>
            </div>

            {selectedVisit ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {patientNameMap[selectedVisit.patientId] ?? selectedVisit.patientId}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedVisit.assignedStaffId
                        ? staffNameMap[selectedVisit.assignedStaffId] ?? selectedVisit.assignedStaffId
                        : "Unassigned clinician"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusTone(
                      selectedVisit.status
                    )}`}
                  >
                    {selectedVisit.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-3 font-mono text-xs text-slate-500">{selectedVisit.id}</p>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  New Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(event) => setUpdateStatus(event.target.value as VisitStatus)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Update Note
                </label>
                <input
                  value={updateNote}
                  onChange={(event) => setUpdateNote(event.target.value)}
                  placeholder="Document what changed"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-5">
              {(
                [
                  ["systolic", "SBP"],
                  ["diastolic", "DBP"],
                  ["pulse", "Pulse"],
                  ["temperature", "Temp"],
                  ["spo2", "SpO2"],
                ] as const
              ).map(([key, label]) => (
                <input
                  key={key}
                  value={updateVitals[key]}
                  onChange={(event) =>
                    setUpdateVitals((current) => ({ ...current, [key]: event.target.value }))
                  }
                  placeholder={label}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={updateVisit}
              disabled={isSubmitting || !selectedVisitId}
              className="w-full rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Apply Visit Update"}
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Visit Queue</h3>
            <p className="text-sm text-slate-600">
              Review live visit status with patient and staff context for care continuity.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search visit or patient"
                className="rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm"
              />
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(["all", "scheduled", "in_progress", "completed", "cancelled"] as const).map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setFilter(option);
                      setPage(1);
                    }}
                    className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
                      filter === option
                        ? "bg-white text-cyan-700 shadow-sm"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {option.replace("_", " ")}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Activity className="h-4 w-4 text-cyan-600" />
              Throughput
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{filtered.length}</p>
            <p className="text-xs text-slate-500">Visits in current queue view.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="h-4 w-4 text-amber-600" />
              Documentation Focus
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {visits.filter((visit) => visit.status !== "completed").length}
            </p>
            <p className="text-xs text-slate-500">Visits still awaiting final close-out.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <HeartPulse className="h-4 w-4 text-rose-600" />
              Clinical Notes
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {visits.filter((visit) => visit.status === "completed").length}
            </p>
            <p className="text-xs text-slate-500">Completed visits ready for billing or compliance review.</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80">
          <VisitTable visits={paged} patientNames={patientNameMap} staffNames={staffNameMap} />
        </div>
        <div className="mt-4">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      </section>
    </div>
  );
}
