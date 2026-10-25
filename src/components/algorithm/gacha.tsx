"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Dices, RotateCcw, RotateCw, Sparkles } from "lucide-react";
import { useStudy } from "@/lib/store/study";
import {
  CATEGORY_COLORS,
  type Algorithm,
} from "@/components/algo-decoration/algorithms";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Phase = "idle" | "shaking" | "dropping" | "revealed";

const SPARKLES = [
  { left: "8%", top: "18%", delay: 0, size: 16 },
  { left: "22%", top: "6%", delay: 0.08, size: 12 },
  { left: "78%", top: "8%", delay: 0.05, size: 14 },
  { left: "90%", top: "26%", delay: 0.12, size: 16 },
  { left: "6%", top: "55%", delay: 0.15, size: 12 },
  { left: "92%", top: "52%", delay: 0.1, size: 12 },
];

/**
 * 算法扭蛋机：摇杆转动 → 机器晃动 → 胶囊落下弹跳 → 爆开闪光 + 星星 → 算法卡片弹出。
 * 每天按计划题数刷新，可扭 n 次（n = 今日计划题数）。
 */
export function GachaMachine() {
  const {
    todayLimit,
    todayDraws,
    todayRemaining,
    drawGacha,
    resetGacha,
  } = useStudy();
  const [phase, setPhase] = useState<Phase>("idle");
  const [algo, setAlgo] = useState<Algorithm | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const handleDraw = () => {
    if (todayRemaining <= 0) return;
    if (phase === "shaking" || phase === "dropping") return;
    const result = drawGacha();
    if (!result) return;
    setAlgo(result);
    setPhase("shaking");
    timers.current.forEach(clearTimeout);
    timers.current = [
      window.setTimeout(() => setPhase("dropping"), 750),
      window.setTimeout(() => setPhase("revealed"), 1650),
    ];
  };

  const handleReset = () => {
    resetGacha();
    setAlgo(null);
    setPhase("idle");
    timers.current.forEach(clearTimeout);
  };

  const accent = algo ? (CATEGORY_COLORS[algo.category] ?? "#8B5CF6") : "#8B5CF6";
  const shaking = phase === "shaking";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dices className="size-5 text-primary" />
          算法扭蛋机
        </CardTitle>
        <CardDescription>每天按计划题数刷新，扭出今天要练习的算法</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>
            今日计划 <b className="text-foreground">{todayLimit}</b> 题
          </span>
          <span>
            已扭 <b className="text-foreground">{todayDraws.length}</b> 次
          </span>
          <span>
            剩余 <b className="text-foreground">{todayRemaining}</b> 次
          </span>
        </div>

        {/* 扭蛋机主体 */}
        <div className="mt-4 flex flex-col items-center">
          <div
            className="relative"
            style={shaking ? { animation: "machine-shake 0.7s ease-in-out" } : undefined}
          >
            {/* 圆顶 */}
            <div className="relative mx-auto h-24 w-40 overflow-hidden rounded-t-full border-2 border-primary/30 bg-primary/10">
              <span className="absolute left-6 top-8 size-4 rounded-full bg-rose-400/70" />
              <span className="absolute left-12 top-14 size-3 rounded-full bg-sky-400/70" />
              <span className="absolute right-7 top-7 size-4 rounded-full bg-amber-400/70" />
              <span className="absolute right-12 top-14 size-3 rounded-full bg-emerald-400/70" />
              {/* 摇杆 */}
              <div className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border border-border bg-background">
                <RotateCw
                  className="size-4 text-primary"
                  style={
                    shaking
                      ? { animation: "crank-turn 0.7s linear infinite" }
                      : undefined
                  }
                />
              </div>
            </div>
            {/* 机身 + 出蛋口 */}
            <div className="relative mx-auto -mt-px h-12 w-36 rounded-b-2xl border-2 border-t-0 border-primary/30 bg-primary/10">
              <div className="absolute bottom-0 left-1/2 h-6 w-12 -translate-x-1/2 rounded-b-lg border border-t-0 border-primary/30 bg-background" />
            </div>
          </div>

          {/* 出蛋 + 揭晓区 */}
          <div className="relative mt-1 flex min-h-44 w-full items-center justify-center">
            {phase === "idle" ? (
              <div className="flex flex-col items-center text-muted-foreground/40">
                <Dices className="size-10" />
                <span className="mt-1 text-xs">点击「扭一次」试试手气</span>
              </div>
            ) : null}

            {phase === "dropping" ? (
              <Capsule
                color={accent}
                style={{ animation: "capsule-drop 0.9s ease-out" }}
              />
            ) : null}

            {phase === "revealed" && algo ? (
              <div className="relative flex items-center justify-center">
                {/* 爆裂光环 */}
                <span
                  className="pointer-events-none absolute size-28 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${accent}55, transparent 70%)`,
                    animation: "burst-ring 0.8s ease-out forwards",
                  }}
                />
                {/* 星星 */}
                {SPARKLES.map((s, i) => (
                  <span
                    key={i}
                    className="pointer-events-none absolute text-yellow-300"
                    style={{
                      left: s.left,
                      top: s.top,
                      fontSize: s.size,
                      animation: `sparkle-twinkle 0.9s ease-out ${s.delay}s forwards`,
                    }}
                  >
                    ✦
                  </span>
                ))}
                {/* 算法卡片 */}
                <div
                  className="relative z-10 flex flex-col items-center rounded-xl border bg-card px-5 py-3 text-center shadow-lg"
                  style={{
                    borderColor: accent,
                    animation: "algo-pop 0.5s ease-out",
                  }}
                >
                  <span className="text-[11px] font-medium" style={{ color: accent }}>
                    {algo.category}
                  </span>
                  <span className="mt-1 text-xl font-bold">{algo.name}</span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {algo.en}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* 按钮 */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            onClick={handleDraw}
            disabled={todayRemaining <= 0 || shaking || phase === "dropping"}
          >
            <Sparkles className="size-4" />
            扭一次
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleReset}
            disabled={todayDraws.length === 0}
          >
            <RotateCcw className="size-4" />
            重置次数
          </Button>
          {todayLimit <= 0 ? (
            <p className="text-xs text-muted-foreground">
              今天还没有计划，先在「每日计划」里设置今天的做题数目
            </p>
          ) : null}
        </div>

        {todayDraws.length > 0 ? (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground">今日扭出：</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {todayDraws.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Capsule({ color, style }: { color: string; style?: CSSProperties }) {
  return (
    <div className="relative h-14 w-9" style={style}>
      <div
        className="absolute inset-x-0 top-0 h-7 rounded-t-full"
        style={{ background: color }}
      />
      <div className="absolute inset-x-0 bottom-0 h-7 rounded-b-full bg-white/90" />
      <div className="absolute inset-x-1 top-1/2 h-px bg-black/10" />
    </div>
  );
}
