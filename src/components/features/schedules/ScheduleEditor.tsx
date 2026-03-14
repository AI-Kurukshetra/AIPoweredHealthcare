import type { ReactNode } from "react";
import { Calendar } from "lucide-react";

type ScheduleEditorProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ScheduleEditor({ title, description, children }: ScheduleEditorProps) {
  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          <Calendar className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
