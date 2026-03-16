"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { StaffTable } from "@/components/features/staff/StaffTable";
import { Pagination } from "@/components/shared/Pagination";
import type { StaffListItem } from "@/features/staff/types";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

type StaffManagerProps = {
  orgId: string;
  initialStaff: StaffListItem[];
};

export function StaffManager({ orgId, initialStaff }: StaffManagerProps) {
  const { data: staff = initialStaff } = useQuery({
    queryKey: queryKeys.staff(orgId, 1, 200),
    queryFn: () => apiGet<StaffListItem[]>("/api/staff", { orgId, page: 1, limit: 50 }),
    initialData: initialStaff,
  });
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(
    () =>
      staff.filter((member) => {
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
    [query, role, staff, status]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name or user id"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={role}
          onChange={(event) => {
            setRole(event.target.value);
            setPage(1);
          }}
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
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <StaffTable staff={paged} />
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
