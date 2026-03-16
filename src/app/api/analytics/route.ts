import { unstable_cache } from "next/cache";
import { NextRequest } from "next/server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { AuthError, resolveAuthContext } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
import { privateCacheHeaders, resolveOrgId } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/responses";
import { getDashboardMetrics } from "@/services/analytics/dashboard-service";
import { getAnalyticsInsights } from "@/services/analytics/insights-service";

const CACHE_REVALIDATE_SEC = 300;

async function fetchAnalyticsData(
  supabase: SupabaseClient,
  orgId: string,
  days: number | null
) {
  return days
    ? getAnalyticsInsights(supabase, orgId, days)
    : getDashboardMetrics(supabase, orgId);
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
    const { supabase } = await resolveAuthContext(orgId);

    const data = await unstable_cache(
      () => fetchAnalyticsData(supabase, orgId, days),
      ["api-analytics", orgId, String(days ?? "metrics")],
      { revalidate: CACHE_REVALIDATE_SEC }
    )();

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
