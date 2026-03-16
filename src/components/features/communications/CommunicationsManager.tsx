"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ChannelList } from "@/components/features/communications/ChannelList";
import { ChatInterface } from "@/components/features/communications/ChatInterface";
import { MessageInput } from "@/components/features/communications/MessageInput";
import { MessageList } from "@/components/features/communications/MessageList";
import type { CommunicationChannel, CommunicationMessage } from "@/features/communications/types";
import { apiGet, apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { useToast } from "@/hooks/useToast";

type CommunicationsManagerProps = {
  orgId: string;
  initialChannels: CommunicationChannel[];
  initialMessages: CommunicationMessage[];
};

export function CommunicationsManager({
  orgId,
  initialChannels,
  initialMessages,
}: CommunicationsManagerProps) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [selectedChannelId, setSelectedChannelId] = useState(initialChannels[0]?.id ?? "");
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState<"team" | "patient">("team");
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const { data: channels = initialChannels } = useQuery({
    queryKey: queryKeys.channels(orgId, 1, 200),
    queryFn: () =>
      apiGet<CommunicationChannel[]>("/api/communications", { orgId, page: 1, limit: 50 }),
    initialData: initialChannels,
  });
  const { data: messages = initialMessages } = useQuery({
    queryKey: queryKeys.messages(orgId, selectedChannelId, 1, 200),
    queryFn: () =>
      apiGet<CommunicationMessage[]>(
        `/api/communications/${selectedChannelId}/messages`,
        { orgId, page: 1, limit: 50 }
      ),
    enabled: Boolean(selectedChannelId),
    initialData: selectedChannelId ? initialMessages : [],
  });

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) ?? null,
    [channels, selectedChannelId]
  );

  useEffect(() => {
    setSelectedChannelId((current) => {
      if (!channels.length) return "";
      if (!current || !channels.some((channel) => channel.id === current)) {
        return channels[0]!.id;
      }
      return current;
    });
  }, [channels]);

  const createChannelMutation = useMutation({
    mutationFn: () =>
      apiPost<CommunicationChannel>(
        "/api/communications",
        { name: channelName, channelType },
        { orgId }
      ),
    onSuccess: async (newChannel) => {
      await queryClient.invalidateQueries({ queryKey: ["communications", orgId] });
      setSelectedChannelId(newChannel.id);
      setChannelName("");
      showSuccess({
        title: "Channel created",
        description: `"${newChannel.name}" is ready for messages.`,
      });
    },
    onError: (mutationError: Error) => {
      const message = mutationError.message || "Unable to create channel.";
      setError(message);
      showError({
        title: "Channel not created",
        description: message,
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: () =>
      apiPost<CommunicationMessage>(
        `/api/communications/${selectedChannelId}/messages`,
        { body: messageText },
        { orgId }
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.messages(orgId, selectedChannelId, 1, 200),
      });
      setMessageText("");
      showSuccess({
        title: "Message sent",
        description: "Your message was delivered to the channel.",
      });
    },
    onError: (mutationError: Error) => {
      const message = mutationError.message || "Unable to send message.";
      setError(message);
      showError({
        title: "Message not sent",
        description: message,
      });
    },
  });

  async function createChannel() {
    setIsBusy(true);
    setError(null);
    try {
      await createChannelMutation.mutateAsync();
    } catch {
      // handled in mutation onError
    } finally {
      setIsBusy(false);
    }
  }

  async function sendMessage() {
    if (!selectedChannelId) return;
    setIsBusy(true);
    setError(null);
    try {
      await sendMessageMutation.mutateAsync();
    } catch {
      // handled in mutation onError
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <input
          value={channelName}
          onChange={(event) => setChannelName(event.target.value)}
          placeholder="New channel name"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={channelType}
          onChange={(event) => setChannelType(event.target.value as "team" | "patient")}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="team">Team</option>
          <option value="patient">Patient</option>
        </select>
        <select
          value={selectedChannelId}
          onChange={(event) => setSelectedChannelId(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {channels.map((channel) => (
            <option key={channel.id} value={channel.id}>
              {channel.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={createChannel}
          disabled={isBusy || !channelName.trim()}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isBusy ? "Saving..." : "Create Channel"}
        </button>
      </div>

      <ChannelList channels={channels} />

      <ChatInterface
        title={`Message composer${selectedChannel ? ` (${selectedChannel.name})` : ""}`}
      >
        <MessageInput
          value={messageText}
          onChange={setMessageText}
          onSend={sendMessage}
          disabled={isBusy || !selectedChannelId}
        />
      </ChatInterface>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
          Recent Messages
        </h3>
        <MessageList messages={messages} />
      </div>
    </div>
  );
}
