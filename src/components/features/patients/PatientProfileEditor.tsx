"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { PatientDetail } from "@/features/patients/types";

type ApiResponse<T> = { data: T | null; error: { message: string } | null };

type PatientProfileEditorProps = {
  orgId: string;
  patient: PatientDetail;
};

export function PatientProfileEditor({ orgId, patient }: PatientProfileEditorProps) {
  const router = useRouter();
  const [phone, setPhone] = useState(patient.phone ?? "");
  const [careStatus, setCareStatus] = useState(patient.careStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/patients/${patient.id}?orgId=${orgId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone: phone || null,
          careStatus,
        }),
      });
      const payload = (await response.json()) as ApiResponse<PatientDetail>;
      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Unable to update patient profile.");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to update patient profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
        Update Profile
      </h3>
      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Phone"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={careStatus}
          onChange={(event) =>
            setCareStatus(event.target.value as "active" | "inactive" | "discharged")
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="discharged">Discharged</option>
        </select>
        <button
          type="button"
          onClick={save}
          disabled={isSaving}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
