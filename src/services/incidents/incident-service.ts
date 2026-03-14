import type { SupabaseClient } from "@supabase/supabase-js";

import type { CreateIncidentInput, IncidentListItem } from "@/features/incidents/types";
import type { Database } from "@/types/database.types";

export async function listIncidents(
  supabase: SupabaseClient<Database>,
  orgId: string,
  options: { offset?: number; limit?: number } = {}
): Promise<IncidentListItem[]> {
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 50;
  const { data, error } = await supabase
    .from("incidents")
    .select("id, patient_id, severity, title, status, occurred_at, created_at")
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("occurred_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error("INCIDENTS_LIST_FAILED");
  }

  return data.map((row) => ({
    id: row.id,
    patientId: row.patient_id,
    severity: row.severity,
    title: row.title,
    status: row.status,
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  }));
}

export async function createIncident(
  supabase: SupabaseClient<Database>,
  orgId: string,
  userId: string,
  input: CreateIncidentInput
): Promise<IncidentListItem> {
  const { data, error } = await supabase
    .from("incidents")
    .insert({
      org_id: orgId,
      patient_id: input.patientId ?? null,
      reported_by: userId,
      severity: input.severity,
      title: input.title,
      description: input.description,
      status: "open",
      occurred_at: input.occurredAt,
      created_by: userId,
      updated_by: userId,
    })
    .select("id, patient_id, severity, title, status, occurred_at, created_at")
    .single();

  if (error) {
    throw new Error("INCIDENT_CREATE_FAILED");
  }

  return {
    id: data.id,
    patientId: data.patient_id,
    severity: data.severity,
    title: data.title,
    status: data.status,
    occurredAt: data.occurred_at,
    createdAt: data.created_at,
  };
}
