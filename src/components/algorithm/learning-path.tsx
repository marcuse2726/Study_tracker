"use client";

// ============================================================================
// learning-path.tsx —— 算法学习路径拓扑图
// ============================================================================
// 这是「算法竞赛」页最上面的那一大块。用 SVG 画依赖连线，用绝对定位的
// 按钮画节点，整体套一层 CSS transform 实现缩放与拖动。
//
// 交互：
//   点击节点        → 选中它（下方会显示该算法的题目推荐）
//   点击节点右上角圆点 → 循环切换掌握状态：未学 → 学习中 → 已掌握
//   滚轮            → 缩放
//   拖动空白处       → 平移
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ALGORITHMS,
  STAGES,
  nodesForMode,
  visiblePrereq,
  type AlgorithmNode,
  type Mode,
} from "@/lib/algorithm/curriculum";
import { useProgress } from "@/lib/store/progress";

/** 节点尺寸与间距（画布坐标系，不受缩放影响） */
const NODE_W = 152;
const NODE_H = 58;
const GAP_X = 30;
const ROW_H = 148;
/** 左侧留给阶段标题的宽度 */
const LABEL_W = 132;

interface Placed {
  node: AlgorithmNode;
  x: number;
  y: number;
}

/** 按阶段分行、行内均匀排布，算出每个节点的坐标 */
function layout(mode: Mode): { placed: Placed[]; width: number; height: number } {
  const nodes = nodesForMode(mode);
  const byStage = new Map<number, AlgorithmNode[]>();
  for (const n of nodes) {
    const arr = byStage.get(n.stage) ?? [];
    arr.push(n);
    byStage.set(n.stage, arr);
  }

  let maxCount = 1;
  for (const arr of byStage.values()) maxCount = Math.max(maxCount, arr.length);

  const rowWidth = maxCount * (NODE_W + GAP_X);
  const width = LABEL_W + rowWidth + 24;
  const height = STAGES.length * ROW_H + 24;

  const placed: Placed[] = [];
  for (const [stage, arr] of byStage) {
    const startX = LABEL_W + (rowWidth - arr.length * (NODE_W + GAP_X)) / 2;
    arr.forEach((node, i) => {
      placed.push({
        node,
        x: startX + i * (NODE_W + GAP_X),
        y: stage * ROW_H + 18,
      });
    });
  }
  return { placed, width, height };
}

const MASTERY_STYLE: Record<number, string> = {
  0: "border-border/70 bg-card/85 text-foreground",
  1: "border-sky-400/70 bg-sky-500/15 text-sky-100",
  2: "border-emerald-400/70 bg-emerald-500/15 text-emerald-100",
};

const MASTERY_DOT: Record<number, string> = {
  0: "bg-muted-foreground/40",
  1: "bg-sky-400",
  2: "bg-emerald-400",
};

