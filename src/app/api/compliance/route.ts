import { unstable_cache } from "next/cache";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { createComplianceSchema } from "@/features/compliance/schemas";
import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import { LIST_CACHE_REVALIDATE_SEC } from "@/lib/api/cache";
import { logAudit } from "@/lib/audit/log";
import { privateCacheHeaders, resolveOrgId, resolvePagination } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/responses";
import {
  createComplianceRecord,
  listComplianceRecords,
} from "@/services/compliance/compliance-service";
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
    const records = await unstable_cache(
      () => listComplianceRecords(supabase, orgId, pagination),
      ["api-compliance", orgId, String(pagination.offset), String(pagination.limit)],
      { revalidate: LIST_CACHE_REVALIDATE_SEC }
    )();

    logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "compliance",
      action: "READ",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(records, { headers: privateCacheHeaders() });
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
      { code: "INTERNAL_ERROR", message: "Unable to fetch compliance data right now." },
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
    const body = createComplianceSchema.parse(await request.json());
    const { user, supabase } = await resolveAuthContext(orgId);

    const record = await createComplianceRecord(supabase, orgId, user.id, body);

    logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "compliance",
      resourceId: record.id,
      action: "CREATE",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(record, { status: 201 });
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
      { code: "INTERNAL_ERROR", message: "Unable to create compliance record right now." },
      { status: 500 }
    );
  }
}
