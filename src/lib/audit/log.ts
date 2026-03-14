import type { SupabaseClient } from "@supabase/supabase-js";

import type { Json, Database } from "@/types/database.types";

type AuditAction = "READ" | "CREATE" | "UPDATE" | "DELETE" | "EXPORT";

type AuditLogParams = {
  supabase: SupabaseClient<Database>;
  actorId: string | null;
  orgId: string;
  resourceType: string;
  resourceId?: string | null;
  action: AuditAction;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Json;
};

export async function logAudit(params: AuditLogParams) {
  const {
    supabase,
    actorId,
    orgId,
    resourceType,
    resourceId,
    action,
    ipAddress,
    userAgent,
    metadata,
  } = params;

  const { error } = await supabase.from("audit_logs").insert({
    actor_id: actorId,
    org_id: orgId,
    resource_type: resourceType,
    resource_id: resourceId ?? null,
    action,
    ip_address: ipAddress ?? null,
    user_agent: userAgent ?? null,
    metadata: metadata ?? null,
    occurred_at: new Date().toISOString(),
  });

  // Audit logging should not block the primary request path.
  if (error) {
    console.error("AUDIT_LOG_WRITE_FAILED");
  }
}
