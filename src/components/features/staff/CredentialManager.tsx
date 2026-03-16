"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CredentialListItem } from "@/features/credentials/types";
import { apiGet, apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

type CredentialManagerProps = {
  orgId: string;
  staffId: string;
  initialCredentials: CredentialListItem[];
};

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
}

export function CredentialManager({
  orgId,
  staffId,
  initialCredentials,
}: CredentialManagerProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { data: credentials = initialCredentials } = useQuery({
    queryKey: queryKeys.credentials(orgId, staffId, 1, 200),
    queryFn: () =>
      apiGet<CredentialListItem[]>("/api/credentials", {
        orgId,
        staffId,
        page: 1,
        limit: 200,
      }),
    initialData: initialCredentials,
  });
  const [credentialType, setCredentialType] = useState("");
  const [credentialNumber, setCredentialNumber] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = useMemo(
    () =>
      credentials.filter((credential) =>
        statusFilter === "all" ? true : credential.status === statusFilter
      ),
    [credentials, statusFilter]
  );

  const createCredentialMutation = useMutation({
    mutationFn: (input: {
      staffId: string;
      credentialType: string;
      credentialNumber?: string;
      expiresAt: string;
    }) => apiPost<CredentialListItem>("/api/credentials", input, { orgId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["credentials", orgId] });
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message || "Unable to create credential.");
    },
  });

  async function create() {
    setIsSubmitting(true);
    setError(null);
    try {
      await createCredentialMutation.mutateAsync({
        staffId,
        credentialType,
        credentialNumber: credentialNumber || undefined,
        expiresAt: new Date(expiresAt).toISOString(),
      });
      setCredentialType("");
      setCredentialNumber("");
      setExpiresAt("");
    } catch {
      // handled by mutation onError
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <input
          value={credentialType}
          onChange={(event) => setCredentialType(event.target.value)}
          placeholder="Credential type"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={credentialNumber}
          onChange={(event) => setCredentialNumber(event.target.value)}
          placeholder="Credential number"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={create}
          disabled={isSubmitting || !credentialType.trim() || !expiresAt}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Add Credential"}
        </button>
      </div>

      <div className="max-w-xs">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="expiring_soon">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {!filtered.length ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No credentials found for this staff member.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Type</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Number</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Issued</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Expires</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((credential) => (
                <tr key={credential.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-900">
                    {credential.credentialType}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {credential.credentialNumber ?? "N/A"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(credential.issuedAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(credential.expiresAt)}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">
                    {credential.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

