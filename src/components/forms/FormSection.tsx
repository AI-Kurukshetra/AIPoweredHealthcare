import type { ReactNode } from "react";

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
