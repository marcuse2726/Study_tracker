"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "@/lib/store/settings";
import { ALGO_RECENT_WINDOW, MAX_ALGO_BUBBLES } from "@/lib/constants";
import { pickAlgorithm } from "./algorithms";
import { AlgoBubble, type AlgoBubbleData } from "./algo-bubble";

/** 交互控件选择器：命中这些（或其祖先）时不弹出算法卡片 */
const INTERACTIVE_SELECTOR = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "option",
  "video",
  "audio",
  "iframe",
  "[contenteditable]",
  "[data-interactive]",
  "[role='button']",
  "[role='link']",
  "[role='tab']",
  "[role='menuitem']",
  "[role='checkbox']",
  "[role='radio']",
  "[role='switch']",
  "[role='slider']",
  "[role='combobox']",
  "[role='option']",
  "[role='listbox']",
  "[role='dialog']",
  "[role='searchbox']",
  "[role='textbox']",
].join(",");

/** 判断点击目标（或其祖先）是否为有实际作用的交互控件 */
function isInteractive(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false;
  return !!target.closest(INTERACTIVE_SELECTOR);
}

/**
 * 点击随机算法装饰（全局）：
 * - 监听 window 的 pointerdown（鼠标 + 触屏 + 手写笔，冒泡捕获阶段）
 * - 纯旁路监听：不 preventDefault、不 stopPropagation，绝不干扰按钮/链接/表单
 * - 装饰层 pointer-events:none，完全穿透
 * - 最多同时 5 个气泡，避免刷屏
 * - 通过「最近展示窗口」避免连续重复同一算法
 * - 开关默认开启，可在设置页 / 导航栏关闭
 */
export function AlgoClickDecorator() {
  const { algoEnabled } = useSettings();
  const [bubbles, setBubbles] = useState<AlgoBubbleData[]>([]);
  const [mounted, setMounted] = useState(false);
  const idRef = useRef(0);
  const recentRef = useRef<string[]>([]);
  const enabledRef = useRef(algoEnabled);
  enabledRef.current = algoEnabled;

  const spawn = useCallback((x: number, y: number) => {
    const algo = pickAlgorithm(recentRef.current);
    recentRef.current = [...recentRef.current, algo.name].slice(
      -ALGO_RECENT_WINDOW,
    );

    const duration = 1500 + Math.random() * 1000; // 1.5s ~ 2.5s
    const id = ++idRef.current;

    setBubbles((prev) => {
      const next = [...prev, { id, x, y, algo, duration }];
      return next.length > MAX_ALGO_BUBBLES
        ? next.slice(next.length - MAX_ALGO_BUBBLES)
        : next;
    });
  }, []);

  // 仅在客户端挂载后渲染 portal，避免 SSR 与客户端 DOM 不一致导致 hydration 报错
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 按下时只记录起点，不立刻弹卡片。
    // 如果改成"按下就弹"，那么拖动拓扑图、拖选文字时也会一路弹，非常干扰。
    // 现在改成"松开时判断"：只有位移很小（真的是一次点击）才弹。
    let down: { x: number; y: number; t: number; blocked: boolean } | null = null;

    const onDown = (e: PointerEvent) => {
      down = {
        x: e.clientX,
        y: e.clientY,
        t: Date.now(),
        // 起点在按钮/链接/输入框上 → 整次交互都不弹
        blocked: isInteractive(e.target),
      };
    };

    const onUp = (e: PointerEvent) => {
      const d = down;
      down = null;
      if (!enabledRef.current) return;
      if (!d || d.blocked) return;
      // 松开点落在交互控件上也不弹
      if (isInteractive(e.target)) return;
      // 位移超过 6px → 判定为拖动（划动拓扑图、拖选文字），不弹
      const dist = Math.hypot(e.clientX - d.x, e.clientY - d.y);
      if (dist > 6) return;
      // 长按超过 0.7 秒也不弹（避免和长按菜单冲突）
      if (Date.now() - d.t > 700) return;
      spawn(e.clientX, e.clientY);
    };

    // pointercancel 时清掉记录（手指被系统手势打断等）
    const onCancel = () => {
      down = null;
    };

    window.addEventListener("pointerdown", onDown, { capture: true, passive: true });
    window.addEventListener("pointerup", onUp, { capture: true, passive: true });
    window.addEventListener("pointercancel", onCancel, { capture: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", onDown, { capture: true });
      window.removeEventListener("pointerup", onUp, { capture: true });
      window.removeEventListener("pointercancel", onCancel, { capture: true });
    };
  }, [spawn]);

  const remove = useCallback((id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
      {bubbles.map((b) => (
        <AlgoBubble key={b.id} bubble={b} onDone={() => remove(b.id)} />
      ))}
    </div>,
    document.body,
  );
}
