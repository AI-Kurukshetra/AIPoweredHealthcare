import type { ReactNode } from "react";
import { Stethoscope } from "lucide-react";

type VisitFormProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function VisitForm({ title, description, children }: VisitFormProps) {
  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
          <Stethoscope className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
