"use client";

import { useMemo, useState } from "react";

import { IncidentTable } from "@/components/features/incidents/IncidentTable";
import type { IncidentListItem } from "@/features/incidents/types";

type ApiResponse<T> = { data: T | null; error: { message: string } | null };

type IncidentManagerProps = {
  orgId: string;
  initialIncidents: IncidentListItem[];
};

export function IncidentManager({ orgId, initialIncidents }: IncidentManagerProps) {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [severity, setSeverity] = useState<"1" | "2" | "3" | "4" | "5">("3");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      incidents.filter((incident) =>
        filter === "all" ? true : incident.status === filter
      ),
    [incidents, filter]
  );

  async function createIncident() {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/incidents?orgId=${orgId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          severity,
          title,
          description,
          occurredAt: new Date().toISOString(),
        }),
      });
      const payload = (await response.json()) as ApiResponse<IncidentListItem>;
      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Unable to create incident.");
        return;
      }
      setIncidents((current) => [payload.data!, ...current]);
      setTitle("");
      setDescription("");
    } catch {
      setError("Unable to create incident.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-5">
        <select
          value={severity}
          onChange={(event) => setSeverity(event.target.value as typeof severity)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="1">Critical</option>
          <option value="2">Serious</option>
          <option value="3">Moderate</option>
          <option value="4">Low</option>
          <option value="5">Minor</option>
        </select>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Incident title"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2"
        />
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={createIncident}
          disabled={isSubmitting || title.trim().length < 3 || description.trim().length < 10}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Log Incident"}
        </button>
      </div>
      <div className="max-w-xs">
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <IncidentTable incidents={filtered} />
    </div>
  );
}