export function LearningPath({
  mode,
  selectedId,
  onSelect,
}: {
  mode: Mode;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { mastery, cycleMastery } = useProgress();
  const { placed, width, height } = useMemo(() => layout(mode), [mode]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ scale: 0.8, x: 0, y: 0 });
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  /** 切换模式时自动缩放到刚好铺满宽度 */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const s = Math.min(1, (el.clientWidth - 16) / width);
    setView({ scale: s, x: 0, y: 0 });
  }, [width]);

  /** 滚轮缩放：需要非 passive 监听才能阻止页面跟着滚 */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setView((v) => {
        const next = Math.min(1.6, Math.max(0.35, v.scale * (e.deltaY > 0 ? 0.92 : 1.08)));
        const rect = el.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        // 以鼠标位置为锚点缩放
        return {
          scale: next,
          x: cx - ((cx - v.x) * next) / v.scale,
          y: cy - ((cy - v.y) * next) / v.scale,
        };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragRef.current = {
        sx: e.clientX,
        sy: e.clientY,
        ox: view.x,
        oy: view.y,
        moved: false,
      };
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [view.x, view.y],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
    setView((v) => ({ ...v, x: d.ox + dx, y: d.oy + dy }));
  }, []);

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  /** 节点位置索引，供画连线用 */
  const posById = useMemo(() => {
    const map = new Map<string, Placed>();
    for (const p of placed) map.set(p.node.id, p);
    return map;
  }, [placed]);

  const edges = useMemo(() => {
    const list: { id: string; d: string; level: number }[] = [];
    for (const p of placed) {
      for (const pre of visiblePrereq(p.node, mode)) {
        const from = posById.get(pre);
        if (!from) continue;
        const x1 = from.x + NODE_W / 2;
        const y1 = from.y + NODE_H;
        const x2 = p.x + NODE_W / 2;
        const y2 = p.y;
        // 同一行用横向弧线，跨行用纵向贝塞尔
        const d =
          Math.abs(y1 - y2) < 4
            ? `M ${x1} ${y1 - NODE_H / 2} C ${x1 + 60} ${y1 - NODE_H / 2}, ${x2 - 60} ${y2 - NODE_H / 2}, ${x2} ${y2 - NODE_H / 2}`
            : `M ${x1} ${y1} C ${x1} ${y1 + 46}, ${x2} ${y2 - 46}, ${x2} ${y2}`;
        list.push({
          id: `${pre}->${p.node.id}`,
          d,
          level: mastery[p.node.id] ?? 0,
        });
      }
    }
    return list;
  }, [placed, posById, mode, mastery]);

  return (
    <div className="space-y-2">
      <div
        ref={wrapRef}
        className={cn(
          "relative h-[560px] w-full overflow-hidden rounded-xl border border-border/60 bg-card/30",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width,
            height,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
        >
          <svg width={width} height={height} className="absolute left-0 top-0">
            {/* 阶段背景带 */}
            {STAGES.map((s) =>
              nodesForMode(mode).some((n) => n.stage === s.index) ? (
                <g key={s.index}>
                  <rect
                    x={4}
                    y={s.index * ROW_H + 6}
                    width={width - 8}
                    height={NODE_H + 24}
                    rx={14}
                    fill="currentColor"
                    className="text-foreground/5"
                  />
                  <text
                    x={16}
                    y={s.index * ROW_H + 26}
                    className="fill-foreground/70 text-[13px] font-semibold"
                  >
                    {s.title}
                  </text>
                  <text
                    x={16}
                    y={s.index * ROW_H + 44}
                    className="fill-muted-foreground/70 text-[10px]"
                  >
                    {s.hint}
                  </text>
                </g>
              ) : null,
            )}

            {/* 依赖连线 */}
            {edges.map((e) => (
              <path
                key={e.id}
                d={e.d}
                fill="none"
                strokeWidth={e.level === 2 ? 2 : 1.4}
                className={cn(
                  e.level === 2
                    ? "stroke-emerald-400/60"
                    : e.level === 1
                      ? "stroke-sky-400/50"
                      : "stroke-border",
                )}
                strokeDasharray={e.level === 0 ? "4 4" : undefined}
              />
            ))}
          </svg>

          {/* 节点 */}
          {placed.map(({ node, x, y }) => {
            const lv = mastery[node.id] ?? 0;
            const selected = selectedId === node.id;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => {
                  if (dragRef.current?.moved) return;
                  onSelect(node.id);
                }}
                style={{ left: x, top: y, width: NODE_W, height: NODE_H }}
                className={cn(
                  "absolute flex flex-col justify-center rounded-lg border px-2 text-left transition",
                  "hover:brightness-125",
                  MASTERY_STYLE[lv],
                  selected && "ring-2 ring-violet-400 ring-offset-1 ring-offset-background",
                )}
                title={node.desc}
              >
                <span className="line-clamp-2 text-[11.5px] font-medium leading-tight">
                  {node.name}
                </span>
                <span className="mt-0.5 text-[9px] text-muted-foreground">
                  {node.tier === "core" ? "必学" : node.tier === "adv" ? "进阶" : "选学"}
                </span>
                {/* 右上角：掌握状态切换圆点 */}
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    cycleMastery(node.id);
                  }}
                  className={cn(
                    "absolute right-1.5 top-1.5 size-2.5 rounded-full ring-1 ring-background",
                    MASTERY_DOT[lv],
                  )}
                  title="点击切换：未学 / 学习中 / 已掌握"
                />
              </button>
            );
          })}
        </div>

        {/* 右下角控制条 */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg border border-border/60 bg-background/80 p-1 backdrop-blur">
          <button
            type="button"
            onClick={() => setView((v) => ({ ...v, scale: Math.max(0.35, v.scale - 0.12) }))}
            className="flex size-7 items-center justify-center rounded text-sm hover:bg-accent"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setView((v) => ({ ...v, scale: Math.min(1.6, v.scale + 0.12) }))}
            className="flex size-7 items-center justify-center rounded text-sm hover:bg-accent"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => {
              const el = wrapRef.current;
              const s = el ? Math.min(1, (el.clientWidth - 16) / width) : 0.8;
              setView({ scale: s, x: 0, y: 0 });
            }}
            className="rounded px-2 py-1 text-[11px] hover:bg-accent"
          >
            重置
          </button>
        </div>
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-full bg-muted-foreground/40" /> 未学
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-full bg-sky-400" /> 学习中
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-full bg-emerald-400" /> 已掌握
        </span>
        <span>· 点击节点看题目 · 点右上角圆点标记状态 · 滚轮缩放 · 拖动平移</span>
        {mode === "lanqiao" && (
          <span className="text-muted-foreground/80">
            （蓝桥杯 A 组考纲已收起 {ALGORITHMS.length - nodesForMode(mode).length} 个进阶节点）
          </span>
        )}
      </div>
    </div>
  );
}
