import type { ApiResponse } from "@/types/api.types";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

function buildUrl(path: string, query?: QueryParams) {
  const url = new URL(path, "http://localhost");
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || typeof value === "undefined") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return `${url.pathname}${url.search}`;
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
  const response = await fetch(buildUrl(path, query), { cache: "no-store" });
  return parseResponse<T>(response);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  query?: QueryParams
) {
  const response = await fetch(buildUrl(path, query), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "undefined" ? undefined : JSON.stringify(body),
  });
  return parseResponse<T>(response);
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
  query?: QueryParams
) {
  const response = await fetch(buildUrl(path, query), {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: typeof body === "undefined" ? undefined : JSON.stringify(body),
  });
  return parseResponse<T>(response);
}

