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
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.35)]">
      {messages.map((message) => (
        <article
          key={message.id}
          className="rounded-xl border border-slate-200/80 bg-slate-50/75 p-3"
        >
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
