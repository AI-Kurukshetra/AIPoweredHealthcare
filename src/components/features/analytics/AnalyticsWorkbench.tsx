"use client";

import { useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  ClipboardCheck,
  Clock,
  Download,
  Gauge,
  LineChart,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Siren,
  Target,
  Users,
} from "lucide-react";

import { DateRangeSelector } from "@/components/features/analytics/DateRangeSelector";
import { FilterPanel } from "@/components/features/analytics/FilterPanel";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
type Insights = {
  days: number;
  refreshedAt: string;
  summary: {
    activePatientRate: number;
    visitCompletionRate: number;
    incidentRate: number;
    complianceRisk: "low" | "moderate" | "high";
    complianceRate: number;
    carePlanAdherenceRate: number;
    visitsToday: number;
    openIncidents: number;
  };
  counts: {
    activePatients: number;
    totalPatients: number;
    visitsInRange: number;
    completedVisitsInRange: number;
    incidentsInRange: number;
    openComplianceChecks: number;
    activeStaff: number;
    scheduledAppointmentsInRange: number;
    complianceChecksInRange: number;
    compliantChecksInRange: number;
    visitNotesInRange: number;
  };
  kpis: {
    id:
      | "patient_satisfaction"
      | "staff_utilization"
      | "care_plan_adherence"
      | "response_time"
      | "regulatory_compliance"
      | "system_uptime"
      | "mobile_engagement"
      | "integration_success";
    label: string;
    value: number | null;
    target: number | null;
    unit: "percent" | "hours" | "score";
    status: "on_track" | "at_risk" | "critical" | "pending";
    description: string;
  }[];
};

