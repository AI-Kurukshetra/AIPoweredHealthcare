import { VisitTable } from "@/components/features/visits/VisitTable";
import { env } from "@/config/env";
import { getVisits } from "@/features/visits/server/get-visits";

export default async function VisitsPage() {
  const visits = await getVisits(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Visits</h2>
      <VisitTable visits={visits} />
    </section>
  );
}
