import type { ReactNode } from "react";

type FilterPanelProps = {
  title: string;
  children: ReactNode;
};

export function FilterPanel({ title, children }: FilterPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </span>
      {children}
    </div>
  );
}
