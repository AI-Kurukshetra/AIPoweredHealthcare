import { VisitManager } from "@/components/features/visits/VisitManager";
import { env } from "@/config/env";
import { getVisits } from "@/features/visits/server/get-visits";

export default async function VisitsPage() {
  const visits = await getVisits(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Field Operations
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Visits</h2>
      </div>
      <VisitManager orgId={env.NEXT_PUBLIC_DEFAULT_ORG_ID} initialVisits={visits} />
    </section>
  );
}
