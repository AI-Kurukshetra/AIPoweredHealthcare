import type { CommunicationMessage } from "@/features/communications/types";
import { MessageThread } from "@/components/features/communications/MessageThread";

type MessageListProps = {
  messages: CommunicationMessage[];
};

export function MessageList({ messages }: MessageListProps) {
  return <MessageThread messages={messages} />;
}
