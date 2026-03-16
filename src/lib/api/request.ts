import type { NextRequest } from "next/server";

import { env } from "@/config/env";

/** Resolves orgId from query: accepts "orgId" or "org"; "default" maps to NEXT_PUBLIC_DEFAULT_ORG_ID. */
export function resolveOrgId(request: NextRequest): string | null {
  const raw =
    request.nextUrl.searchParams.get("orgId") ??
    request.nextUrl.searchParams.get("org");
  if (!raw) return null;
  if (raw === "default") return env.NEXT_PUBLIC_DEFAULT_ORG_ID;
  return raw;
}

export type PaginationOptions = {
  page?: number;
  limit?: number;
  maxLimit?: number;
};

export type Pagination = {
  page: number;
  limit: number;
  offset: number;
};

function toPositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

export function resolvePagination(
  request: NextRequest,
  options: PaginationOptions = {}
): Pagination {
  const defaultPage = options.page ?? 1;
  const defaultLimit = options.limit ?? 50;
  const maxLimit = options.maxLimit ?? 200;

  const page = toPositiveInt(request.nextUrl.searchParams.get("page"), defaultPage);
  const requestedLimit = toPositiveInt(
    request.nextUrl.searchParams.get("limit"),
    defaultLimit
  );
  const limit = Math.min(requestedLimit, maxLimit);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function privateCacheHeaders(maxAgeSeconds = 30, staleWhileRevalidateSeconds = 120) {
  return {
    "Cache-Control": `private, max-age=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
  };
}

