import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  BillingRecordListItem,
  CreateBillingRecordInput,
} from "@/features/billing/types";
import type { Database } from "@/types/database.types";

export async function listBillingRecords(
  supabase: SupabaseClient<Database>,
  orgId: string,
  options: { offset?: number; limit?: number } = {}
): Promise<BillingRecordListItem[]> {
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 100;
  const { data, error } = await supabase
    .from("billing_records")
    .select(
      "id, visit_id, patient_id, cpt_code, icd10_code, units, amount_cents, status, created_at"
    )
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error("BILLING_LIST_FAILED");
  }

  return data.map((row) => ({
    id: row.id,
    visitId: row.visit_id,
    patientId: row.patient_id,
    cptCode: row.cpt_code,
    icd10Code: row.icd10_code,
    units: row.units,
    amountCents: row.amount_cents,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function createBillingRecord(
  supabase: SupabaseClient<Database>,
  orgId: string,
  userId: string,
  input: CreateBillingRecordInput
): Promise<BillingRecordListItem> {
  const { data, error } = await supabase
    .from("billing_records")
    .insert({
      org_id: orgId,
      visit_id: input.visitId ?? null,
      patient_id: input.patientId ?? null,
      cpt_code: input.cptCode,
      icd10_code: input.icd10Code ?? null,
      units: input.units ?? 1,
      amount_cents: input.amountCents,
      status: input.status ?? "pending",
      created_by: userId,
      updated_by: userId,
    })
    .select(
      "id, visit_id, patient_id, cpt_code, icd10_code, units, amount_cents, status, created_at"
    )
    .single();

  if (error) {
    throw new Error("BILLING_CREATE_FAILED");
  }

  return {
    id: data.id,
    visitId: data.visit_id,
    patientId: data.patient_id,
    cptCode: data.cpt_code,
    icd10Code: data.icd10_code,
    units: data.units,
    amountCents: data.amount_cents,
    status: data.status,
    createdAt: data.created_at,
  };
}
