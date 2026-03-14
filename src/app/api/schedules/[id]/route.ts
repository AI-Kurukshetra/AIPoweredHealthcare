import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { updateScheduleSchema } from "@/features/schedules/schemas";
import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/log";
import { fail, ok } from "@/lib/api/responses";
import { updateScheduleById } from "@/services/schedules/schedule-service";
import { getRequestIp } from "@/utils/http";

function resolveOrgId(request: NextRequest) {
  return request.nextUrl.searchParams.get("orgId");
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
    const body = updateScheduleSchema.parse(await request.json());
    const { id } = await context.params;
    const { user, supabase } = await resolveAuthContext(orgId);

    const schedule = await updateScheduleById(supabase, orgId, id, user.id, body);
    if (!schedule) {
      return fail(
        {
          code: "NOT_FOUND",
          message: "Schedule not found.",
        },
        { status: 404 }
      );
    }

    logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "schedules",
      resourceId: schedule.id,
      action: "UPDATE",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(schedule);
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
      {
        code: "INTERNAL_ERROR",
        message: "Unable to update schedule right now.",
      },
      { status: 500 }
    );
  }
}
