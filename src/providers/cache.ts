/** providers/cache.ts — 进程内 TTL 缓存 + 并发去重 */

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet(key: string, value: unknown, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * 带 TTL 缓存 + 并发去重的异步获取：
 * - 命中缓存直接返回；
 * - 未命中则执行 fn，成功结果写入缓存；
 * - 并发同 key 请求共享同一个 promise，避免重复请求。
 *
 * 注：内存缓存为进程级。本地开发与单实例部署有效；
 * 多实例 / Vercel Serverless 下需替换为 Redis / Upstash 等共享缓存。
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit !== undefined) return hit;

  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const p = fn()
    .then((value) => {
      cacheSet(key, value, ttlMs);
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, p);
  return p;
}
