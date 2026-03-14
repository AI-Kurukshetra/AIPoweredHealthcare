import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { createMessageSchema } from "@/features/communications/schemas";
import { AuthError, resolveAuthContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/log";
import { fail, ok } from "@/lib/api/responses";
import { createClient } from "@/lib/supabase/server";
import {
  createMessage,
  listMessages,
} from "@/services/communications/communications-service";
import { getRequestIp } from "@/utils/http";

function resolveOrgId(request: NextRequest) {
  return request.nextUrl.searchParams.get("orgId");
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ channelId: string }> }
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
    const { channelId } = await context.params;
    const { user } = await resolveAuthContext(orgId);
    const supabase = await createClient();
    const messages = await listMessages(supabase, orgId, channelId);

    await logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "messages",
      resourceId: channelId,
      action: "READ",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(messages);
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
      { code: "INTERNAL_ERROR", message: "Unable to fetch messages right now." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ channelId: string }> }
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
    const body = createMessageSchema.parse(await request.json());
    const { channelId } = await context.params;
    const { user } = await resolveAuthContext(orgId);
    const supabase = await createClient();

    const message = await createMessage(supabase, orgId, channelId, user.id, body);

    await logAudit({
      supabase,
      actorId: user.id,
      orgId,
      resourceType: "messages",
      resourceId: message.id,
      action: "CREATE",
      ipAddress: getRequestIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return ok(message, { status: 201 });
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
      { code: "INTERNAL_ERROR", message: "Unable to create message right now." },
      { status: 500 }
    );
  }
}
