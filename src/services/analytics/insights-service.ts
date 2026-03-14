import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import { getDashboardMetrics } from "@/services/analytics/dashboard-service";

export type AnalyticsInsights = {
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

function rangeStartIso(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function percent(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

function clampPercent(value: number) {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function resolveStatus(
  value: number | null,
  target: number | null,
  direction: "higher" | "lower"
): AnalyticsInsights["kpis"][number]["status"] {
  if (value === null || target === null) return "pending";

  const threshold = target * 0.8;
  const isGood = direction === "higher" ? value >= target : value <= target;
  const isWarn = direction === "higher" ? value >= threshold : value <= target * 1.2;

  if (isGood) return "on_track";
  if (isWarn) return "at_risk";
  return "critical";
}

function expectedVisitsPerStaff(days: number) {
  const weeks = Math.max(1, Math.round(days / 7));
  return weeks * 5;
}

type SeededKpiSnapshot = {
  patientSatisfaction?: number;
  systemUptime?: number;
  mobileEngagement?: number;
  integrationSuccess?: number;
};

function readKpiNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function extractSeededKpis(metadata: Database["public"]["Tables"]["audit_logs"]["Row"]["metadata"]) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const candidate = metadata as Record<string, unknown>;
  const kpi = candidate.kpi;
  if (!kpi || typeof kpi !== "object") {
    return null;
  }

  const values = kpi as Record<string, unknown>;
  return {
    patientSatisfaction: readKpiNumber(values.patient_satisfaction ?? values.patientSatisfaction),
    systemUptime: readKpiNumber(values.system_uptime ?? values.systemUptime),
    mobileEngagement: readKpiNumber(values.mobile_engagement ?? values.mobileEngagement),
    integrationSuccess: readKpiNumber(values.integration_success ?? values.integrationSuccess),
  } satisfies SeededKpiSnapshot;
}

async function getSeededKpiSnapshot(
  supabase: SupabaseClient<Database>,
  orgId: string
): Promise<SeededKpiSnapshot | null> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("metadata, occurred_at")
    .eq("org_id", orgId)
    .eq("resource_type", "kpi_snapshot")
    .order("occurred_at", { ascending: false })
    .limit(1);

  if (error || !data?.length) {
    return null;
  }

  return extractSeededKpis(data[0].metadata);
}

type MessageRow = {
  channel_id: string;
  sender_id: string;
  created_at: string;
};

type MemberRow = {
  user_id: string;
  role: Database["public"]["Enums"]["healthcare_role"];
};

async function getResponseTimeHours(
  supabase: SupabaseClient<Database>,
  orgId: string,
  start: string
): Promise<number | null> {
  const { data: channels, error: channelsError } = await supabase
    .from("channels")
    .select("id")
    .eq("org_id", orgId)
    .eq("channel_type", "patient")
    .limit(250);

  if (channelsError || !channels?.length) {
    return null;
  }

  const channelIds = channels.map((row) => row.id);
  const { data: messages, error: messageError } = await supabase
    .from("messages")
    .select("channel_id, sender_id, created_at")
    .eq("org_id", orgId)
    .in("channel_id", channelIds)
    .gte("created_at", start)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(2000);

  if (messageError || !messages?.length) {
    return null;
  }

  const senderIds = Array.from(new Set(messages.map((message) => message.sender_id)));
  const { data: members, error: membersError } = await supabase
    .from("organization_members")
    .select("user_id, role")
    .eq("org_id", orgId)
    .in("user_id", senderIds)
    .limit(500);

  if (membersError || !members?.length) {
    return null;
  }

  const roleByUserId = new Map<string, MemberRow["role"]>();
  members.forEach((member) => {
    roleByUserId.set(member.user_id, member.role);
  });

  const messagesByChannel = new Map<string, MessageRow[]>();
  messages.forEach((message) => {
    const bucket = messagesByChannel.get(message.channel_id) ?? [];
    bucket.push(message);
    messagesByChannel.set(message.channel_id, bucket);
  });

  const responseTimes: number[] = [];
  messagesByChannel.forEach((channelMessages) => {
    let lastPatientAt: Date | null = null;
    channelMessages.forEach((message) => {
      const role = roleByUserId.get(message.sender_id);
      const timestamp = new Date(message.created_at);
      if (role === "patient") {
        lastPatientAt = timestamp;
        return;
      }

      if (lastPatientAt) {
        const deltaHours = (timestamp.getTime() - lastPatientAt.getTime()) / 3_600_000;
        if (deltaHours >= 0) {
          responseTimes.push(deltaHours);
        }
        lastPatientAt = null;
      }
    });
  });

  if (!responseTimes.length) {
    return null;
  }

  const average =
    responseTimes.reduce((total, value) => total + value, 0) / responseTimes.length;
  return Math.round(average * 10) / 10;
}

export async function getAnalyticsInsights(
  supabase: SupabaseClient<Database>,
  orgId: string,
  days: number
): Promise<AnalyticsInsights> {
  const start = rangeStartIso(days);
  const dashboard = await getDashboardMetrics(supabase, orgId);

  const [
    visitsInRangeResult,
    completedVisitsResult,
    incidentsInRangeResult,
    activeStaffResult,
    scheduledAppointmentsResult,
    complianceChecksInRangeResult,
    compliantChecksInRangeResult,
    visitNotesInRangeResult,
    responseTimeHours,
    seededKpiSnapshot,
  ] = await Promise.all([
    supabase
      .from("visits")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .gte("created_at", start)
      .is("deleted_at", null),
    supabase
      .from("visits")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("status", "completed")
      .gte("created_at", start)
      .is("deleted_at", null),
    supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .gte("occurred_at", start)
      .is("deleted_at", null),
    supabase
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .neq("role", "patient")
      .eq("status", "active"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .gte("starts_at", start)
      .is("deleted_at", null),
    supabase
      .from("compliance_records")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .gte("checked_at", start),
    supabase
      .from("compliance_records")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("status", "compliant")
      .gte("checked_at", start),
    supabase
      .from("visit_notes")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .gte("created_at", start)
      .is("deleted_at", null),
    getResponseTimeHours(supabase, orgId, start),
    getSeededKpiSnapshot(supabase, orgId),
  ]);

  const visitsInRange = visitsInRangeResult.count ?? 0;
  const completedVisitsInRange = completedVisitsResult.count ?? 0;
  const incidentsInRange = incidentsInRangeResult.count ?? 0;
  const activeStaff = activeStaffResult.count ?? 0;
  const scheduledAppointmentsInRange = scheduledAppointmentsResult.count ?? 0;
  const complianceChecksInRange = complianceChecksInRangeResult.count ?? 0;
  const compliantChecksInRange = compliantChecksInRangeResult.count ?? 0;
  const visitNotesInRange = visitNotesInRangeResult.count ?? 0;

  const complianceRate = clampPercent(
    percent(compliantChecksInRange, Math.max(complianceChecksInRange, 1))
  );
  const carePlanAdherenceRate = clampPercent(
    percent(visitNotesInRange, Math.max(completedVisitsInRange, 1))
  );
  const staffUtilizationRate = clampPercent(
    percent(
      completedVisitsInRange,
      Math.max(activeStaff * expectedVisitsPerStaff(days), 1)
    )
  );

  const complianceRisk: AnalyticsInsights["summary"]["complianceRisk"] =
    dashboard.openComplianceChecks >= 6
      ? "high"
      : dashboard.openComplianceChecks >= 2
      ? "moderate"
      : "low";

  const kpis: AnalyticsInsights["kpis"] = [
    {
      id: "patient_satisfaction",
      label: "Patient Satisfaction Score",
      value: seededKpiSnapshot?.patientSatisfaction ?? null,
      target: 85,
      unit: "score",
      status: resolveStatus(seededKpiSnapshot?.patientSatisfaction ?? null, 85, "higher"),
      description: "Seeded survey/NPS benchmark snapshot.",
    },
    {
      id: "staff_utilization",
      label: "Staff Utilization Rate",
      value: staffUtilizationRate,
      target: 80,
      unit: "percent",
      status: resolveStatus(staffUtilizationRate, 80, "higher"),
      description: "Proxy based on completed visits per active staff.",
    },
    {
      id: "care_plan_adherence",
      label: "Care Plan Adherence Rate",
      value: carePlanAdherenceRate,
      target: 90,
      unit: "percent",
      status: resolveStatus(carePlanAdherenceRate, 90, "higher"),
      description: "Visit documentation completion against completed visits.",
    },
    {
      id: "response_time",
      label: "Response Time to Patient Requests",
      value: responseTimeHours,
      target: 2,
      unit: "hours",
      status: resolveStatus(responseTimeHours, 2, "lower"),
      description: "Average time from patient message to staff response.",
    },
    {
      id: "regulatory_compliance",
      label: "Regulatory Compliance Percentage",
      value: complianceRate,
      target: 100,
      unit: "percent",
      status: resolveStatus(complianceRate, 100, "higher"),
      description: "Based on compliant checks within the selected range.",
    },
    {
      id: "system_uptime",
      label: "System Uptime",
      value: seededKpiSnapshot?.systemUptime ?? null,
      target: 99.9,
      unit: "percent",
      status: resolveStatus(seededKpiSnapshot?.systemUptime ?? null, 99.9, "higher"),
      description: "Seeded monitoring snapshot.",
    },
    {
      id: "mobile_engagement",
      label: "Mobile App Engagement",
      value: seededKpiSnapshot?.mobileEngagement ?? null,
      target: 60,
      unit: "percent",
      status: resolveStatus(seededKpiSnapshot?.mobileEngagement ?? null, 60, "higher"),
      description: "Seeded mobile DAU/MAU snapshot.",
    },
    {
      id: "integration_success",
      label: "Integration Success Rate",
      value: seededKpiSnapshot?.integrationSuccess ?? null,
      target: 98,
      unit: "percent",
      status: resolveStatus(seededKpiSnapshot?.integrationSuccess ?? null, 98, "higher"),
      description: "Seeded EHR integration snapshot.",
    },
  ];

  return {
    days,
    refreshedAt: new Date().toISOString(),
    summary: {
      activePatientRate: percent(dashboard.activePatients, dashboard.totalPatients),
      visitCompletionRate: percent(completedVisitsInRange, visitsInRange),
      incidentRate: percent(incidentsInRange, Math.max(visitsInRange, 1)),
      complianceRisk,
      complianceRate,
      carePlanAdherenceRate,
      visitsToday: dashboard.visitsToday,
      openIncidents: dashboard.openIncidents,
    },
    counts: {
      activePatients: dashboard.activePatients,
      totalPatients: dashboard.totalPatients,
      visitsInRange,
      completedVisitsInRange,
      incidentsInRange,
      openComplianceChecks: dashboard.openComplianceChecks,
      activeStaff,
      scheduledAppointmentsInRange,
      complianceChecksInRange,
      compliantChecksInRange,
      visitNotesInRange,
    },
    kpis,
  };
}
