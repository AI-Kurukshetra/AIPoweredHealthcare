import type { ReactNode } from "react";

type ChatInterfaceProps = {
  title: string;
  children: ReactNode;
};

export function ChatInterface({ title, children }: ChatInterfaceProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
