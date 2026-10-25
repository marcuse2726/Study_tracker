import type {
  PlatformDetail,
  PlatformSummary,
  DataSource,
} from "@/lib/types";

/**
 * 数据源 Provider 统一接口（可插拔架构的核心）。
 *
 * 新增一个平台只需要：
 * 1. 新建 `providers/<id>.ts`，实现本接口；
 * 2. 在 `providers/registry.ts` 的注册表中登记一行。
 * 前端与 API 路由完全无需改动。
 */
export interface PlatformProvider {
  id: PlatformSummary["id"];
  name: string;
  source: DataSource;
  isMock: boolean;

  /** 能力声明：前端据此决定是否渲染对应图表（例如牛客暂无 Rating） */
  capabilities: {
    rating: boolean;
    rank: boolean;
    heatmap: boolean;
    tags: boolean;
  };

  /** 获取平台概览（统计卡片等轻量数据） */
  getSummary(username: string): Promise<PlatformSummary>;

  /** 获取平台详情（图表 / 热力图 / 最近提交等完整数据） */
  getDetail(username: string): Promise<PlatformDetail>;
}
