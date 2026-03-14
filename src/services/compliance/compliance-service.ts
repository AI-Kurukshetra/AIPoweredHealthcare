import type { SupabaseClient } from "@supabase/supabase-js";

import type { ComplianceListItem, CreateComplianceInput } from "@/features/compliance/types";
import type { Database } from "@/types/database.types";

export async function listComplianceRecords(
  supabase: SupabaseClient<Database>,
  orgId: string,
  options: { offset?: number; limit?: number } = {}
): Promise<ComplianceListItem[]> {
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 100;
  const { data, error } = await supabase
    .from("compliance_records")
    .select("id, credential_id, staff_id, status, checked_at, details")
    .eq("org_id", orgId)
    .order("checked_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error("COMPLIANCE_LIST_FAILED");
  }

  return data.map((row) => ({
    id: row.id,
    credentialId: row.credential_id,
    staffId: row.staff_id,
    status: row.status,
    checkedAt: row.checked_at,
    details: row.details,
  }));
}

export async function createComplianceRecord(
  supabase: SupabaseClient<Database>,
  orgId: string,
  userId: string,
  input: CreateComplianceInput
): Promise<ComplianceListItem> {
  const { data, error } = await supabase
    .from("compliance_records")
    .insert({
      org_id: orgId,
      credential_id: input.credentialId ?? null,
      staff_id: input.staffId ?? null,
      status: input.status,
      checked_at: input.checkedAt ?? new Date().toISOString(),
      details: input.details ?? null,
      created_by: userId,
      updated_by: userId,
    })
    .select("id, credential_id, staff_id, status, checked_at, details")
    .single();

  if (error) {
    throw new Error("COMPLIANCE_CREATE_FAILED");
  }

  return {
    id: data.id,
    credentialId: data.credential_id,
    staffId: data.staff_id,
    status: data.status,
    checkedAt: data.checked_at,
    details: data.details,
  };
}
