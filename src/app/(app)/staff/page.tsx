import { StaffTable } from "@/components/features/staff/StaffTable";
import { env } from "@/config/env";
import { getStaff } from "@/features/staff/server/get-staff";

export default async function StaffPage() {
  const staff = await getStaff(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Staff</h2>
      <StaffTable staff={staff} />
    </section>
  );
}
