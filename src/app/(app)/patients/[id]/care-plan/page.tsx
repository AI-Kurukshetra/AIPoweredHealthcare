import Link from "next/link";
import { notFound } from "next/navigation";

import { env } from "@/config/env";
import { createClient } from "@/lib/supabase/server";

type PatientCarePlanPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PatientCarePlanPage({ params }: PatientCarePlanPageProps) {
  const { id } = await params;
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  const supabase = await createClient();

  const [{ data: patient }, { data: notes }] = await Promise.all([
    supabase
      .from("patients")
      .select("id, first_name, last_name, care_status")
      .eq("org_id", orgId)
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("visit_notes")
      .select("id, note, created_at, vitals")
      .eq("org_id", orgId)
      .eq("patient_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (!patient) {
    notFound();
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Care Plan
          </p>
          <h2 className="text-3xl font-semibold text-slate-950">
            {patient.first_name} {patient.last_name}
          </h2>
          <p className="text-sm capitalize text-slate-600">Status: {patient.care_status}</p>
        </div>
        <Link
          href={`/patients/${patient.id}`}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Profile
        </Link>
      </div>

      {!notes?.length ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No visit-note-derived care plan entries available yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <article key={note.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">
                {new Date(note.created_at).toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-slate-900">{note.note}</p>
              <pre className="mt-3 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700">
                {JSON.stringify(note.vitals ?? {}, null, 2)}
              </pre>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
