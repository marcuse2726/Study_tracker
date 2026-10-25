"use client";

import { useEffect, useRef } from "react";
import type { Algorithm } from "./algorithms";
import { CATEGORY_COLORS } from "./algorithms";

export interface AlgoBubbleData {
  id: number;
  x: number;
  y: number;
  algo: Algorithm;
  /** 动画时长（ms） */
  duration: number;
}

/**
 * 单个算法装饰气泡：pointer-events:none，完全穿透，
 * 淡入 -> 上浮 -> 淡出，动画结束后通知父组件移除。
 */
export function AlgoBubble({
  bubble,
  onDone,
}: {
  bubble: AlgoBubbleData;
  onDone: () => void;
}) {
  const doneRef = useRef(false);
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  // 兜底：即使 onAnimationEnd 未触发，也保证到时移除
  useEffect(() => {
    const t = setTimeout(finish, bubble.duration + 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { algo, x, y, duration } = bubble;
  const accent = CATEGORY_COLORS[algo.category] ?? "#8B5CF6";

  return (
    <div
      className="pointer-events-none fixed"
      style={{ left: x, top: y, transform: "translate(-50%, -120%)" }}
      aria-hidden="true"
    >
      <div
        onAnimationEnd={finish}
        className="pointer-events-none w-52 rounded-xl border border-border bg-card/95 p-3 text-left shadow-xl shadow-black/10 backdrop-blur-sm dark:shadow-black/40"
        style={{
          animation: `algo-float ${duration}ms ease-out forwards`,
          borderTop: `2px solid ${accent}`,
        }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: accent }}
          />
          <span
            className="text-[11px] font-medium"
            style={{ color: accent }}
          >
            {algo.category}
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            {algo.en}
          </span>
        </div>
        <div className="mt-1.5 text-sm font-semibold text-foreground">
          {algo.name}
        </div>
        <p className="mt-1 text-xs leading-snug text-muted-foreground">
          {algo.description}
        </p>
        <pre className="mt-2 line-clamp-2 overflow-hidden rounded-md bg-muted/70 px-2 py-1.5 font-mono text-[10px] leading-snug text-muted-foreground">
          {algo.pseudo}
        </pre>
      </div>
    </div>
  );
}
