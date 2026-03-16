import { NextRequest } from "next/server";

import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import { resolveOrgId } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/responses";
import { autoAssignSchedules } from "@/services/schedules/auto-assign-service";
import { getRequestIp } from "@/utils/http";
import { logAudit } from "@/lib/audit/log";

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
    const { user, supabase } = await resolveAuthContext(orgId);
    const result = await autoAssignSchedules(supabase, orgId, user.id);

    logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "schedules_auto_assign",
      action: "UPDATE",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
      metadata: {
        assigned: result.assigned,
        skipped: result.skipped,
      },
    });

    return ok(result);
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
      { code: "INTERNAL_ERROR", message: "Unable to auto-assign schedules right now." },
      { status: 500 }
    );
  }
}
