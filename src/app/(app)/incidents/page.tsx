import { IncidentManager } from "@/components/features/incidents/IncidentManager";
import { env } from "@/config/env";
import { getIncidents } from "@/features/incidents/server/get-incidents";

export default async function IncidentsPage() {
  const incidents = await getIncidents(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Safety Management
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Incidents</h2>
      </div>
      <IncidentManager
        orgId={env.NEXT_PUBLIC_DEFAULT_ORG_ID}
        initialIncidents={incidents}
      />
    </section>
  );
}
