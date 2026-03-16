"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ComplianceDashboard } from "@/components/features/compliance/ComplianceDashboard";
import { ExpiryAlerts } from "@/components/features/compliance/ExpiryAlerts";
import { ComplianceTable } from "@/components/features/compliance/ComplianceTable";
import { Pagination } from "@/components/shared/Pagination";
import type { ComplianceListItem } from "@/features/compliance/types";
import { apiGet, apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

type ComplianceManagerProps = {
  orgId: string;
  initialRecords: ComplianceListItem[];
};

export function ComplianceManager({ orgId, initialRecords }: ComplianceManagerProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { data: records = initialRecords } = useQuery({
    queryKey: queryKeys.compliance(orgId, 1, 200),
    queryFn: () => apiGet<ComplianceListItem[]>("/api/compliance", { orgId, page: 1, limit: 50 }),
    initialData: initialRecords,
  });
  const [status, setStatus] = useState("attention_required");
  const [staffId, setStaffId] = useState("");
  const [filter, setFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(
    () => records.filter((record) => (filter === "all" ? true : record.status === filter)),
    [records, filter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const createComplianceMutation = useMutation({
    mutationFn: (input: {
      status: string;
      staffId?: string;
      checkedAt: string;
      details: { source: string };
    }) => apiPost<ComplianceListItem>("/api/compliance", input, { orgId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["compliance", orgId] });
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message || "Unable to create compliance record.");
    },
  });

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  async function createRecord() {
    setIsSubmitting(true);
    setError(null);
    try {
      await createComplianceMutation.mutateAsync({
          status,
          staffId: staffId || undefined,
          checkedAt: new Date().toISOString(),
          details: { source: "manual_entry" },
      });
      setStaffId("");
    } catch {
      // handled by mutation onError
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
      <ComplianceDashboard records={records} />
      <ExpiryAlerts />

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <ComplianceTable records={paged} />
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
