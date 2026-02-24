import { useCallback, useEffect, useRef, useState } from "react";

type AsyncOptions = { enabled?: boolean; cacheKey?: string | null; cacheTime?: number };
type RunnerArgs = { force?: boolean; args?: unknown[] };

type CacheValue = { at: number; data: unknown };
const cache = new Map<string, CacheValue>();

const readCache = (key?: string | null, maxAge = 0) => {
  if (!key || maxAge <= 0) return undefined;
  const item = cache.get(key);
  if (!item) return undefined;
  if (Date.now() - item.at > maxAge) {
    cache.delete(key);
    return undefined;
  }
  return item.data;
};

export function useAsync<T = unknown>(asyncFn: (...args: any[]) => Promise<T> | T, deps: any[] = [], options: AsyncOptions = {}) {
  const { enabled = true, cacheKey = null, cacheTime = 0 } = options;
  const fnRef = useRef(asyncFn);
  const mountedRef = useRef(true);
  const [data, setData] = useState<T | null>(() => (readCache(cacheKey, cacheTime) as T) || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => { fnRef.current = asyncFn; }, [asyncFn]);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const execute = useCallback(async ({ force = false, args = [] }: RunnerArgs = {}) => {
    if (!enabled || !fnRef.current) return null;
    const cached = !force ? readCache(cacheKey, cacheTime) : undefined;
    if (cached !== undefined) {
      if (mountedRef.current) setData(cached as T);
      return cached as T;
    }
    if (mountedRef.current) { setLoading(true); setError(null); }
    try {
      const next = (await fnRef.current(...args)) as T;
      if (cacheKey && cacheTime > 0) cache.set(cacheKey, { at: Date.now(), data: next });
      if (mountedRef.current) setData(next);
      return next;
    } catch (err) {
      if (mountedRef.current) setError(err);
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled, cacheKey, cacheTime]);

  const run = useCallback((...args: unknown[]) => execute({ args }), [execute]);
  const refresh = useCallback((...args: unknown[]) => execute({ force: true, args }), [execute]);

  useEffect(() => { if (enabled) void run(); }, [enabled, run, ...deps]);
  return { data, loading, error, run, refresh, setData };
}
