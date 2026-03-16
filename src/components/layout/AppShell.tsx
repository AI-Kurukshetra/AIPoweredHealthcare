import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, Search, UserCircle2 } from "lucide-react";

import { signOutAction } from "@/features/auth/actions";
import { env } from "@/config/env";
import { resolveAuthContext } from "@/lib/auth/session";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
  { href: "/staff", label: "Staff" },
  { href: "/patients", label: "Patients" },
  { href: "/visits", label: "Visits" },
  { href: "/schedule", label: "Schedule" },
  { href: "/compliance", label: "Compliance" },
  { href: "/communications", label: "Communication" },
  { href: "/billing", label: "Billing" },
];

const roleAccess: Record<string, string[]> = {
  super_admin: ["/dashboard", "/analytics", "/staff", "/patients", "/visits", "/schedule", "/compliance", "/communications", "/billing"],
  org_admin: ["/dashboard", "/analytics", "/staff", "/patients", "/visits", "/schedule", "/compliance", "/communications", "/billing"],
  care_coordinator: ["/dashboard", "/patients", "/visits", "/schedule", "/communications"],
  field_nurse: ["/dashboard", "/patients", "/visits", "/schedule", "/communications"],
  billing_staff: ["/dashboard", "/billing", "/patients"],
};

type AppShellProps = {
  children: ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  let role = "admin";
  let userName = "Care Admin";
  let userEmail = "";
  try {
    const auth = await resolveAuthContext(env.NEXT_PUBLIC_DEFAULT_ORG_ID);
    role = auth.role;
    userName =
      auth.user?.user_metadata?.full_name ||
      auth.user?.email ||
      "User";
    userEmail = auth.user?.email || "";
  } catch {
    // Fallback if failing
  }
  
  const allowedHrefs = roleAccess[role] || roleAccess.field_nurse;
  const filteredNavItems = navItems.filter((item) => allowedHrefs.includes(item.href));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200/70 bg-white/90 px-5 py-6 lg:flex lg:flex-col">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              AI-Powered Healthcare
            </p>
            <h1 className="mt-2 text-lg font-semibold text-slate-950">
              Workforce Operations
            </h1>
          </div>
          <nav className="mt-8 space-y-2 text-sm">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className="flex items-center justify-between rounded-2xl border border-transparent px-3 py-2 font-medium text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={signOutAction} className="mt-auto">
            <button
              type="submit"
              className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Sign out
            </button>
          </form>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
              <div className="flex w-full items-center justify-between gap-4 lg:w-auto">
                <div className="lg:hidden">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    AI-Powered Healthcare
                  </p>
                  <h1 className="text-lg font-semibold text-slate-950">
                    Workforce Operations
                  </h1>
                </div>
              </div>
              <div className="flex w-full flex-1 items-center gap-3 lg:w-auto lg:justify-end">
                <label className="relative w-full max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Search patients, staff, or visits"
                    className="w-full rounded-full border border-slate-200 bg-white px-10 py-2 text-sm shadow-sm"
                  />
                </label>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-cyan-700"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
                  title={
                    userEmail
                      ? `${userName} • ${userEmail}`
                      : userName
                  }
                >
                  <UserCircle2 className="h-4 w-4" />
                  <span className="flex flex-col items-start max-w-[160px] truncate">
                    <span className="truncate">
                      {userName} ({role.replace("_", " ")})
                    </span>
                    {userEmail && (
                      <span className="truncate text-xs font-normal text-slate-500">
                        {userEmail}
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
            <div className="rounded-[2.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] backdrop-blur-sm sm:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
