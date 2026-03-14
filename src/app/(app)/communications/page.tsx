import { ChannelList } from "@/components/features/communications/ChannelList";
import { MessageThread } from "@/components/features/communications/MessageThread";
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
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">Communications</h2>
      <ChannelList channels={channels} />
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recent Messages {selectedChannel ? `(${selectedChannel.name})` : ""}
        </h3>
        <MessageThread messages={messages} />
      </div>
    </section>
  );
}
