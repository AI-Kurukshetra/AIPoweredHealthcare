import { CommunicationsManager } from "@/components/features/communications/CommunicationsManager";
import { env } from "@/config/env";
import {
  getChannels,
  getMessages,
} from "@/features/communications/server/get-channels";

export default async function CommunicationsPage() {
  const channels = await getChannels(env.NEXT_PUBLIC_DEFAULT_ORG_ID);
  const selectedChannel = channels[0];
  const messages = selectedChannel
    ? await getMessages(env.NEXT_PUBLIC_DEFAULT_ORG_ID, selectedChannel.id)
    : [];

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Secure Messaging
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Communications</h2>
      </div>
      <CommunicationsManager
        orgId={env.NEXT_PUBLIC_DEFAULT_ORG_ID}
        initialChannels={channels}
        initialMessages={messages}
      />
    </section>
  );
}
