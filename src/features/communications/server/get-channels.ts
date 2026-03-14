import { createClient } from "@/lib/supabase/server";
import { listChannels, listMessages } from "@/services/communications/communications-service";

export async function getChannels(orgId: string) {
  const supabase = await createClient();
  return listChannels(supabase, orgId);
}

export async function getMessages(orgId: string, channelId: string) {
  const supabase = await createClient();
  return listMessages(supabase, orgId, channelId);
}
