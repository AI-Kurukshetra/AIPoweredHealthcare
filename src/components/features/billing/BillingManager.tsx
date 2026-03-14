"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BillingTable } from "@/components/features/billing/BillingTable";
import { InvoiceView } from "@/components/features/billing/InvoiceView";
import { PaymentStatus } from "@/components/features/billing/PaymentStatus";
import { Pagination } from "@/components/shared/Pagination";
import type { BillingRecordListItem } from "@/features/billing/types";
import { apiGet, apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

type BillingManagerProps = {
  orgId: string;
  initialRecords: BillingRecordListItem[];
};

export function BillingManager({ orgId, initialRecords }: BillingManagerProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { data: records = initialRecords } = useQuery({
    queryKey: queryKeys.billing(orgId, 1, 200),
    queryFn: () => apiGet<BillingRecordListItem[]>("/api/billing", { orgId, page: 1, limit: 200 }),
    initialData: initialRecords,
  });
  const [visitId, setVisitId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [cptCode, setCptCode] = useState("");
  const [icd10Code, setIcd10Code] = useState("");
  const [amount, setAmount] = useState("");
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

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  async function createBillingRecord() {
    const amountCents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await createBillingMutation.mutateAsync({
          visitId: visitId || undefined,
          patientId: patientId || undefined,
          cptCode,
          icd10Code: icd10Code || undefined,
          amountCents,
      });
      setVisitId("");
      setPatientId("");
      setCptCode("");
      setIcd10Code("");
      setAmount("");
    } catch {
      // handled in mutation onError
    } finally {
      setIsSubmitting(false);
    }
  }

  const createBillingMutation = useMutation({
    mutationFn: (input: {
      visitId?: string;
      patientId?: string;
      cptCode: string;
      icd10Code?: string;
      amountCents: number;
    }) => apiPost<BillingRecordListItem>("/api/billing", input, { orgId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["billing", orgId] });
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message || "Unable to create billing record.");
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-6">
        <input
          value={visitId}
          onChange={(event) => setVisitId(event.target.value)}
          placeholder="Visit UUID"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={patientId}
          onChange={(event) => setPatientId(event.target.value)}
          placeholder="Patient UUID"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={cptCode}
          onChange={(event) => setCptCode(event.target.value)}
          placeholder="CPT code"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={icd10Code}
          onChange={(event) => setIcd10Code(event.target.value)}
          placeholder="ICD-10"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Amount (USD)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={createBillingRecord}
          disabled={isSubmitting || !cptCode.trim() || !amount.trim()}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Add Billing"}
        </button>
      </div>

      <div className="max-w-xs">
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="paid">Paid</option>
          <option value="denied">Denied</option>
        </select>
      </div>

      <PaymentStatus records={records} />

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <BillingTable records={paged} />
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      <InvoiceView />
    </div>
  );
}
