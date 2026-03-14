type PatientPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PatientDetailPage({ params }: PatientPageProps) {
  const { id } = await params;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Patient Detail</h2>
      <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
        Selected patient UUID: <span className="font-mono">{id}</span>
      </p>
    </section>
  );
}
