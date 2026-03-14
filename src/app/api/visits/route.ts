import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { createVisitSchema } from "@/features/visits/schemas";
import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/log";
import { fail, ok } from "@/lib/api/responses";
import { createClient } from "@/lib/supabase/server";
import { createVisit, listVisits } from "@/services/visits/visit-service";
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
    const visits = await listVisits(supabase, orgId);

    await logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "visits",
      action: "READ",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(visits);
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
    const { user } = await resolveAuthContext(orgId);
    const supabase = await createClient();

    const visit = await createVisit(supabase, orgId, user.id, body);

    await logAudit({
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
