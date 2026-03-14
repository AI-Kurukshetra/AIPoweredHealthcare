import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

export type DashboardMetrics = {
  totalPatients: number;
  activePatients: number;
  visitsToday: number;
  openIncidents: number;
  openComplianceChecks: number;
};

type MetricError = {
  name?: string;
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

type CountResult = {
  count: number | null;
  error: MetricError | null;
};

const DEFAULT_QUERY_TIMEOUT_MS = 10000;

function resolveQueryTimeoutMs() {
  const raw = Number(process.env.DASHBOARD_QUERY_TIMEOUT_MS);
  if (!Number.isFinite(raw) || raw <= 0) {
    return DEFAULT_QUERY_TIMEOUT_MS;
  }
  return raw;
}

function isAbortedError(error: MetricError | null) {
  if (!error) {
    return false;
  }

  return (
    error.name === "AbortError" ||
    error.code === "ABORTED" ||
    error.message?.toLowerCase().includes("aborted") === true
  );
}

function startOfUtcDayIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

function safeCount(
  label: string,
  result: CountResult
) {
  if (result.error) {
    if (isAbortedError(result.error)) {
      return 0;
    }

    // Keep dashboard resilient without surfacing noisy runtime error overlays in dev.
    if (process.env.NODE_ENV !== "production") {
      console.warn("DASHBOARD_METRIC_QUERY_FAILED", {
        metric: label,
        error: result.error.message ?? "unknown_error",
        code: result.error.code ?? null,
      });
    }
    return 0;
  }

  return result.count ?? 0;
}

function normalizeError(error: unknown): MetricError {
  if (!error) {
    return { message: "unknown_error" };
  }

  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }

  if (typeof error === "object") {
    const candidate = error as Record<string, unknown>;
    return {
      name: typeof candidate.name === "string" ? candidate.name : undefined,
      message:
        typeof candidate.message === "string"
          ? candidate.message
          : "unknown_error",
      code: typeof candidate.code === "string" ? candidate.code : undefined,
      details:
        typeof candidate.details === "string"
          ? candidate.details
          : undefined,
      hint: typeof candidate.hint === "string" ? candidate.hint : undefined,
    };
  }

  return { message: "unknown_error" };
}

async function runCountQuery(
  label: string,
  execute: (signal: AbortSignal) => Promise<CountResult>
): Promise<CountResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), resolveQueryTimeoutMs());

  try {
    const result = await execute(controller.signal);
    if (result.error) {
      return result;
    }

    return { count: result.count ?? 0, error: null };
  } catch (error) {
    const normalizedError = normalizeError(error);
    return {
      count: 0,
      error: isAbortedError(normalizedError)
        ? { ...normalizedError, code: normalizedError.code ?? "ABORTED" }
        : normalizedError,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getDashboardMetrics(
  supabase: SupabaseClient<Database>,
  orgId: string
): Promise<DashboardMetrics> {
  const [totalPatientsResult, activePatientsResult, visitsTodayResult, openIncidentsResult, openComplianceResult] =
    await Promise.all([
      runCountQuery("totalPatients", async (signal) => {
        const result = await supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("org_id", orgId)
          .is("deleted_at", null)
          .abortSignal(signal);
        return { count: result.count, error: result.error };
      }),
      runCountQuery("activePatients", async (signal) => {
        const result = await supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("org_id", orgId)
          .eq("care_status", "active")
          .is("deleted_at", null)
          .abortSignal(signal);
        return { count: result.count, error: result.error };
      }),
      runCountQuery("visitsToday", async (signal) => {
        const result = await supabase
          .from("visits")
          .select("id", { count: "exact", head: true })
          .eq("org_id", orgId)
          .gte("created_at", startOfUtcDayIso())
          .is("deleted_at", null)
          .abortSignal(signal);
        return { count: result.count, error: result.error };
      }),
      runCountQuery("openIncidents", async (signal) => {
        const result = await supabase
          .from("incidents")
          .select("id", { count: "exact", head: true })
          .eq("org_id", orgId)
          .eq("status", "open")
          .is("deleted_at", null)
          .abortSignal(signal);
        return { count: result.count, error: result.error };
      }),
      runCountQuery("openComplianceChecks", async (signal) => {
        const result = await supabase
          .from("compliance_records")
          .select("id", { count: "exact", head: true })
          .eq("org_id", orgId)
          .neq("status", "compliant")
          .abortSignal(signal);
        return { count: result.count, error: result.error };
      }),
    ]);

  return {
    totalPatients: safeCount("totalPatients", totalPatientsResult),
    activePatients: safeCount("activePatients", activePatientsResult),
    visitsToday: safeCount("visitsToday", visitsTodayResult),
    openIncidents: safeCount("openIncidents", openIncidentsResult),
    openComplianceChecks: safeCount("openComplianceChecks", openComplianceResult),
  };
}
