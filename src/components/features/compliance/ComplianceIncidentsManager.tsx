 "use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { IncidentTable } from "@/components/features/incidents/IncidentTable";
import type { IncidentListItem } from "@/features/incidents/types";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

type ComplianceIncidentsManagerProps = {
  orgId: string;
  initialIncidents: IncidentListItem[];
};

export function ComplianceIncidentsManager({
  orgId,
  initialIncidents,
}: ComplianceIncidentsManagerProps) {
  const [status, setStatus] = useState("open");
  const [severity, setSeverity] = useState("all");
  const { data: incidentsData = initialIncidents } = useQuery({
    queryKey: queryKeys.incidents(orgId, 1, 200),
    queryFn: () => apiGet<IncidentListItem[]>("/api/incidents", { orgId, page: 1, limit: 50 }),
    initialData: initialIncidents,
  });
  const incidents = useMemo(
    () => incidentsData.filter((incident) => incident.status !== "resolved"),
    [incidentsData]
  );

  const filtered = useMemo(
    () =>
      incidents.filter((incident) => {
        const matchesStatus = status === "all" ? true : incident.status === status;
        const matchesSeverity = severity === "all" ? true : incident.severity === severity;
        return matchesStatus && matchesSeverity;
      }),
    [incidents, severity, status]
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={severity}
          onChange={(event) => setSeverity(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All severity</option>
          <option value="1">S1</option>
          <option value="2">S2</option>
          <option value="3">S3</option>
          <option value="4">S4</option>
          <option value="5">S5</option>
        </select>
      </div>
      <IncidentTable incidents={filtered} />
    </div>
  );
}
