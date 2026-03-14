import { BillingTable } from "@/components/features/billing/BillingTable";
import { env } from "@/config/env";
import { getBillingRecords } from "@/features/billing/server/get-billing-records";

export default async function BillingPage() {
  const records = await getBillingRecords(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Billing</h2>
      <BillingTable records={records} />
    </section>
  );
}
