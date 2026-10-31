"use client";

// ============================================================================
// algorithm-detail.tsx —— 选中算法的说明卡片
// ============================================================================
// 现在只展示算法本身的信息（名称 / 难度标签 / CF 标签 / 一句话说明 /
// 前置知识 / 掌握状态），不再展示题目推荐区块，避免占用版面。
//
// 题库数据仍完整保留在 public/data/luogu-pools.json 与
// public/data/cf-problems.json 里，随时可以重新接回来。
// ============================================================================

import { ALGORITHM_MAP, type AlgorithmNode } from "@/lib/algorithm/curriculum";
import { useProgress } from "@/lib/store/progress";
import { cn } from "@/lib/utils";

export function AlgorithmDetail({
  node,
  onSelect,
}: {
  node: AlgorithmNode | null;
  onSelect: (id: string) => void;
}) {
  const { mastery, cycleMastery } = useProgress();

  if (!node) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-card/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          点击上方拓扑图里的任意算法节点，这里会显示它的说明。
        </p>
      </div>
    );
  }

  const lv = mastery[node.id] ?? 0;

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card/40 p-4 sm:p-5">
      {/* 头部：名称 + 档位 + CF 标签 + 掌握状态 */}
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
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{node.desc}</p>
        </div>

        <button
          type="button"
          onClick={() => cycleMastery(node.id)}
          className={cn(
            "shrink-0 rounded-md border px-2.5 py-1.5 text-xs transition hover:brightness-125",
            lv === 2
              ? "border-emerald-400/70 bg-emerald-500/15 text-emerald-100"
              : lv === 1
                ? "border-sky-400/70 bg-sky-500/15 text-sky-100"
                : "border-border/70 bg-card text-muted-foreground",
          )}
        >
          状态：{lv === 0 ? "未学" : lv === 1 ? "学习中" : "已掌握"}
        </button>
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
    </div>
  );
}
