import { unstable_cache } from "next/cache";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { createVisitSchema } from "@/features/visits/schemas";
import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import { LIST_CACHE_REVALIDATE_SEC } from "@/lib/api/cache";
import { logAudit } from "@/lib/audit/log";
import { privateCacheHeaders, resolveOrgId, resolvePagination } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/responses";
import { createVisit, listVisits } from "@/services/visits/visit-service";
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
    const pagination = resolvePagination(request, { limit: 50, maxLimit: 200 });
    const { user, supabase } = await resolveAuthContext(orgId);
    const visits = await unstable_cache(
      () => listVisits(supabase, orgId, pagination),
      ["api-visits", orgId, String(pagination.offset), String(pagination.limit)],
      { revalidate: LIST_CACHE_REVALIDATE_SEC }
    )();

    logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "visits",
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
      { code: "INTERNAL_ERROR", message: "Unable to fetch visits right now." },
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
    const body = createVisitSchema.parse(await request.json());
    const { user, supabase } = await resolveAuthContext(orgId);

    const visit = await createVisit(supabase, orgId, user.id, body);

    logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "visits",
      resourceId: visit.id,
      action: "CREATE",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(visit, { status: 201 });
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
      { code: "INTERNAL_ERROR", message: "Unable to create visit right now." },
      { status: 500 }
    );
  }
}
