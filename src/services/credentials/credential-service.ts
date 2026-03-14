import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CredentialListItem,
  CreateCredentialInput,
} from "@/features/credentials/types";
import type { Database } from "@/types/database.types";

export async function listCredentials(
  supabase: SupabaseClient<Database>,
  orgId: string,
  staffId?: string,
  options: { offset?: number; limit?: number } = {}
): Promise<CredentialListItem[]> {
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 200;
  let query = supabase
    .from("credentials")
    .select(
      "id, staff_id, credential_type, credential_number, issued_at, expires_at, status"
    )
    .eq("org_id", orgId)
    .order("expires_at", { ascending: true });

  if (staffId) {
    query = query.eq("staff_id", staffId);
  }

  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) {
    throw new Error("CREDENTIALS_LIST_FAILED");
  }

  return data.map((row) => ({
    id: row.id,
    staffId: row.staff_id,
    credentialType: row.credential_type,
    credentialNumber: row.credential_number,
    issuedAt: row.issued_at,
    expiresAt: row.expires_at,
    status: row.status,
  }));
}

export async function createCredential(
  supabase: SupabaseClient<Database>,
  orgId: string,
  userId: string,
  input: CreateCredentialInput
): Promise<CredentialListItem> {
  const { data, error } = await supabase
    .from("credentials")
    .insert({
      org_id: orgId,
      staff_id: input.staffId,
      credential_type: input.credentialType,
      credential_number: input.credentialNumber ?? null,
      issued_at: input.issuedAt ?? null,
      expires_at: input.expiresAt,
      status: input.status ?? "active",
      created_by: userId,
      updated_by: userId,
    })
    .select(
      "id, staff_id, credential_type, credential_number, issued_at, expires_at, status"
    )
    .single();

  if (error) {
    throw new Error("CREDENTIAL_CREATE_FAILED");
  }

  return {
    id: data.id,
    staffId: data.staff_id,
    credentialType: data.credential_type,
    credentialNumber: data.credential_number,
    issuedAt: data.issued_at,
    expiresAt: data.expires_at,
    status: data.status,
  };
}
