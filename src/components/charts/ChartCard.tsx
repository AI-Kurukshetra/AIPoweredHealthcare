import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
