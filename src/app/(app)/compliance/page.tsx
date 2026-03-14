import { ComplianceManager } from "@/components/features/compliance/ComplianceManager";
import { env } from "@/config/env";
import { getCompliance } from "@/features/compliance/server/get-compliance";

export default async function CompliancePage() {
  const records = await getCompliance(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Governance
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Compliance</h2>
      </div>
      <ComplianceManager
        orgId={env.NEXT_PUBLIC_DEFAULT_ORG_ID}
        initialRecords={records}
      />
    </section>
  );
}
