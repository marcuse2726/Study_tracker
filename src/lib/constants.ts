import type { Difficulty, PlatformId, Verdict } from "@/lib/types";

/** 平台元信息（品牌色、名称、主页等） */
export interface PlatformMeta {
  id: PlatformId;
  name: string;
  shortName: string;
  color: string;
  colorSoft: string;
  home: string;
}

export const PLATFORM_MAP: Record<PlatformId, PlatformMeta> = {
  codeforces: {
    id: "codeforces",
    name: "Codeforces",
    shortName: "CF",
    color: "#1F8ACB",
    colorSoft: "rgba(31,138,203,0.14)",
    home: "https://codeforces.com",
  },
};

export const CODEFORCES_META = PLATFORM_MAP.codeforces;

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; color: string }
> = {
  easy: { label: "简单", color: "#22C55E" },
  medium: { label: "中等", color: "#F59E0B" },
  hard: { label: "困难", color: "#EF4444" },
};

export const VERDICT_META: Record<Verdict, { label: string; color: string }> =
  {
    AC: { label: "通过", color: "#22C55E" },
    WA: { label: "答案错误", color: "#EF4444" },
    TLE: { label: "超时", color: "#F59E0B" },
    RE: { label: "运行错误", color: "#F97316" },
    CE: { label: "编译错误", color: "#A855F7" },
    MLE: { label: "内存超限", color: "#EC4899" },
  };

/** 点击算法装饰：同时存在的最大气泡数 */
export const MAX_ALGO_BUBBLES = 5;

/** 点击算法装饰：防重复的最近历史长度 */
export const ALGO_RECENT_WINDOW = 5;
