import type { ReactNode } from "react";

type AuthSplitLayoutProps = {
  badge: string;
  title: string;
  description: string;
  children: ReactNode;
};

const trustPoints = [
  "MFA required before PHI access",
  "Role-scoped access with RLS policies",
  "Audit logging on PHI operations",
];

export function AuthSplitLayout({
  badge,
  title,
  description,
  children,
}: AuthSplitLayoutProps) {
  return (
    <section className="auth-stage">
      <div className="auth-grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.55)] backdrop-blur-sm">
        <aside className="auth-hero p-7 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">{badge}</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">{title}</h1>
          <p className="mt-3 max-w-sm text-sm text-cyan-50/90">{description}</p>
          <div className="mt-8 space-y-2">
            {trustPoints.map((point) => (
              <p
                key={point}
                className="rounded-lg border border-cyan-200/20 bg-white/10 px-3 py-2 text-xs text-cyan-50/95"
              >
                {point}
              </p>
            ))}
          </div>
        </aside>
        <div className="p-5 sm:p-8">{children}</div>
      </div>
    </section>
  );
}
