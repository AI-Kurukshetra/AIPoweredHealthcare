import { BillingManager } from "@/components/features/billing/BillingManager";
import { env } from "@/config/env";
import { getBillingRecords } from "@/features/billing/server/get-billing-records";

export default async function BillingPage() {
  const records = await getBillingRecords(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Revenue Cycle
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Billing</h2>
      </div>
      <BillingManager
        orgId={env.NEXT_PUBLIC_DEFAULT_ORG_ID}
        initialRecords={records}
      />
    </section>
  );
}
