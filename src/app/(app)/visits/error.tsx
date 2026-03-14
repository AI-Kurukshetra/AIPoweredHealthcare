"use client";

export default function VisitsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isTimeout = error?.message?.includes("timed out");
  const isSupabaseError =
    error?.message?.includes("FAILED") || error?.message?.includes("PATIENTS_LIST");
  return (
    <section className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700">
      <p className="font-medium">
        {isTimeout
          ? "Data took too long to load."
          : "Unable to load visits right now."}
      </p>
      <p className="mt-2 text-sm opacity-90">
        {isTimeout
          ? "Check your Supabase project is active and .env (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) is correct."
          : isSupabaseError
            ? `Supabase error: ${error?.message ?? "Unknown"}`
            : "Please try again."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
      >
        Retry
      </button>
    </section>
  );
}
