"use client";

// ============================================================================
// algorithm-tab.tsx —— 算法竞赛页的总装
// ============================================================================
// 页面从上到下的顺序：
//   ① 学习路径拓扑图（可切换 蓝桥杯 A 组 / ICPC）
//   ② 选中算法的详情 + 随机题目推荐
//   ③ 每日计划（原有功能，按你的要求下移）
//   ④ 扭蛋机（原有功能，放在每日计划之后——因为它按当天任务题量抽卡）
//   ⑤ Codeforces 数据统计（原有功能，放在最底部）
// ============================================================================

import { useState } from "react";
import { GachaMachine } from "./gacha";
import { DailyPlan } from "./daily-plan";
import { CodeforcesSection } from "./codeforces-section";
import { LearningPath } from "./learning-path";
import { AlgorithmDetail } from "./algorithm-detail";
import { useProgress } from "@/lib/store/progress";
import { ALGORITHM_MAP, nodesForMode, type Mode } from "@/lib/algorithm/curriculum";
import { cn } from "@/lib/utils";

const MODE_OPTIONS: { value: Mode; label: string; hint: string }[] = [
  { value: "lanqiao", label: "蓝桥杯 A 组", hint: "47 个节点 · 偏题海与模板" },
  { value: "icpc", label: "ICPC / ACM", hint: "58 个节点 · 算法广度深度" },
];

function ModeSwitch({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="flex rounded-lg border border-border/60 bg-card/40 p-0.5">
      {MODE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          title={opt.hint}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs transition",
            value === opt.value
              ? "bg-violet-500/25 text-violet-100 ring-1 ring-violet-400/50"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function AlgorithmTab() {
  const { mode, setMode, mastery } = useProgress();
  // 默认选中「双指针」：它是阶段 1 的节点，洛谷和 CF 两边都已有整理好的题目，
  // 首屏点开就能看到完整效果，不会是一片空白。
  const [selectedId, setSelectedId] = useState<string>("s1-twoptr");

  const visible = nodesForMode(mode);
  const selected = visible.find((n) => n.id === selectedId) ?? null;

  const masteredCount = visible.filter((n) => (mastery[n.id] ?? 0) === 2).length;
  const learningCount = visible.filter((n) => (mastery[n.id] ?? 0) === 1).length;

  return (
    <div className="space-y-6">
      {/* ① 学习路径 */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">学习路径</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              从「数组」出发，一步步长到动态规划与图论。点一个节点，下面给你随机出题。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-[11px] text-muted-foreground">
              已掌握 <span className="font-semibold text-emerald-300">{masteredCount}</span> /{" "}
              {visible.length}
              {learningCount > 0 && (
                <span className="ml-2 text-sky-300">学习中 {learningCount}</span>
              )}
            </div>
            <ModeSwitch value={mode} onChange={setMode} />
          </div>
        </div>

        <LearningPath
          mode={mode}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
        />
      </section>

      {/* ② 详情 + 随机题目 */}
      <section>
        <AlgorithmDetail node={selected} mode={mode} onSelect={setSelectedId} />
      </section>

      {/* ③ 每日计划 */}
      <section>
        <h2 className="mb-2 text-base font-semibold tracking-tight">每日计划</h2>
        <DailyPlan />
      </section>

      {/* ④ 扭蛋机 */}
      <section>
        <h2 className="mb-2 text-base font-semibold tracking-tight">算法扭蛋机</h2>
        <GachaMachine />
      </section>

      {/* ⑤ Codeforces 数据 */}
      <section>
        <h2 className="mb-2 text-base font-semibold tracking-tight">Codeforces 数据</h2>
        <CodeforcesSection />
      </section>
    </div>
  );
}
