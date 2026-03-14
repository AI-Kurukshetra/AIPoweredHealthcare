"use client";

import { useMemo, useState } from "react";

import { env } from "@/config/env";

type AutoAssignResponse = {
  totalCandidates: number;
  assigned: number;
  skipped: number;
  assignments: Array<{
    appointmentId: string;
    patientId: string;
    assignedStaffId: string;
  }>;
};

export function AutoAssignPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AutoAssignResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(
    () => `/api/schedules/auto-assign?orgId=${env.NEXT_PUBLIC_DEFAULT_ORG_ID}`,
    []
  );

  async function handleAutoAssign() {
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch(endpoint, { method: "POST" });
      const payload = (await response.json()) as {
        data: AutoAssignResponse | null;
        error: { message: string } | null;
      };

      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Auto-assignment failed.");
        return;
      }

      setResult(payload.data);
    } catch {
      setError("Auto-assignment failed.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-base font-semibold text-slate-900">Auto Assign</h3>
      <p className="mt-1 text-sm text-slate-600">
        Assign upcoming unassigned appointments to active field nurses.
      </p>

      <button
        type="button"
        onClick={handleAutoAssign}
        disabled={isRunning}
        className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isRunning ? "Assigning..." : "Run Auto-Assign"}
      </button>

      {error ? (
        <p className="mt-3 text-sm text-rose-700">{error}</p>
      ) : null}

      {result ? (
        <div className="mt-3 text-sm text-slate-700">
          Assigned {result.assigned} of {result.totalCandidates}. Skipped {result.skipped}.
        </div>
      ) : null}
    </section>
  );
}
