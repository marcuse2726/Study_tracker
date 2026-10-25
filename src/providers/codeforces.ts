import { PLATFORM_MAP } from "@/lib/constants";
import type {
  Difficulty,
  DifficultyDist,
  HeatmapCell,
  PlatformDetail,
  PlatformSummary,
  RankPoint,
  RatingPoint,
  Submission,
  TagCount,
  Verdict,
} from "@/lib/types";
import { cached } from "./cache";
import { fetchJson, FetchError } from "./http";
import type { PlatformProvider } from "./types";
import { computeStreak } from "./utils";

/**
 * Codeforces 官方 API：https://codeforces.com/apiHelp
 * 无需认证，稳定。这里仅使用公开接口，遵守其频率限制（配合缓存）。
 */
const BASE = "https://codeforces.com/api";

const TTL_USER = 5 * 60 * 1000;
const TTL_STATUS = 5 * 60 * 1000;
const TTL_RATING = 10 * 60 * 1000;

interface CFResponse<T> {
  status: string;
  comment?: string;
  result: T;
}

interface CFUser {
  handle: string;
  rating?: number;
  rank?: string;
}

interface CFProblem {
  contestId?: number;
  index?: string;
  name?: string;
  rating?: number;
  tags?: string[];
}

interface CFSubmission {
  id: number;
  verdict?: string;
  problem?: CFProblem;
  creationTimeSeconds: number;
}

interface CFRatingChange {
  newRating: number;
  ratingUpdateTimeSeconds: number;
}

/** CF 标签英文 -> 中文 */
const CF_TAG_MAP: Record<string, string> = {
  dp: "动态规划",
  greedy: "贪心",
  math: "数学",
  graphs: "图论",
  "data structures": "数据结构",
  strings: "字符串",
  "binary search": "二分查找",
  "two pointers": "双指针",
  sortings: "排序",
  "brute force": "暴力枚举",
  "number theory": "数论",
  combinatorics: "组合数学",
  "constructive algorithms": "构造",
  implementation: "模拟",
  trees: "树",
  bitmasks: "位运算",
  "dfs and similar": "搜索",
  "shortest paths": "最短路",
  dsu: "并查集",
  "segment tree": "线段树",
  "divide and conquer": "分治",
  geometry: "计算几何",
  games: "博弈",
  probabilities: "概率",
  flows: "网络流",
  hashing: "哈希",
  matrices: "矩阵",
};

/** CF 段位 -> 中文 */
const CF_RANK_MAP: Record<string, string> = {
  newbie: "灰名 Newbie",
  pupil: "绿名 Pupil",
  specialist: "青名 Specialist",
  expert: "蓝名 Expert",
  "candidate master": "紫名 CM",
  master: "橙名 Master",
  "international master": "橙名 IM",
  grandmaster: "红名 GM",
  "international grandmaster": "红名 IGM",
  "legendary grandmaster": "黑红 LGM",
};

function mapVerdict(v?: string): Verdict {
  switch (v) {
    case "OK":
      return "AC";
    case "WRONG_ANSWER":
      return "WA";
    case "TIME_LIMIT_EXCEEDED":
      return "TLE";
    case "RUNTIME_ERROR":
      return "RE";
    case "COMPILATION_ERROR":
      return "CE";
    case "MEMORY_LIMIT_EXCEEDED":
      return "MLE";
    default:
      return "WA";
  }
}

function mapDifficulty(rating?: number): Difficulty {
  if (rating == null || rating < 1200) return "easy";
  if (rating < 1600) return "medium";
  return "hard";
}

function mapTag(tag: string): string {
  return CF_TAG_MAP[tag] ?? tag;
}

function mapRank(rank: string): string {
  return CF_RANK_MAP[rank] ?? rank;
}

/** Rating -> 近似百分位（前 X%，越小越靠前）。基于 CF 官方评级分段的粗略估计。 */
function ratingToPercentile(rating: number): number {
  if (rating >= 3000) return 0.1;
  if (rating >= 2600) return 0.4;
  if (rating >= 2400) return 1;
  if (rating >= 2100) return 3;
  if (rating >= 1900) return 6;
  if (rating >= 1600) return 13;
  if (rating >= 1400) return 25;
  if (rating >= 1200) return 40;
  if (rating >= 1000) return 55;
  if (rating >= 800) return 70;
  return 85;
}

