import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CommunicationChannel,
  CommunicationMessage,
  CreateChannelInput,
  CreateMessageInput,
} from "@/features/communications/types";
import type { Database } from "@/types/database.types";

export async function listChannels(
  supabase: SupabaseClient<Database>,
  orgId: string
): Promise<CommunicationChannel[]> {
  const { data, error } = await supabase
    .from("channels")
    .select("id, name, channel_type, patient_id, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error("CHANNEL_LIST_FAILED");
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    channelType: row.channel_type,
    patientId: row.patient_id,
    createdAt: row.created_at,
  }));
}

export async function createChannel(
  supabase: SupabaseClient<Database>,
  orgId: string,
  userId: string,
  input: CreateChannelInput
): Promise<CommunicationChannel> {
  const { data, error } = await supabase
    .from("channels")
    .insert({
      org_id: orgId,
      name: input.name,
      channel_type: input.channelType ?? "team",
      patient_id: input.patientId ?? null,
      created_by: userId,
      updated_by: userId,
    })
    .select("id, name, channel_type, patient_id, created_at")
    .single();

  if (error) {
    throw new Error("CHANNEL_CREATE_FAILED");
  }

  return {
    id: data.id,
    name: data.name,
    channelType: data.channel_type,
    patientId: data.patient_id,
    createdAt: data.created_at,
  };
}

export async function listMessages(
  supabase: SupabaseClient<Database>,
  orgId: string,
  channelId: string
): Promise<CommunicationMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, channel_id, sender_id, body, escalation_flag, created_at")
    .eq("org_id", orgId)
    .eq("channel_id", channelId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error("MESSAGE_LIST_FAILED");
  }

  return data.map((row) => ({
    id: row.id,
    channelId: row.channel_id,
    senderId: row.sender_id,
    body: row.body,
    escalationFlag: row.escalation_flag,
    createdAt: row.created_at,
  }));
}

export async function createMessage(
  supabase: SupabaseClient<Database>,
  orgId: string,
  channelId: string,
  userId: string,
  input: CreateMessageInput
): Promise<CommunicationMessage> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      org_id: orgId,
      channel_id: channelId,
      sender_id: userId,
      body: input.body,
      escalation_flag: input.escalationFlag ?? false,
      created_by: userId,
      updated_by: userId,
    })
    .select("id, channel_id, sender_id, body, escalation_flag, created_at")
    .single();

  if (error) {
    throw new Error("MESSAGE_CREATE_FAILED");
  }

  return {
    id: data.id,
    channelId: data.channel_id,
    senderId: data.sender_id,
    body: data.body,
    escalationFlag: data.escalation_flag,
    createdAt: data.created_at,
  };
}
