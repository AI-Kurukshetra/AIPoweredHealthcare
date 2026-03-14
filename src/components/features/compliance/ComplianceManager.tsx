"use client";

import { useMemo, useState } from "react";

import { ComplianceTable } from "@/components/features/compliance/ComplianceTable";
import type { ComplianceListItem } from "@/features/compliance/types";

type ApiResponse<T> = { data: T | null; error: { message: string } | null };

type ComplianceManagerProps = {
  orgId: string;
  initialRecords: ComplianceListItem[];
};

export function ComplianceManager({ orgId, initialRecords }: ComplianceManagerProps) {
  const [records, setRecords] = useState(initialRecords);
  const [status, setStatus] = useState("attention_required");
  const [staffId, setStaffId] = useState("");
  const [filter, setFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () => records.filter((record) => (filter === "all" ? true : record.status === filter)),
    [records, filter]
  );

  async function createRecord() {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/compliance?orgId=${orgId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status,
          staffId: staffId || undefined,
          checkedAt: new Date().toISOString(),
          details: { source: "manual_entry" },
        }),
      });
      const payload = (await response.json()) as ApiResponse<ComplianceListItem>;
      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Unable to create compliance record.");
        return;
      }
      setRecords((current) => [payload.data!, ...current]);
      setStaffId("");
    } catch {
      setError("Unable to create compliance record.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="compliant">Compliant</option>
          <option value="attention_required">Attention Required</option>
          <option value="review_pending">Review Pending</option>
        </select>
        <input
          value={staffId}
          onChange={(event) => setStaffId(event.target.value)}
          placeholder="Staff UUID (optional)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="compliant">Compliant</option>
          <option value="attention_required">Attention Required</option>
          <option value="review_pending">Review Pending</option>
        </select>
        <button
          type="button"
          onClick={createRecord}
          disabled={isSubmitting || !status}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Add Record"}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <ComplianceTable records={filtered} />
    </div>
  );
}
