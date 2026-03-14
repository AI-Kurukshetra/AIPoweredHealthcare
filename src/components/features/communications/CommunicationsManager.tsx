"use client";

import { useEffect, useMemo, useState } from "react";

import { ChannelList } from "@/components/features/communications/ChannelList";
import { MessageThread } from "@/components/features/communications/MessageThread";
import type { CommunicationChannel, CommunicationMessage } from "@/features/communications/types";

type ApiResponse<T> = { data: T | null; error: { message: string } | null };

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
  const [channels, setChannels] = useState(initialChannels);
  const [messages, setMessages] = useState(initialMessages);
  const [selectedChannelId, setSelectedChannelId] = useState(initialChannels[0]?.id ?? "");
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState<"team" | "patient">("team");
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) ?? null,
    [channels, selectedChannelId]
  );

  useEffect(() => {
    if (!selectedChannelId) {
      setMessages([]);
      return;
    }

    const endpoint = `/api/communications/${selectedChannelId}/messages?orgId=${orgId}`;
    void (async () => {
      const response = await fetch(endpoint, { cache: "no-store" });
      const payload = (await response.json()) as ApiResponse<CommunicationMessage[]>;
      if (response.ok && payload.data) {
        setMessages(payload.data);
      }
    })();
  }, [orgId, selectedChannelId]);

  async function createChannel() {
    setIsBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/communications?orgId=${orgId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: channelName, channelType }),
      });
      const payload = (await response.json()) as ApiResponse<CommunicationChannel>;
      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Unable to create channel.");
        return;
      }
      setChannels((current) => [payload.data!, ...current]);
      setSelectedChannelId(payload.data.id);
      setChannelName("");
    } catch {
      setError("Unable to create channel.");
    } finally {
      setIsBusy(false);
    }
  }

  async function sendMessage() {
    if (!selectedChannelId) return;
    setIsBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/communications/${selectedChannelId}/messages?orgId=${orgId}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ body: messageText }),
        }
      );
      const payload = (await response.json()) as ApiResponse<CommunicationMessage>;
      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Unable to send message.");
        return;
      }
      setMessages((current) => [payload.data!, ...current]);
      setMessageText("");
    } catch {
      setError("Unable to send message.");
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

      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-700">
          Message composer {selectedChannel ? `(${selectedChannel.name})` : ""}
        </p>
        <div className="flex gap-2">
          <input
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder="Type secure message"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={isBusy || !selectedChannelId || !messageText.trim()}
            className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
          Recent Messages
        </h3>
        <MessageThread messages={messages} />
      </div>
    </div>
  );
}
