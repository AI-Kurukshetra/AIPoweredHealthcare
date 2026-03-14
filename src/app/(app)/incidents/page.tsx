import { IncidentTable } from "@/components/features/incidents/IncidentTable";
import { env } from "@/config/env";
import { getIncidents } from "@/features/incidents/server/get-incidents";

export default async function IncidentsPage() {
  const incidents = await getIncidents(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Incidents</h2>
      <IncidentTable incidents={incidents} />
    </section>
  );
}
