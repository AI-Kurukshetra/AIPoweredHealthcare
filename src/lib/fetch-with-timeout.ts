/**
 * Wraps a Promise with a timeout. If the promise doesn't resolve within `ms`,
 * rejects so the error boundary can show feedback instead of infinite loading.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms = 8_000,
  message = "Request timed out. Check your Supabase connection and .env configuration."
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms)
  );
  return Promise.race([promise, timeout]);
}
