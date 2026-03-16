import type { SupabaseClient } from "@supabase/supabase-js";

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: "created",
  UPDATE: "updated",
  DELETE: "deleted",
  EXPORT: "exported",
};

const RESOURCE_LABELS: Record<string, string> = {
  patients: "patient",
  visits: "visit",
  schedules: "schedule",
  appointments: "appointment",
  billing: "billing record",
  compliance: "compliance check",
  incidents: "incident",
  credentials: "credential",
  communications: "message",
  staff: "staff member",
  analytics: "analytics",
};

function formatTimeAgo(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

function buildActivityTitle(resourceType: string, action: string): string {
  const resource = RESOURCE_LABELS[resourceType] ?? resourceType;
  const verb = ACTION_LABELS[action] ?? action.toLowerCase();
  return `${resource} ${verb}`;
}

function buildActivityDescription(resourceType: string, action: string): string {
  const resource = RESOURCE_LABELS[resourceType] ?? resourceType;
  const verb = ACTION_LABELS[action] ?? action;
  return `A ${resource} was ${verb} in the system.`;
}

export async function getActivity(
  supabase: SupabaseClient,
  orgId: string,
  limit = 10
): Promise<ActivityItem[]> {
  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select("id, resource_type, resource_id, action, occurred_at")
    .eq("org_id", orgId)
    .neq("action", "READ")
    .order("occurred_at", { ascending: false })
    .limit(Math.min(limit, 50));

  if (error) {
    return [];
  }

  return (logs ?? []).map((log) => ({
    id: log.id,
    title: buildActivityTitle(log.resource_type, log.action),
    description: buildActivityDescription(log.resource_type, log.action),
    time: formatTimeAgo(log.occurred_at),
  }));
}
