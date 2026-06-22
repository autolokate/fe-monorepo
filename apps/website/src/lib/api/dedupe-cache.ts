/**
 * Tiny in-memory request deduplicator + TTL cache.
 *
 * Use cases:
 *  - Multiple components fetch the same endpoint independently — share one
 *    network call.
 *  - Strict-mode double-invocation in dev — only one real request goes out.
 *  - Repeat fetches within the TTL window (e.g. navigations) skip the network.
 *
 * NOT a full query cache — there's no invalidation, no background refetch.
 * Promote to `@tanstack/react-query` if those become necessary.
 */
interface CacheEntry<T> {
  data: T;
  expires: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

/**
 * Memoise a network request by `key` for `ttlMs` milliseconds. Concurrent
 * callers with the same key share the same promise.
 */
export async function dedupedRequest<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) {
    return entry.data as T;
  }
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fn()
    .then((data) => {
      cache.set(key, { data, expires: Date.now() + ttlMs });
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, promise);
  return promise;
}

/** Manually invalidate one or all cached keys (e.g. after a mutation). */
export function invalidateDedupeCache(key?: string): void {
  if (key === undefined) {
    cache.clear();
    inflight.clear();
    return;
  }
  cache.delete(key);
  inflight.delete(key);
}
