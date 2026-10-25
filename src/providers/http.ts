/** providers/http.ts — 统一网络请求工具（超时 / 重试 / UA / 错误分类） */

export class FetchError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "FetchError";
    this.status = status;
  }
}

const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 CodeStat/0.1";

export interface HttpOptions {
  timeoutMs?: number;
  retries?: number;
  headers?: Record<string, string>;
}

/**
 * 带超时 / 退避重试 / UA 的 fetch + JSON 解析。
 * - 网络类错误（超时、ECONNRESET 等）会退避重试；
 * - 限流(429) / 封禁(403) / 不存在(404) 视为致命错误，直接抛出不再重试；
 * - 响应非 JSON（如反爬 HTML 挑战页）时原样返回文本，交由调用方判断。
 */
export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  options?: HttpOptions,
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? 15_000;
  const retries = options?.retries ?? 1;
  const baseHeaders: Record<string, string> = {
    "User-Agent": DEFAULT_UA,
    Accept: "application/json, text/plain, */*",
    ...(options?.headers ?? {}),
  };

  let lastError: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          ...baseHeaders,
          ...(init?.headers as Record<string, string> | undefined),
        },
        signal: controller.signal,
        cache: "no-store",
      });

      if (res.status === 429 || res.status === 403) {
        throw new FetchError(`请求被限流或拒绝（${res.status}）`, res.status);
      }
      if (res.status === 404) {
        throw new FetchError("用户或资源不存在（404）", 404);
      }
      if (!res.ok) {
        throw new FetchError(`请求失败（${res.status}）`, res.status);
      }

      const text = await res.text();
      if (!text) return undefined as unknown as T;
      try {
        return JSON.parse(text) as T;
      } catch {
        // 非 JSON（如 HTML 挑战页），原样返回文本供调用方识别
        return text as unknown as T;
      }
    } catch (err) {
      lastError = err;
      const fatal =
        err instanceof FetchError &&
        (err.status === 403 || err.status === 404 || err.status === 429);
      if (fatal || attempt >= retries) break;
      // 退避后重试
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
