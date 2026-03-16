import type { ApiResponse } from "@/types/api.types";
import { env } from "@/config/env";

const API_TIMEOUT_MS = 15_000;

type QueryParams = Record<string, string | number | boolean | null | undefined>;

/** Use "default" in URLs when org is the default org for shorter query strings. */
function buildUrl(path: string, query?: QueryParams) {
  const url = new URL(path, "http://localhost");
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || typeof value === "undefined") continue;
      const str =
        key === "orgId" && String(value) === env.NEXT_PUBLIC_DEFAULT_ORG_ID
          ? "default"
          : String(value);
      url.searchParams.set(key, str);
    }
  }
  return `${url.pathname}${url.search}`;
}

function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms = API_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...init, signal: controller.signal })
    .catch((err) => {
      if (err?.name === "AbortError") {
        throw new Error(
          "Request timed out. Check your connection and Supabase status."
        );
      }
      throw err;
    })
    .finally(() => clearTimeout(timeout));
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !("data" in payload) || payload.data === null) {
    const message =
      "error" in payload && payload.error
        ? payload.error.message
        : "Request failed.";
    throw new Error(message);
  }
  return payload.data;
}

export async function apiGet<T>(path: string, query?: QueryParams) {
  const response = await fetchWithTimeout(
    buildUrl(path, query),
    {
      cache: "default",
      credentials: "include",
    },
    API_TIMEOUT_MS
  );
  return parseResponse<T>(response);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  query?: QueryParams
) {
  const response = await fetchWithTimeout(
    buildUrl(path, query),
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "undefined" ? undefined : JSON.stringify(body),
      credentials: "include",
    },
    API_TIMEOUT_MS
  );
  return parseResponse<T>(response);
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
  query?: QueryParams
) {
  const response = await fetchWithTimeout(
    buildUrl(path, query),
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: typeof body === "undefined" ? undefined : JSON.stringify(body),
      credentials: "include",
    },
    API_TIMEOUT_MS
  );
  return parseResponse<T>(response);
}

