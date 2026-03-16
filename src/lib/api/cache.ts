import { unstable_cache } from "next/cache";

/**
 * Default revalidate time for list/cacheable reads (60s) to reduce disk I/O.
 * Data may be up to 60s stale but significantly cuts database load.
 */
export const LIST_CACHE_REVALIDATE_SEC = 60;

/**
 * Wraps a fetch function in unstable_cache for list APIs.
 * Use for read-heavy endpoints that can tolerate short staleness.
 */
export function createCachedFetcher<T, Args extends unknown[]>(
  fetcher: (...args: Args) => Promise<T>,
  keyPrefix: string,
  keyParts: (args: Args) => string[],
  revalidate = LIST_CACHE_REVALIDATE_SEC
) {
  return (...args: Args): Promise<T> => {
    const key = [keyPrefix, ...keyParts(args)];
    return unstable_cache(
      () => fetcher(...args),
      key,
      { revalidate }
    )();
  };
}
