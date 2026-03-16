import { unstable_cache } from "next/cache";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { createPatientSchema } from "@/features/patients/schemas";
import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import { LIST_CACHE_REVALIDATE_SEC } from "@/lib/api/cache";
import { logAudit } from "@/lib/audit/log";
import { privateCacheHeaders, resolveOrgId, resolvePagination } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/responses";
import { createPatient, listPatients } from "@/services/patients/patient-service";
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
    const patients = await unstable_cache(
      () => listPatients(supabase, orgId, pagination),
      ["api-patients", orgId, String(pagination.offset), String(pagination.limit)],
      { revalidate: LIST_CACHE_REVALIDATE_SEC }
    )();

    logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "patients",
      action: "READ",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(patients, { headers: privateCacheHeaders() });
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

    const detail =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[GET /api/patients]", detail, error);
    return fail(
      { code: "INTERNAL_ERROR", message: `Unable to fetch patients: ${detail}` },
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
    const body = createPatientSchema.parse(await request.json());
    const { user, supabase } = await resolveAuthContext(orgId);

    const patient = await createPatient(supabase, orgId, user.id, body);

    logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "patients",
      resourceId: patient.id,
      action: "CREATE",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(patient, { status: 201 });
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

    const detail =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[POST /api/patients]", detail, error);
    return fail(
      { code: "INTERNAL_ERROR", message: `Unable to create patient: ${detail}` },
      { status: 500 }
    );
  }
}
