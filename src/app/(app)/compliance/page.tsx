import { ComplianceTable } from "@/components/features/compliance/ComplianceTable";
import { env } from "@/config/env";
import { getCompliance } from "@/features/compliance/server/get-compliance";

export default async function CompliancePage() {
  const records = await getCompliance(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Compliance</h2>
      <ComplianceTable records={records} />
    </section>
  );
}
