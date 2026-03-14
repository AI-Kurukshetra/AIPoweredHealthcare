import { ComplianceIncidentsManager } from "@/components/features/compliance/ComplianceIncidentsManager";
import { env } from "@/config/env";
import { getIncidents } from "@/features/incidents/server/get-incidents";

export default async function ComplianceIncidentsPage() {
  const incidents = await getIncidents(env.NEXT_PUBLIC_DEFAULT_ORG_ID);
  const complianceIncidents = incidents.filter(
    (incident) => incident.status !== "resolved"
  );

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Governance
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Compliance Incidents</h2>
      </div>
      <p className="text-sm text-slate-600">
        Open and pending operational incidents requiring compliance review.
      </p>
      <ComplianceIncidentsManager initialIncidents={complianceIncidents} />
    </section>
  );
}
