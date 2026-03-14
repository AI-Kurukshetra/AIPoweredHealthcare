import { NextRequest } from "next/server";

import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/log";
import { privateCacheHeaders } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/responses";
import { getDashboardMetrics } from "@/services/analytics/dashboard-service";
import { getAnalyticsInsights } from "@/services/analytics/insights-service";
import { getRequestIp } from "@/utils/http";

function resolveOrgId(request: NextRequest) {
  return request.nextUrl.searchParams.get("orgId");
}

export async function GET(request: NextRequest) {
  const orgId = resolveOrgId(request);
  if (!orgId) {
    return fail(
      {
        code: "VALIDATION_ERROR",
        message: "Missing organization context.",
      },
      { status: 422 }
    );
  }

  try {
    const daysParam = Number(request.nextUrl.searchParams.get("days"));
    const days = Number.isFinite(daysParam) && daysParam > 0 ? Math.round(daysParam) : null;
    const { user, supabase } = await resolveAuthContext(orgId);
    const data = days
      ? await getAnalyticsInsights(supabase, orgId, days)
      : await getDashboardMetrics(supabase, orgId);

    logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "analytics",
      action: "READ",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(data, { headers: privateCacheHeaders(30, 120) });
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
      {
        code: "INTERNAL_ERROR",
        message: "Unable to fetch analytics right now.",
      },
      { status: 500 }
    );
  }
}
