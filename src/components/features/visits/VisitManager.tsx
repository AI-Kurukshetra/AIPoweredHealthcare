"use client";

import { useMemo, useState } from "react";

import { VisitTable } from "@/components/features/visits/VisitTable";
import type { VisitListItem } from "@/features/visits/types";

type ApiResponse<T> = { data: T | null; error: { message: string } | null };

type VisitManagerProps = {
  orgId: string;
  initialVisits: VisitListItem[];
};

export function VisitManager({ orgId, initialVisits }: VisitManagerProps) {
  const [visits, setVisits] = useState(initialVisits);
  const [patientId, setPatientId] = useState("");
  const [status, setStatus] = useState<"scheduled" | "in_progress" | "completed" | "cancelled">(
    "in_progress"
  );
  const [filter, setFilter] = useState("all");
  const [selectedVisitId, setSelectedVisitId] = useState("");
  const [updateStatus, setUpdateStatus] = useState<"scheduled" | "in_progress" | "completed" | "cancelled">(
    "completed"
  );
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () => visits.filter((visit) => (filter === "all" ? true : visit.status === filter)),
    [visits, filter]
  );

  async function createVisit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/visits?orgId=${orgId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ patientId, status }),
      });
      const payload = (await response.json()) as ApiResponse<VisitListItem>;
      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Unable to create visit.");
        return;
      }
      setVisits((current) => [payload.data!, ...current]);
      setPatientId("");
    } catch {
      setError("Unable to create visit.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateVisit() {
    if (!selectedVisitId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/visits/${selectedVisitId}?orgId=${orgId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: updateStatus,
          completedAt: updateStatus === "completed" ? new Date().toISOString() : null,
          note: note || undefined,
        }),
      });
      const payload = (await response.json()) as ApiResponse<VisitListItem>;
      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Unable to update visit.");
        return;
      }
      setVisits((current) =>
        current.map((visit) => (visit.id === payload.data!.id ? payload.data! : visit))
      );
      setNote("");
    } catch {
      setError("Unable to update visit.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <input
          value={patientId}
          onChange={(event) => setPatientId(event.target.value)}
          placeholder="Patient UUID"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          type="button"
          onClick={createVisit}
          disabled={isSubmitting || !patientId.trim()}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Add Visit"}
        </button>
      </div>
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <select
          value={selectedVisitId}
          onChange={(event) => setSelectedVisitId(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Select visit to update</option>
          {visits.map((visit) => (
            <option key={visit.id} value={visit.id}>
              {visit.id}
            </option>
          ))}
        </select>
        <select
          value={updateStatus}
          onChange={(event) => setUpdateStatus(event.target.value as typeof updateStatus)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional visit note"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={updateVisit}
          disabled={isSubmitting || !selectedVisitId}
          className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update Visit"}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <VisitTable visits={filtered} />
    </div>
  );
}
