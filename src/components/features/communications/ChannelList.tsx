import { EmptyState } from "@/components/shared/EmptyState";
import type { CommunicationChannel } from "@/features/communications/types";

type ChannelListProps = {
  channels: CommunicationChannel[];
};

export function ChannelList({ channels }: ChannelListProps) {
  if (!channels.length) {
    return (
      <EmptyState
        title="No channels yet"
        description="Team and patient communication channels will appear here."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-700">Channel</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Type</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Patient</th>
            <th className="px-4 py-3 font-semibold text-slate-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {channels.map((channel) => (
            <tr key={channel.id} className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-900">{channel.name}</td>
              <td className="px-4 py-3 capitalize text-slate-700">{channel.channelType}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">
                {channel.patientId ?? "N/A"}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {new Date(channel.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
