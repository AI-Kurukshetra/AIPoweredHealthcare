"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { PatientDetail } from "@/features/patients/types";
import { apiPatch } from "@/lib/api/client";

type PatientProfileEditorProps = {
  orgId: string;
  patient: PatientDetail;
};

export function PatientProfileEditor({ orgId, patient }: PatientProfileEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState(patient.phone ?? "");
  const [careStatus, setCareStatus] = useState(patient.careStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveMutation = useMutation({
    mutationFn: () =>
      apiPatch<PatientDetail>(
        `/api/patients/${patient.id}`,
        {
          phone: phone || null,
          careStatus,
        },
        { orgId }
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["patients", orgId] });
      await queryClient.invalidateQueries({ queryKey: ["patients", orgId, patient.id] });
      router.refresh();
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message || "Unable to update patient profile.");
    },
  });

  async function save() {
    setIsSaving(true);
    setError(null);
    try {
      await saveMutation.mutateAsync();
    } catch {
      // handled by mutation onError
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
