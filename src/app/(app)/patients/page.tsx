import { PatientManager } from "@/components/features/patients/PatientManager";
import { env } from "@/config/env";
import { getPatients } from "@/features/patients/server/get-patients";

export default async function PatientsPage() {
  const patients = await getPatients(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Care Registry
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Patients</h2>
      </div>
      <PatientManager
        orgId={env.NEXT_PUBLIC_DEFAULT_ORG_ID}
        initialPatients={patients}
      />
    </section>
  );
}
