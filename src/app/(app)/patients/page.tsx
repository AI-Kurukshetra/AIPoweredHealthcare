import { PatientTable } from "@/components/features/patients/PatientTable";
import { env } from "@/config/env";
import { getPatients } from "@/features/patients/server/get-patients";

export default async function PatientsPage() {
  const patients = await getPatients(env.NEXT_PUBLIC_DEFAULT_ORG_ID);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Patients</h2>
      <PatientTable patients={patients} />
    </section>
  );
}
