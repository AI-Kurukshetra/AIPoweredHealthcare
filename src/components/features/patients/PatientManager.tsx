"use client";

import { useMemo, useState } from "react";

import type { PatientListItem } from "@/features/patients/types";
import { PatientTable } from "@/components/features/patients/PatientTable";

type ApiResponse<T> = { data: T | null; error: { message: string } | null };

type PatientManagerProps = {
  orgId: string;
  initialPatients: PatientListItem[];
};

export function PatientManager({ orgId, initialPatients }: PatientManagerProps) {
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      patients.filter((patient) =>
        `${patient.firstName} ${patient.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [patients, search]
  );

  async function createPatient() {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/patients?orgId=${orgId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: phone || undefined,
        }),
      });
      const payload = (await response.json()) as ApiResponse<PatientListItem>;
      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Unable to create patient.");
        return;
      }
      setPatients((current) => [payload.data!, ...current]);
      setFirstName("");
      setLastName("");
      setPhone("");
    } catch {
      setError("Unable to create patient.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-5">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search patient"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder="First name"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          placeholder="Last name"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Phone"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={createPatient}
          disabled={isSubmitting || !firstName.trim() || !lastName.trim()}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Add Patient"}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <PatientTable patients={filtered} />
    </div>
  );
}
