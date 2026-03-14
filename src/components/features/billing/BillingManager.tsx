"use client";

import { useMemo, useState } from "react";

import { BillingTable } from "@/components/features/billing/BillingTable";
import type { BillingRecordListItem } from "@/features/billing/types";

type ApiResponse<T> = { data: T | null; error: { message: string } | null };

type BillingManagerProps = {
  orgId: string;
  initialRecords: BillingRecordListItem[];
};

export function BillingManager({ orgId, initialRecords }: BillingManagerProps) {
  const [records, setRecords] = useState(initialRecords);
  const [visitId, setVisitId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [cptCode, setCptCode] = useState("");
  const [icd10Code, setIcd10Code] = useState("");
  const [amount, setAmount] = useState("");
  const [filter, setFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () => records.filter((record) => (filter === "all" ? true : record.status === filter)),
    [records, filter]
  );

  async function createBillingRecord() {
    const amountCents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/billing?orgId=${orgId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          visitId: visitId || undefined,
          patientId: patientId || undefined,
          cptCode,
          icd10Code: icd10Code || undefined,
          amountCents,
        }),
      });
      const payload = (await response.json()) as ApiResponse<BillingRecordListItem>;
      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Unable to create billing record.");
        return;
      }
      setRecords((current) => [payload.data!, ...current]);
      setVisitId("");
      setPatientId("");
      setCptCode("");
      setIcd10Code("");
      setAmount("");
    } catch {
      setError("Unable to create billing record.");
    } finally {
      setIsSubmitting(false);
    }
  }

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

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <BillingTable records={filtered} />
    </div>
  );
}
