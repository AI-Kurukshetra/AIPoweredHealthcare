import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { updateVisitSchema } from "@/features/visits/schemas";
import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/log";
import { privateCacheHeaders } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/responses";
import { getVisitById, updateVisitById } from "@/services/visits/visit-service";
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
    const { id } = await context.params;
    const { user, supabase } = await resolveAuthContext(orgId);
    const visit = await getVisitById(supabase, orgId, id);

    if (!visit) {
      return fail(
        {
          code: "NOT_FOUND",
          message: "Visit not found.",
        },
        { status: 404 }
      );
    }

    logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "visits",
      resourceId: visit.id,
      action: "READ",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(visit, { headers: privateCacheHeaders() });
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
        message: "Unable to fetch visit right now.",
      },
      { status: 500 }
    );
  }
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
    const body = updateVisitSchema.parse(await request.json());
    const { id } = await context.params;
    const { user, supabase } = await resolveAuthContext(orgId);
    const visit = await updateVisitById(supabase, orgId, id, user.id, body);

    if (!visit) {
      return fail(
        {
          code: "NOT_FOUND",
          message: "Visit not found.",
        },
        { status: 404 }
      );
    }

    logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "visits",
      resourceId: visit.id,
      action: "UPDATE",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(visit);
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
        message: "Unable to update visit right now.",
      },
      { status: 500 }
    );
  }
}