async function fetchUser(handle: string): Promise<CFUser> {
  const data = await cached(`cf:user:${handle}`, TTL_USER, () =>
    fetchJson<CFResponse<CFUser[]>>(
      `${BASE}/user.info?handles=${encodeURIComponent(handle)}`,
    ),
  );
  if (data.status !== "OK" || !data.result?.length) {
    throw new FetchError(`Codeforces 用户不存在：${handle}`, 404);
  }
  return data.result[0];
}

async function fetchSubmissions(handle: string): Promise<CFSubmission[]> {
  const data = await cached(`cf:status:${handle}`, TTL_STATUS, () =>
    fetchJson<CFResponse<CFSubmission[]>>(
      `${BASE}/user.status?handle=${encodeURIComponent(handle)}&from=1&count=500`,
    ),
  );
  return data.status === "OK" ? data.result ?? [] : [];
}

async function fetchRating(handle: string): Promise<CFRatingChange[]> {
  const data = await cached(`cf:rating:${handle}`, TTL_RATING, () =>
    fetchJson<CFResponse<CFRatingChange[]>>(
      `${BASE}/user.rating?handle=${encodeURIComponent(handle)}`,
    ),
  );
  return data.status === "OK" ? data.result ?? [] : [];
}

async function buildDetail(handle: string): Promise<PlatformDetail> {
  const [user, rawSubs, ratingChanges] = await Promise.all([
    fetchUser(handle),
    fetchSubmissions(handle),
    fetchRating(handle),
  ]);

  const submissions: Submission[] = rawSubs.map((s) => ({
    id: `cf-${s.id}`,
    platform: "codeforces",
    problemId: `${s.problem?.contestId ?? 0}${s.problem?.index ?? ""}`,
    title: s.problem?.name ?? `Codeforces #${s.id}`,
    verdict: mapVerdict(s.verdict),
    difficulty: mapDifficulty(s.problem?.rating),
    tags: (s.problem?.tags ?? []).map(mapTag),
    submittedAt: new Date(s.creationTimeSeconds * 1000).toISOString(),
  }));

  // 去重统计 AC 题目的难度 / 标签
  const solved = new Set<string>();
  const difficulty: DifficultyDist = { easy: 0, medium: 0, hard: 0 };
  const tagMap = new Map<string, number>();
  for (const s of submissions) {
    if (s.verdict !== "AC" || solved.has(s.problemId)) continue;
    solved.add(s.problemId);
    difficulty[s.difficulty] += 1;
    for (const t of s.tags) tagMap.set(t, (tagMap.get(t) ?? 0) + 1);
  }

  const dayMap = new Map<string, number>();
  for (const s of submissions) {
    const d = s.submittedAt.slice(0, 10);
    dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
  }
  const heatmap: HeatmapCell[] = [...dayMap.entries()].map(
    ([date, count]) => ({ date, count }),
  );

  const ratingHistory: RatingPoint[] = ratingChanges.map((r) => ({
    date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().slice(0, 10),
    value: r.newRating,
  }));
  const rankHistory: RankPoint[] = ratingChanges.map((r) => ({
    date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().slice(0, 10),
    value: ratingToPercentile(r.newRating),
  }));

  const tags: TagCount[] = [...tagMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    id: "codeforces",
    name: PLATFORM_MAP.codeforces.name,
    source: "official-api",
    isMock: false,
    totalSolved: solved.size,
    totalSubmissions: submissions.length,
    rating: user.rating,
    rank: user.rank ? mapRank(user.rank) : undefined,
    difficulty,
    streakDays: computeStreak(new Set(dayMap.keys())),
    tags,
    recent: submissions.slice(0, 12),
    heatmap,
    ratingHistory,
    rankHistory,
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

export function createCodeforcesProvider(): PlatformProvider {
  return {
    id: "codeforces",
    name: PLATFORM_MAP.codeforces.name,
    source: "official-api",
    isMock: false,
    capabilities: { rating: true, rank: true, heatmap: true, tags: true },
    async getSummary(username) {
      return toSummary(await buildDetail(username));
    },
    async getDetail(username) {
      return buildDetail(username);
    },
  };
}
