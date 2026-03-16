import { Suspense } from "react";

import { CommunicationsManager } from "@/components/features/communications/CommunicationsManager";
import { env } from "@/config/env";
import { getChannelsAndMessages } from "@/features/communications/server/get-channels";
import { withTimeout } from "@/lib/fetch-with-timeout";

async function CommunicationsData() {
  const orgId = env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  let channels: Awaited<ReturnType<typeof getChannelsAndMessages>>["channels"] = [];
  let messages: Awaited<ReturnType<typeof getChannelsAndMessages>>["messages"] = [];
  let hasError = false;

  try {
    const result = await withTimeout(getChannelsAndMessages(orgId));
    channels = result.channels;
    messages = result.messages;
  } catch {
    hasError = true;
  }

  if (!hasError) {
    return (
      <CommunicationsManager
        orgId={orgId}
        initialChannels={channels}
        initialMessages={messages}
      />
    );
  }

  return (
    <>
      <DataUnavailableBanner />
      <CommunicationsManager orgId={orgId} initialChannels={[]} initialMessages={[]} />
    </>
  );
}

export default function CommunicationsPage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Secure Messaging
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Communications</h2>
      </div>
      <Suspense fallback={<ChatSkeleton />}>
        <CommunicationsData />
      </Suspense>
    </section>
  );
}

function DataUnavailableBanner() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Could not load data — Supabase may be unavailable. Check your .env and project status.
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="w-48 shrink-0 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-slate-100" />
        ))}
      </div>
      <div className="flex-1 space-y-3">
        <div className="h-10 rounded-xl bg-slate-100" />
        <div className="h-40 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}
