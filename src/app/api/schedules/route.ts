import { unstable_cache } from "next/cache";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { createScheduleSchema } from "@/features/schedules/schemas";
import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import { LIST_CACHE_REVALIDATE_SEC } from "@/lib/api/cache";
import { logAudit } from "@/lib/audit/log";
import { privateCacheHeaders, resolveOrgId, resolvePagination } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/responses";
import { createSchedule, listSchedules } from "@/services/schedules/schedule-service";
import { getRequestIp } from "@/utils/http";

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
    const pagination = resolvePagination(request, { limit: 100, maxLimit: 200 });
    const { user, supabase } = await resolveAuthContext(orgId);
    const schedules = await unstable_cache(
      () => listSchedules(supabase, orgId, pagination),
      ["api-schedules", orgId, String(pagination.offset), String(pagination.limit)],
      { revalidate: LIST_CACHE_REVALIDATE_SEC }
    )();

    logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "schedules",
      action: "READ",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(schedules, { headers: privateCacheHeaders() });
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
      { code: "INTERNAL_ERROR", message: "Unable to fetch schedules right now." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const body = createScheduleSchema.parse(await request.json());
    const { user, supabase } = await resolveAuthContext(orgId);

    const schedule = await createSchedule(supabase, orgId, user.id, body);

    logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "schedules",
      resourceId: schedule.id,
      action: "CREATE",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(schedule, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid request body.",
          details: error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

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
      { code: "INTERNAL_ERROR", message: "Unable to create schedule right now." },
      { status: 500 }
    );
  }
}
