import { NextRequest } from "next/server";

import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import { privateCacheHeaders, resolveOrgId } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/responses";
import { getDashboardCharts } from "@/services/analytics/charts-service";

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
    const daysParam = Number(request.nextUrl.searchParams.get("days"));
    const days = Number.isFinite(daysParam) && daysParam > 0
      ? Math.min(Math.round(daysParam), 90)
      : 30;

    const charts = await getDashboardCharts(supabase, orgId, days);
    return ok(charts, { headers: privateCacheHeaders(60, 300) });
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
      { code: "INTERNAL_ERROR", message: "Unable to fetch charts." },
      { status: 500 }
    );
  }
}