type AnalyticsWorkbenchProps = {
  orgId: string;
  initialInsights: Insights;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export function AnalyticsWorkbench({ orgId, initialInsights }: AnalyticsWorkbenchProps) {
  const [days, setDays] = useState(initialInsights.days);
  const [error, setError] = useState<string | null>(null);
  const {
    data: insights = initialInsights,
    isFetching: isRefreshing,
    refetch,
  } = useQuery({
    queryKey: queryKeys.analytics(orgId, days),
    queryFn: () => apiGet<Insights>("/api/analytics", { orgId, days }),
    initialData: initialInsights,
  });

  const statusStyles: Record<Insights["kpis"][number]["status"], string> = {
    on_track: "border-emerald-200 bg-emerald-50 text-emerald-700",
    at_risk: "border-amber-200 bg-amber-50 text-amber-700",
    critical: "border-rose-200 bg-rose-50 text-rose-700",
    pending: "border-slate-200 bg-slate-100 text-slate-500",
  };

  const summaryCards = useMemo(
    () => [
      {
        id: "active-patients",
        label: "Active Patient Rate",
        value: `${insights.summary.activePatientRate}%`,
        meta: `${insights.counts.activePatients} of ${insights.counts.totalPatients}`,
        icon: Users,
        tone: "text-indigo-600 bg-indigo-50",
      },
      {
        id: "visit-completion",
        label: "Visit Completion Rate",
        value: `${insights.summary.visitCompletionRate}%`,
        meta: `${insights.counts.completedVisitsInRange} of ${insights.counts.visitsInRange}`,
        icon: ClipboardCheck,
        tone: "text-emerald-600 bg-emerald-50",
      },
      {
        id: "compliance-rate",
        label: "Compliance Rate",
        value: `${insights.summary.complianceRate}%`,
        meta: `${insights.counts.compliantChecksInRange} compliant checks`,
        icon: ShieldCheck,
        tone: "text-cyan-700 bg-cyan-50",
      },
      {
        id: "incident-rate",
        label: "Incident Rate",
        value: `${insights.summary.incidentRate}%`,
        meta: `${insights.counts.incidentsInRange} incidents`,
        icon: AlertTriangle,
        tone: "text-rose-600 bg-rose-50",
      },
    ],
    [insights]
  );

  const focusQueue = useMemo(() => {
    const items: Array<{
      id: string;
      label: string;
      detail: string;
      tone: string;
      icon: typeof AlertTriangle;
    }> = [];

    if (insights.summary.complianceRisk !== "low") {
      items.push({
        id: "compliance",
        label: "Compliance queue needs attention",
        detail: `${insights.counts.openComplianceChecks} open checks are affecting risk posture.`,
        tone: "border-amber-200 bg-amber-50 text-amber-800",
        icon: ShieldAlert,
      });
    }

    if (insights.summary.openIncidents > 0) {
      items.push({
        id: "incidents",
        label: "Incidents remain open",
        detail: `${insights.summary.openIncidents} incidents still require follow-up and corrective action.`,
        tone: "border-rose-200 bg-rose-50 text-rose-800",
        icon: Siren,
      });
    }

    if (insights.summary.carePlanAdherenceRate < 90) {
      items.push({
        id: "documentation",
        label: "Documentation throughput is below target",
        detail: `${insights.summary.carePlanAdherenceRate}% care-plan adherence against a 90% target.`,
        tone: "border-cyan-200 bg-cyan-50 text-cyan-800",
        icon: ClipboardCheck,
      });
    }

    if (insights.counts.activeStaff > 0) {
      items.push({
        id: "utilization",
        label: "Staffing utilization watch",
        detail: `${insights.counts.completedVisitsInRange} completed visits across ${insights.counts.activeStaff} active staff.`,
        tone: "border-slate-200 bg-slate-50 text-slate-800",
        icon: LineChart,
      });
    }

    return items.slice(0, 4);
  }, [insights]);

  function formatValue(value: number | null, unit: Insights["kpis"][number]["unit"]) {
    if (value === null) return "Pending";
    if (unit === "hours") return `${value.toFixed(1)}h`;
    if (unit === "score") return `${Math.round(value)}`;
    return `${Math.round(value)}%`;
  }

  function formatTarget(value: number | null, unit: Insights["kpis"][number]["unit"]) {
    if (value === null) return "N/A";
    if (unit === "hours") return `< ${value}h`;
    if (unit === "score") return `${value}+`;
    return `${value}%`;
  }

  function exportCsv() {
    const rows = [
      ["Metric", "Value", "Target", "Status"],
      ...insights.kpis.map((kpi) => [
        kpi.label,
        formatValue(kpi.value, kpi.unit),
        formatTarget(kpi.target, kpi.unit),
        kpi.status.replace("_", " "),
      ]),
      [],
      ["Summary", "Value"],
      ["Active Patient Rate", `${insights.summary.activePatientRate}%`],
      ["Visit Completion Rate", `${insights.summary.visitCompletionRate}%`],
      ["Compliance Rate", `${insights.summary.complianceRate}%`],
      ["Care Plan Adherence", `${insights.summary.carePlanAdherenceRate}%`],
      ["Incident Rate", `${insights.summary.incidentRate}%`],
      [],
      ["Counts", "Value"],
      ["Active Patients", `${insights.counts.activePatients}`],
      ["Total Patients", `${insights.counts.totalPatients}`],
      ["Visits in Range", `${insights.counts.visitsInRange}`],
      ["Completed Visits", `${insights.counts.completedVisitsInRange}`],
      ["Scheduled Appointments", `${insights.counts.scheduledAppointmentsInRange}`],
      ["Active Staff", `${insights.counts.activeStaff}`],
      ["Open Compliance Checks", `${insights.counts.openComplianceChecks}`],
      ["Compliance Checks in Range", `${insights.counts.complianceChecksInRange}`],
      ["Compliant Checks in Range", `${insights.counts.compliantChecksInRange}`],
      ["Visit Notes in Range", `${insights.counts.visitNotesInRange}`],
    ];

    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `analytics-${orgId}-${days}d.csv`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  async function refresh() {
    setError(null);
    try {
      await refetch();
    } catch {
      setError("Unable to refresh analytics.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_28px_60px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              <Activity className="h-3.5 w-3.5" />
              Quality Metrics
            </div>
            <h3 className="text-2xl font-semibold text-slate-950">Operational Intelligence</h3>
            <p className="text-sm text-slate-600">
              Last updated {new Date(insights.refreshedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterPanel title="Date Range">
              <DateRangeSelector value={days} onChange={setDays} />
            </FilterPanel>
            <button
              type="button"
              onClick={refresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:-translate-y-0.5 hover:bg-cyan-100 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertTriangle className="h-4 w-4" />
          {error}
        </motion.div>
      ) : null}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {summaryCards.map((card) => (
          <motion.article
            key={card.id}
            variants={itemVariants}
            className="rounded-3xl border border-slate-200/60 bg-white/95 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)]"
          >
            <div className="flex items-center gap-3">
              <span className={`rounded-2xl px-3 py-2 ${card.tone}`}>
                <card.icon className="h-5 w-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {card.label}
              </p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.meta}</p>
          </motion.article>
        ))}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {insights.kpis.map((kpi) => (
          <motion.article
            key={kpi.id}
            variants={itemVariants}
            className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-[0_12px_35px_-28px_rgba(15,23,42,0.4)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {kpi.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {formatValue(kpi.value, kpi.unit)}
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[kpi.status]}`}
              >
                {kpi.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{kpi.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Target</span>
              <span className="font-semibold text-slate-700">
                {formatTarget(kpi.target, kpi.unit)}
              </span>
            </div>
            {kpi.value !== null && kpi.unit === "percent" ? (
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-cyan-500/80"
                  style={{ width: `${Math.min(100, Math.round(kpi.value))}%` }}
                />
              </div>
            ) : null}
          </motion.article>
        ))}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <motion.section
          variants={itemVariants}
          className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.45)]"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-950">Operational Signals</h4>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Last {days} Days
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Care Plan Adherence</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {insights.summary.carePlanAdherenceRate}%
              </p>
              <p className="text-xs text-slate-500">
                {insights.counts.visitNotesInRange} documentation notes
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Scheduled Appointments</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {insights.counts.scheduledAppointmentsInRange}
              </p>
              <p className="text-xs text-slate-500">
                {insights.counts.activeStaff} active staff
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Visits Today</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {insights.summary.visitsToday}
              </p>
              <p className="text-xs text-slate-500">
                {insights.counts.visitsInRange} total visits in range
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Open Incidents</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {insights.summary.openIncidents}
              </p>
              <p className="text-xs text-slate-500">
                {insights.counts.incidentsInRange} incidents in range
              </p>
            </article>
          </div>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.45)]"
        >
          <h4 className="text-lg font-semibold text-slate-950">Safety & Compliance</h4>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                Compliance Risk
              </span>
              <span className="font-semibold capitalize text-slate-900">
                {insights.summary.complianceRisk}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
              <span className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-cyan-600" />
                Open Compliance Checks
              </span>
              <span className="font-semibold text-slate-900">
                {insights.counts.openComplianceChecks}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                Compliance Checks in Range
              </span>
              <span className="font-semibold text-slate-900">
                {insights.counts.complianceChecksInRange}
              </span>
            </div>
            <div className="rounded-xl border border-cyan-200/70 bg-cyan-50/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-700">Incident Rate</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {insights.summary.incidentRate}%
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              Visit Documentation
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {insights.summary.carePlanAdherenceRate}%
            </p>
            <p className="text-xs text-slate-500">
              {insights.counts.visitNotesInRange} notes logged in range
            </p>
          </div>
        </motion.section>
      </motion.div>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.45)]"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold text-slate-950">Coordinator Focus Queue</h4>
            <p className="text-sm text-slate-600">
              Derived actions from current KPI posture for the selected analytics window.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            <Target className="h-3.5 w-3.5" />
            Priority Signals
          </div>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {focusQueue.map((item) => (
            <motion.article
              key={item.id}
              variants={itemVariants}
              className={`rounded-2xl border p-4 ${item.tone}`}
            >
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-white/70 p-2">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm opacity-90">{item.detail}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
