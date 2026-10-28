"use client";

// ============================================================================
// algorithm-detail.tsx —— 选中算法的详情 + 随机题目推荐
// ============================================================================
// 数据来源分两类：
//   洛谷    → 预置精选表（在 curriculum.ts 里，人工整理，链接直达）
//   CF      → public/data/cf-problems.json（官方 API 快照，7891 道题）
//             按「标签 + rating 区间」本地筛选后随机抽，所以每次都不一样
//
// 随机策略：
//   每个难度档独立随机抽 3 道；
//   「换一批」只需要把 seed 加一，整块重新随机；
//   30 天内做过的题会被排除（除非池子里实在不够）。
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ALGORITHM_MAP,
  LEVELS,
  RATING_RANGE,
  cfUrl,
  csdnSearchUrl,
  luoguUrl,
  type AlgorithmNode,
  type Level,
  type Mode,
} from "@/lib/algorithm/curriculum";
import { useProgress } from "@/lib/store/progress";

// ---------------------------------------------------------------------------
// Codeforces 快照
// ---------------------------------------------------------------------------
interface CfSnapshot {
  tags: string[];
  /** [contestId, index, rating, name, ...tagId] */
  problems: (string | number)[][];
}

let cfCache: CfSnapshot | null = null;
let cfLoading: Promise<CfSnapshot> | null = null;

function loadCf(): Promise<CfSnapshot> {
  if (cfCache) return Promise.resolve(cfCache);
  if (!cfLoading) {
    cfLoading = fetch("/data/cf-problems.json")
      .then((r) => r.json() as Promise<CfSnapshot>)
      .then((d) => {
        cfCache = d;
        return d;
      })
      .catch(() => ({ tags: [], problems: [] }));
  }
  return cfLoading;
}

// ---------------------------------------------------------------------------
// 可复现的伪随机（同一个 seed 得到同一批题，换 seed 就换一批）
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
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

