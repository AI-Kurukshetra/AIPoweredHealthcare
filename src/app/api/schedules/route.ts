import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { createScheduleSchema } from "@/features/schedules/schemas";
import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/log";
import { fail, ok } from "@/lib/api/responses";
import { createClient } from "@/lib/supabase/server";
import { createSchedule, listSchedules } from "@/services/schedules/schedule-service";
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
    const { user } = await resolveAuthContext(orgId);
    const supabase = await createClient();
    const schedules = await listSchedules(supabase, orgId);

    await logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "schedules",
      action: "READ",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(schedules);
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
    const { user } = await resolveAuthContext(orgId);
    const supabase = await createClient();

    const schedule = await createSchedule(supabase, orgId, user.id, body);

    await logAudit({
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
