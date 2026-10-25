import { PLATFORM_MAP } from "@/lib/constants";
import type {
  Difficulty,
  DifficultyDist,
  HeatmapCell,
  PlatformDetail,
  PlatformId,
  PlatformSummary,
  RankPoint,
  RatingPoint,
  Submission,
  TagCount,
  Verdict,
} from "@/lib/types";
import type { PlatformProvider } from "./types";
import { computeStreak, DAY_MS, fmtDate } from "./utils";

/* ------------------------------------------------------------------ */
/* 确定性伪随机：同一用户名 -> 同一份数据（方便演示与测试）              */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

interface MockProfile {
  totalSolved: number;
  totalSubmissions: number;
  rating: number;
  rank: string;
  rankStart: number;
  rankEnd: number;
  hasRating: boolean;
  hasRank: boolean;
  extraTags: string[];
}

const PROFILE: MockProfile = {
  totalSolved: 245,
  totalSubmissions: 540,
  rating: 1680,
  rank: "Specialist",
  rankStart: 55,
  rankEnd: 21,
  hasRating: true,
  hasRank: true,
  extraTags: ["贪心", "构造", "数论", "图论", "数据结构", "DP"],
};

const BASE_TAGS = [
  "动态规划", "贪心", "字符串", "数学", "图论", "搜索", "树", "哈希表",
  "数组", "双指针", "滑动窗口", "二分查找", "栈", "队列", "堆", "并查集",
  "回溯", "分治", "位运算", "排序", "前缀和", "差分", "单调栈", "拓扑排序",
  "最短路", "背包",
];

const DIFFICULTIES: Array<{ value: Difficulty; weight: number }> = [
  { value: "easy", weight: 45 },
  { value: "medium", weight: 40 },
  { value: "hard", weight: 15 },
];

const NON_AC: Array<{ value: Verdict; weight: number }> = [
  { value: "WA", weight: 55 },
  { value: "TLE", weight: 25 },
  { value: "RE", weight: 12 },
  { value: "CE", weight: 5 },
  { value: "MLE", weight: 3 },
];

const TITLE_A = ["最长", "最短", "最大", "最小", "第K个", "区间", "连续", "环形", "交替", "严格", "不同", "相等"];
const TITLE_B = ["递增", "递减", "公共", "不重复", "回文", "有序", "相同", "平衡", "合法", "零一", ""];
const TITLE_C = ["子串", "子序列", "子数组", "路径和", "个数", "排列", "组合", "矩阵", "子树", "节点", "元素"];

function pickWeighted<T>(
  items: Array<{ value: T; weight: number }>,
  rng: () => number,
): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = rng() * total;
  for (const it of items) {
    r -= it.weight;
    if (r < 0) return it.value;
  }
  return items[items.length - 1].value;
}

function makeTitle(rng: () => number): string {
  const a = TITLE_A[Math.floor(rng() * TITLE_A.length)];
  const b = TITLE_B[Math.floor(rng() * TITLE_B.length)];
  const c = TITLE_C[Math.floor(rng() * TITLE_C.length)];
  return a + b + c;
}

function fmtTime(rng: () => number): string {
  const h = String(9 + Math.floor(rng() * 12)).padStart(2, "0");
  const m = String(Math.floor(rng() * 60)).padStart(2, "0");
  return `${h}:${m}:00`;
}

function generateRating(rng: () => number): RatingPoint[] {
  const points: RatingPoint[] = [];
  const steps = 42;
  const start = PROFILE.rating - 260 + rng() * 80;
  let v = start;
  const now = new Date();
  for (let i = 0; i < steps; i++) {
    const progress = i / (steps - 1);
    const target = start + (PROFILE.rating - start) * progress;
    v = v * 0.72 + target * 0.28 + (rng() - 0.5) * 46;
    const date = new Date(now.getTime() - (steps - 1 - i) * 7 * DAY_MS);
    points.push({ date: fmtDate(date), value: Math.round(v) });
  }
  points[points.length - 1] = { date: fmtDate(new Date()), value: PROFILE.rating };
  return points;
}

function generateRank(rng: () => number): RankPoint[] {
  const points: RankPoint[] = [];
  const steps = 42;
  const now = new Date();
  let v = PROFILE.rankStart;
  for (let i = 0; i < steps; i++) {
    const progress = i / (steps - 1);
    const target = PROFILE.rankStart + (PROFILE.rankEnd - PROFILE.rankStart) * progress;
    v = v * 0.7 + target * 0.3 + (rng() - 0.5) * 4;
    const date = new Date(now.getTime() - (steps - 1 - i) * 7 * DAY_MS);
    points.push({ date: fmtDate(date), value: Math.max(1, Math.round(v * 10) / 10) });
  }
  points[points.length - 1] = { date: fmtDate(new Date()), value: PROFILE.rankEnd };
  return points;
}

