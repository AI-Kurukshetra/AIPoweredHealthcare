import { NextResponse } from "next/server";

import type { ApiError, ApiSuccess } from "@/types/api.types";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ data, error: null }, init);
}

export function fail(
  error: ApiError["error"],
  init?: Omit<ResponseInit, "status"> & { status: number }
) {
  return NextResponse.json<ApiError>(
    {
      data: null,
      error,
    },
    init
  );
}