function pickRandom<T>(items: T[], count: number, rand: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

interface ProblemItem {
  key: string;
  label: string;
  url: string;
  meta: string;
}

/** 每个难度档抽几道 */
const PER_SLOT = 3;

export function AlgorithmDetail({
  node,
  mode,
  onSelect,
}: {
  node: AlgorithmNode | null;
  mode: Mode;
  onSelect: (id: string) => void;
}) {
  const { mastery, cycleMastery, done, toggleDone, isRecentlyDone } = useProgress();
  const [seed, setSeed] = useState(0);
  const [snapshot, setSnapshot] = useState<CfSnapshot | null>(null);

  useEffect(() => {
    let alive = true;
    loadCf().then((d) => {
      if (alive) setSnapshot(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  // 换算法时自动换一批题
  useEffect(() => {
    setSeed(0);
  }, [node?.id]);

  const tagIds = useMemo(() => {
    if (!node?.cfTags || !snapshot) return [];
    return node.cfTags
      .map((t) => snapshot.tags.indexOf(t))
      .filter((i) => i >= 0);
  }, [node, snapshot]);

  const blocks = useMemo(() => {
    if (!node) return [];
    const rand = mulberry32(hashString(`${node.id}:${seed}`));
    const range = RATING_RANGE[mode];

    return LEVELS.map((level: Level) => {
      const [lo, hi] = range[level];

      // 洛谷：从精选题里随机挑
      const luoguPool: ProblemItem[] = (node.luogu?.[level] ?? []).map((p) => ({
        key: `luogu:${p.id}`,
        label: p.id,
        url: luoguUrl(p.id),
        meta: p.name,
      }));

      // Codeforces：按标签 + rating 区间筛，再随机抽
      let cfPool: ProblemItem[] = [];
      if (snapshot && tagIds.length > 0) {
        const rows = snapshot.problems.filter((row) => {
          const rating = row[2] as number;
          if (rating < lo || rating > hi) return false;
          const rowTags = row.slice(4) as number[];
          return tagIds.some((id) => rowTags.includes(id));
        });
        cfPool = rows.map((row) => {
          const cid = row[0] as number;
          const idx = row[1] as string;
          return {
            key: `cf:${cid}${idx}`,
            label: `${cid}${idx}`,
            url: cfUrl(cid, idx),
            meta: `${row[3] as string} · ${row[2] as number}`,
          };
        });
      }

      /** 优先排除最近做过的；不够再放开 */
      const choose = (pool: ProblemItem[]) => {
        const fresh = pool.filter((p) => !isRecentlyDone(p.key));
        const picked = pickRandom(fresh, PER_SLOT, rand);
        if (picked.length < PER_SLOT) {
          const rest = pool.filter((p) => !picked.some((q) => q.key === p.key));
          picked.push(...pickRandom(rest, PER_SLOT - picked.length, rand));
        }
        return picked;
      };

      return {
        level,
        range: `${lo}–${hi}`,
        luogu: choose(luoguPool),
        cf: choose(cfPool),
        cfTotal: cfPool.length,
      };
    });
  }, [node, mode, seed, snapshot, tagIds, isRecentlyDone]);

  if (!node) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-card/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          点击上方拓扑图里的任意算法节点，这里会显示它的说明和随机推荐题目。
        </p>
      </div>
    );
  }

  const lv = mastery[node.id] ?? 0;
  const hasLuogu = LEVELS.some((l) => (node.luogu?.[l]?.length ?? 0) > 0);
  const hasCf = tagIds.length > 0;
  const nothingYet = !hasLuogu && !hasCf;

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4 sm:p-5">
      {/* 头部 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">{node.name}</h2>
            <span className="rounded border border-border/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {node.tier === "core" ? "必学" : node.tier === "adv" ? "进阶" : "选学"}
            </span>
            {node.cfTags?.map((t) => (
              <span
                key={t}
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{node.desc}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cycleMastery(node.id)}
            className={cn(
              "rounded-md border px-2.5 py-1.5 text-xs transition hover:brightness-125",
              lv === 2
                ? "border-emerald-400/70 bg-emerald-500/15 text-emerald-100"
                : lv === 1
                  ? "border-sky-400/70 bg-sky-500/15 text-sky-100"
                  : "border-border/70 bg-card text-muted-foreground",
            )}
          >
            状态：{lv === 0 ? "未学" : lv === 1 ? "学习中" : "已掌握"}
          </button>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="rounded-md border border-violet-400/60 bg-violet-500/15 px-3 py-1.5 text-xs text-violet-100 transition hover:brightness-125"
          >
            换一批
          </button>
        </div>
      </div>

      {/* 前置知识 */}
      {node.prereq.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>前置：</span>
          {node.prereq.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onSelect(p)}
              className="rounded border border-border/60 px-1.5 py-0.5 hover:bg-accent hover:text-foreground"
            >
              {ALGORITHM_MAP[p]?.name ?? p}
            </button>
          ))}
        </div>
      )}

      {/* 尚未整理题目的提示 */}
      {nothingYet && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 text-[11.5px] leading-relaxed text-amber-100/90">
          这个知识点的题目还在整理中。当前试点已整理好 8 个高频算法：前缀和 · 二分答案 ·
          双指针 · 单调队列 · DFS · 并查集 · 背包 · 最短路。
        </div>
      )}

      {/* 三个难度档 */}
      <div className="space-y-4">
        {blocks.map((b) => (
          <div key={b.level} className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{b.level}</h3>
              <span className="font-mono text-[10px] text-muted-foreground">
                CF {b.range}
              </span>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              {/* 洛谷区块 */}
              <ProblemBlock
                title="洛谷"
                accent="text-sky-300"
                items={b.luogu}
                emptyText={
                  hasLuogu
                    ? "这一档暂未收录洛谷题"
                    : "洛谷题目整理中（试点阶段只整理了 8 个算法）"
                }
                done={done}
                onToggle={toggleDone}
                recent={isRecentlyDone}
              />
              {/* Codeforces 区块 */}
              <ProblemBlock
                title="Codeforces"
                accent="text-amber-300"
                items={b.cf}
                emptyText={
                  snapshot === null
                    ? "题目数据加载中…"
                    : hasCf
                      ? "这个难度区间内暂时没有匹配的题"
                      : "CF 没有对应的细粒度标签，只在洛谷区块出题"
                }
                done={done}
                onToggle={toggleDone}
                recent={isRecentlyDone}
                footer={
                  b.cfTotal > 0 ? `本档共 ${b.cfTotal} 道候选，随时可以换一批` : undefined
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* CSDN 速查 */}
      <div className="space-y-1.5 border-t border-border/60 pt-3">
        <p className="text-xs text-muted-foreground">CSDN 速查（点击跳转搜索结果）</p>
        <div className="flex flex-wrap gap-1.5">
          {[`${node.name} C++ 模板`, `${node.name} 入门讲解`, `${node.name} 例题`].map(
            (kw) => (
              <a
                key={kw}
                href={csdnSearchUrl(kw)}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-border/60 px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {kw} ↗
              </a>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function ProblemBlock({
  title,
  accent,
  items,
  emptyText,
  done,
  onToggle,
  recent,
  footer,
}: {
  title: string;
  accent: string;
  items: ProblemItem[];
  emptyText: string;
  done: Record<string, number>;
  onToggle: (key: string) => void;
  recent: (key: string) => boolean;
  footer?: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <span className={cn("text-xs font-semibold", accent)}>{title}</span>
        <span className="text-[10px] text-muted-foreground">{items.length} 道</span>
      </div>
      {items.length === 0 ? (
        <p className="py-2 text-[11px] leading-relaxed text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((it) => {
            const isDone = Boolean(done[it.key]);
            return (
              <li key={it.key} className="group flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggle(it.key)}
                  title={isDone ? "取消标记" : "标记为做过"}
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border text-[9px]",
                    isDone
                      ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-300"
                      : "border-border/70 text-transparent hover:border-muted-foreground",
                  )}
                >
                  ✓
                </button>
                <a
                  href={it.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 flex-1 items-baseline gap-1.5 text-[11.5px] hover:underline"
                >
                  <span className="shrink-0 font-mono text-foreground">{it.label}</span>
                  <span className="truncate text-muted-foreground">{it.meta}</span>
                </a>
                {recent(it.key) && (
                  <span className="shrink-0 text-[9px] text-emerald-400/80">近期做过</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {footer && <p className="mt-1.5 text-[10px] text-muted-foreground/80">{footer}</p>}
    </div>
  );
}
