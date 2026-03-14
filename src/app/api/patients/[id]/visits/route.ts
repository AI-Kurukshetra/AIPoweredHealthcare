import { NextRequest } from "next/server";

import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/log";
import { privateCacheHeaders, resolvePagination } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/responses";
import { listPatientVisits } from "@/services/patients/patient-service";
import { getRequestIp } from "@/utils/http";

function resolveOrgId(request: NextRequest) {
  return request.nextUrl.searchParams.get("orgId");
}

export async function GET(
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
    const pagination = resolvePagination(request, { limit: 20, maxLimit: 200 });
    const { id } = await context.params;
    const { user, supabase } = await resolveAuthContext(orgId);
    const visits = await listPatientVisits(supabase, orgId, id, pagination);

    logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "visits",
      resourceId: id,
      action: "READ",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(visits, { headers: privateCacheHeaders() });
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
        message: "Unable to fetch patient visits right now.",
      },
      { status: 500 }
    );
  }
}
