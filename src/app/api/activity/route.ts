import { NextRequest } from "next/server";

import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import { privateCacheHeaders, resolveOrgId } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/responses";

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
  READ: "viewed",
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

export async function GET(request: NextRequest) {
  const orgId = resolveOrgId(request);
  if (!orgId) {
    return fail(
      { code: "VALIDATION_ERROR", message: "Missing organization context." },
      { status: 422 }
    );
  }

  try {
    const { supabase } = await resolveAuthContext(orgId);
    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = Math.min(
      Math.max(1, parseInt(limitParam ?? "10", 10)),
      50
    );

    const { data: logs, error } = await supabase
      .from("audit_logs")
      .select("id, resource_type, resource_id, action, occurred_at")
      .eq("org_id", orgId)
      .neq("action", "READ")
      .order("occurred_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[GET /api/activity]", error.message);
      return fail(
        { code: "INTERNAL_ERROR", message: "Unable to fetch activity." },
        { status: 500 }
      );
    }

    const items: ActivityItem[] = (logs ?? []).map((log) => ({
      id: log.id,
      title: buildActivityTitle(log.resource_type, log.action),
      description: buildActivityDescription(log.resource_type, log.action),
      time: formatTimeAgo(log.occurred_at),
    }));

    return ok(items, { headers: privateCacheHeaders(30, 60) });
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(
        {
          code: error.code,
          message:
            error.code === "UNAUTHORIZED"
              ? "Authentication required."
              : "Access denied.",
        },
        { status: error.code === "UNAUTHORIZED" ? 401 : 403 }
      );
    }
    return fail(
      { code: "INTERNAL_ERROR", message: "Unable to fetch activity." },
      { status: 500 }
    );
  }
}
