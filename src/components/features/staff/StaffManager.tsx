"use client";

import { useMemo, useState } from "react";

import { StaffTable } from "@/components/features/staff/StaffTable";
import type { StaffListItem } from "@/features/staff/types";

type StaffManagerProps = {
  initialStaff: StaffListItem[];
};

export function StaffManager({ initialStaff }: StaffManagerProps) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(
    () =>
      initialStaff.filter((member) => {
        const matchesQuery =
          !query.trim() ||
          (member.fullName ?? "")
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          member.userId.toLowerCase().includes(query.toLowerCase());
        const matchesRole = role === "all" || member.role === role;
        const matchesStatus = status === "all" || member.status === status;
        return matchesQuery && matchesRole && matchesStatus;
      }),
    [initialStaff, query, role, status]
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or user id"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All roles</option>
          <option value="org_admin">Org Admin</option>
          <option value="care_coordinator">Care Coordinator</option>
          <option value="field_nurse">Field Nurse</option>
          <option value="billing_staff">Billing Staff</option>
          <option value="patient">Patient</option>
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <StaffTable staff={filtered} />
    </div>
  );
}
