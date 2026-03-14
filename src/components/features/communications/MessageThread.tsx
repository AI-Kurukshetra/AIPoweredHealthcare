import { EmptyState } from "@/components/shared/EmptyState";
import type { CommunicationMessage } from "@/features/communications/types";

type MessageThreadProps = {
  messages: CommunicationMessage[];
};

export function MessageThread({ messages }: MessageThreadProps) {
  if (!messages.length) {
    return (
      <EmptyState
        title="No messages yet"
        description="Message history for the selected channel will appear here."
      />
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      {messages.map((message) => (
        <article key={message.id} className="rounded-md border border-slate-100 p-3">
          <p className="text-sm text-slate-900">{message.body}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono">{message.senderId}</span>
            <span>
              {new Date(message.createdAt).toLocaleString()}
              {message.escalationFlag ? " - Escalated" : ""}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
