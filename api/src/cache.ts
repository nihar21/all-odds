/**
 * Tiny in-memory TTL cache with single-flight de-duplication.
 *
 * Unlike the client's session cache (no TTL), entries expire so data refreshes,
 * and concurrent misses for the same key share one upstream request — important
 * for staying under the odds-API's rate limit when many clients hit the same
 * league at once.
 */
interface Entry<T> {
  expiresAt: number;
  value: T;
}

export class TtlCache {
  private store = new Map<string, Entry<unknown>>();
  private inflight = new Map<string, Promise<unknown>>();

  /**
   * Return the cached value for `key`, or run `loader` to populate it. The
   * loader runs at most once per key while in flight; its result is cached for
   * `ttlMs`. Loader errors are not cached.
   */
  async getOrLoad<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const hit = this.store.get(key);
    if (hit && hit.expiresAt > Date.now()) {
      return hit.value as T;
    }

    const pending = this.inflight.get(key);
    if (pending) return pending as Promise<T>;

    const promise = loader()
      .then((value) => {
        this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
        return value;
      })
      .finally(() => {
        this.inflight.delete(key);
      });

    this.inflight.set(key, promise);
    return promise;
  }

  clear(): void {
    this.store.clear();
    this.inflight.clear();
  }
}
