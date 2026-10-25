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
    const handler = (e: PointerEvent) => {
      if (!enabledRef.current) return;
      // 点击按钮 / 链接 / 输入框等交互控件时不弹出，只有点空白处才弹出
      if (isInteractive(e.target)) return;
      spawn(e.clientX, e.clientY);
    };
    window.addEventListener("pointerdown", handler, {
      capture: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("pointerdown", handler, { capture: true });
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
