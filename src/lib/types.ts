/**
 * 全站共享的类型定义。
 * 当前仅支持 Codeforces（算法竞赛），未来可扩展更多数据源。
 */

/** 支持的平台 ID（当前仅 Codeforces） */
export type PlatformId = "codeforces";

/** 归一化难度：简单 / 中等 / 困难 */
export type Difficulty = "easy" | "medium" | "hard";

/** 提交判定结果 */
export type Verdict = "AC" | "WA" | "TLE" | "RE" | "CE" | "MLE";

/** 数据来源类型 */
export type DataSource = "official-api" | "mock";

/** 难度分布 */
export interface DifficultyDist {
  easy: number;
  medium: number;
  hard: number;
}

/** 标签及其出现次数 */
export interface TagCount {
  name: string;
  count: number;
}

/** Rating 曲线上的一个点 */
export interface RatingPoint {
  /** YYYY-MM-DD */
  date: string;
  value: number;
}

/** 排名变化曲线上的一个点 */
export interface RankPoint {
  /** YYYY-MM-DD */
  date: string;
  value: number;
}

/** 一次提交记录 */
export interface Submission {
  id: string;
  platform: PlatformId;
  problemId: string;
  title: string;
  verdict: Verdict;
  difficulty: Difficulty;
  tags: string[];
  /** YYYY-MM-DDTHH:mm:ss */
  submittedAt: string;
}

/** 提交热力图中的一个格子 */
export interface HeatmapCell {
  /** YYYY-MM-DD */
  date: string;
  count: number;
}

/** Codeforces 概览 */
export interface PlatformSummary {
  id: PlatformId;
  name: string;
  source: DataSource;
  isMock: boolean;
  totalSolved: number;
  totalSubmissions: number;
  rating?: number;
  rank?: string;
  difficulty: DifficultyDist;
  streakDays: number;
}

/** Codeforces 详情 */
export interface PlatformDetail extends PlatformSummary {
  tags: TagCount[];
  recent: Submission[];
  heatmap: HeatmapCell[];
  ratingHistory: RatingPoint[];
  rankHistory: RankPoint[];
}

/** Rating 曲线（统一用数组表示，便于图表组件复用） */
export interface RatingSeries {
  platform: PlatformId;
  name: string;
  points: RatingPoint[];
}
