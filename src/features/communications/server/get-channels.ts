import { createAdminClient } from "@/lib/supabase/admin";
import { listChannels, listMessages } from "@/services/communications/communications-service";

export async function getChannels(orgId: string) {
  const supabase = createAdminClient();
  return listChannels(supabase, orgId);
}

export async function getMessages(orgId: string, channelId: string) {
  const supabase = createAdminClient();
  return listMessages(supabase, orgId, channelId);
}

/**
 * Fetches channels and first channel messages using a single shared Supabase client
 * to avoid the overhead of creating two separate client instances sequentially.
 */
export async function getChannelsAndMessages(orgId: string) {
  const supabase = createAdminClient();
  const channels = await listChannels(supabase, orgId);
  const firstChannel = channels[0];
  const messages = firstChannel
    ? await listMessages(supabase, orgId, firstChannel.id)
    : [];
  return { channels, messages };
}
