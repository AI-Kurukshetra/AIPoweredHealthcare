import type { ReactNode } from "react";
import Link from "next/link";

import { signOutAction } from "@/features/auth/actions";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patients", label: "Patients" },
  { href: "/visits", label: "Visits" },
  { href: "/schedule", label: "Schedule" },
  { href: "/staff", label: "Staff" },
  { href: "/compliance", label: "Compliance" },
  { href: "/communications", label: "Communications" },
  { href: "/billing", label: "Billing" },
  { href: "/incidents", label: "Incidents" },
];

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold text-slate-900">
            Healthcare Workforce Platform
          </h1>
          <nav className="flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
