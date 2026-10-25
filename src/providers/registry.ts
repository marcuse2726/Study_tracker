import type { PlatformDetail } from "@/lib/types";
import type { PlatformProvider } from "./types";
import { createMockProvider } from "./mock";
import { createCodeforcesProvider } from "./codeforces";

const mock = createMockProvider("codeforces");
const real = createCodeforcesProvider();

/**
 * 真实数据 + 降级包装：
 * - 用户名为空 -> 直接返回示例数据（不发起网络请求）；
 * - 真实数据获取失败（网络 / 用户不存在）-> 回退示例数据。
 */
function withFallback(
  realProvider: PlatformProvider,
  mockProvider: PlatformProvider,
): PlatformProvider {
  const warn = (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[StudyTracker] Codeforces 真实数据获取失败，回退示例数据：${msg}`);
  };

  return {
    id: realProvider.id,
    name: realProvider.name,
    source: realProvider.source,
    isMock: false,
    capabilities: realProvider.capabilities,
    async getSummary(username) {
      if (!username) return mockProvider.getSummary(username);
      try {
        return await realProvider.getSummary(username);
      } catch (err) {
        warn(err);
        return mockProvider.getSummary(username);
      }
    },
    async getDetail(username) {
      if (!username) return mockProvider.getDetail(username);
      try {
        return await realProvider.getDetail(username);
      } catch (err) {
        warn(err);
        return mockProvider.getDetail(username);
      }
    },
  };
}

const provider = withFallback(real, mock);

/** 获取 Codeforces 数据（空用户名 / 失败时回退示例数据） */
export async function getCodeforces(username: string): Promise<PlatformDetail> {
  return provider.getDetail(username);
}