function generateData(id: PlatformId, username: string): PlatformDetail {
  const rng = mulberry32(hashString(`${id}:${username || "demo"}`));
  const tagPool = Array.from(new Set([...PROFILE.extraTags, ...BASE_TAGS]));

  const problems: Array<{
    pid: string;
    title: string;
    difficulty: Difficulty;
    tags: string[];
  }> = [];
  for (let i = 0; i < PROFILE.totalSolved; i++) {
    const difficulty = pickWeighted(DIFFICULTIES, rng);
    const tagCount = 1 + Math.floor(rng() * 3);
    const tags: string[] = [];
    while (tags.length < tagCount) {
      const t = tagPool[Math.floor(rng() * tagPool.length)];
      if (!tags.includes(t)) tags.push(t);
    }
    problems.push({
      pid: `CF-${1000 + i}`,
      title: makeTitle(rng),
      difficulty,
      tags,
    });
  }

  const submissions: Submission[] = [];
  const activeDays = new Set<string>();
  const now = new Date();

  const addSubmission = (
    problem: (typeof problems)[number],
    verdict: Verdict,
    dayOffset: number,
  ) => {
    const date = new Date(now.getTime() - dayOffset * DAY_MS);
    const dateStr = fmtDate(date);
    submissions.push({
      id: `${id}-${submissions.length}`,
      platform: id,
      problemId: problem.pid,
      title: problem.title,
      verdict,
      difficulty: problem.difficulty,
      tags: problem.tags,
      submittedAt: `${dateStr}T${fmtTime(rng)}`,
    });
    activeDays.add(dateStr);
  };

  const streakBoost = 3 + Math.floor(rng() * 6);
  for (let d = 0; d < streakBoost; d++) {
    const count = 1 + Math.floor(rng() * 4);
    for (let k = 0; k < count; k++) {
      const p = problems[Math.floor(rng() * problems.length)];
      addSubmission(p, rng() < 0.6 ? "AC" : pickWeighted(NON_AC, rng), d);
    }
  }

  for (const p of problems) {
    const dayOffset = Math.floor(Math.pow(rng(), 1.6) * 364);
    addSubmission(p, "AC", dayOffset);
  }

  const attempts = Math.max(0, PROFILE.totalSubmissions - PROFILE.totalSolved);
  for (let i = 0; i < attempts; i++) {
    const p = problems[Math.floor(rng() * problems.length)];
    const dayOffset = Math.floor(Math.pow(rng(), 1.6) * 364);
    addSubmission(p, pickWeighted(NON_AC, rng), dayOffset);
  }

  submissions.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  const difficulty: DifficultyDist = { easy: 0, medium: 0, hard: 0 };
  const tagMap = new Map<string, number>();
  for (const p of problems) {
    difficulty[p.difficulty] += 1;
    for (const t of p.tags) tagMap.set(t, (tagMap.get(t) ?? 0) + 1);
  }
  const tags: TagCount[] = [...tagMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const dayCount = new Map<string, number>();
  for (const s of submissions) {
    const d = s.submittedAt.slice(0, 10);
    dayCount.set(d, (dayCount.get(d) ?? 0) + 1);
  }
  const heatmap: HeatmapCell[] = [...dayCount.entries()].map(
    ([date, count]) => ({ date, count }),
  );

  return {
    id,
    name: PLATFORM_MAP[id].name,
    source: "mock",
    isMock: true,
    totalSolved: problems.length,
    totalSubmissions: submissions.length,
    rating: PROFILE.hasRating ? PROFILE.rating : undefined,
    rank: PROFILE.hasRank ? PROFILE.rank : undefined,
    difficulty,
    streakDays: computeStreak(activeDays),
    tags,
    recent: submissions.slice(0, 12),
    heatmap,
    ratingHistory: PROFILE.hasRating ? generateRating(rng) : [],
    rankHistory: PROFILE.hasRank ? generateRank(rng) : [],
  };
}

function toSummary(d: PlatformDetail): PlatformSummary {
  return {
    id: d.id,
    name: d.name,
    source: d.source,
    isMock: d.isMock,
    totalSolved: d.totalSolved,
    totalSubmissions: d.totalSubmissions,
    rating: d.rating,
    rank: d.rank,
    difficulty: d.difficulty,
    streakDays: d.streakDays,
  };
}

export function createMockProvider(id: PlatformId): PlatformProvider {
  return {
    id,
    name: PLATFORM_MAP[id].name,
    source: "mock",
    isMock: true,
    capabilities: {
      rating: PROFILE.hasRating,
      rank: PROFILE.hasRank,
      heatmap: true,
      tags: true,
    },
    async getSummary(username) {
      return toSummary(generateData(id, username));
    },
    async getDetail(username) {
      return generateData(id, username);
    },
  };
}
