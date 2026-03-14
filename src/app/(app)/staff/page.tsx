import { StaffManager } from "@/components/features/staff/StaffManager";
import { env } from "@/config/env";
import { getStaff } from "@/features/staff/server/get-staff";

export default async function StaffPage() {
  const staff = await getStaff(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Workforce
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Staff</h2>
      </div>
      <StaffManager initialStaff={staff} />
    </section>
  );
}
