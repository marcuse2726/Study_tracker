"use client";

// ============================================================================
// progress.tsx —— 学习进度（拓扑图模式 + 掌握状态 + 做过的题）
// ============================================================================
// 三份数据都存 localStorage，跨刷新保留：
//   mode     → 当前拓扑图模式（蓝桥杯 A 组 / ICPC）
//   mastery  → 每个知识点的掌握状态：0 未学 / 1 学习中 / 2 已掌握
//   done     → 做过题的记录，用来避免随机抽题时重复推同一道
// ============================================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Mode } from "@/lib/algorithm/curriculum";

/** 0 = 没开始，1 = 学过了，2 = 已掌握 */
export type Mastery = 0 | 1 | 2;

interface ProgressState {
  mode: Mode;
  mastery: Record<string, Mastery>;
  /** key 形如 "luogu:P1886" / "cf:2267D"，值为记录时间戳 */
  done: Record<string, number>;
}

const DEFAULT_STATE: ProgressState = { mode: "lanqiao", mastery: {}, done: {} };
const STORAGE_KEY = "studytracker.progress.v1";

/** 已做过的题多久内不再随机推给你（30 天） */
const DONE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

interface ProgressContextValue extends ProgressState {
  setMode: (mode: Mode) => void;
  /** 点击节点：0 → 1 → 2 → 0 循环 */
  cycleMastery: (nodeId: string) => void;
  toggleDone: (problemKey: string) => void;
  /** 这道题最近是否做过（冷却期内） */
  isRecentlyDone: (problemKey: string) => boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function loadState(): ProgressState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      mode: parsed.mode === "icpc" ? "icpc" : "lanqiao",
      mastery: parsed.mastery ?? {},
      done: parsed.done ?? {},
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* 存储写满时忽略 */
    }
  }, [state, hydrated]);

  const setMode = useCallback((mode: Mode) => {
    setState((prev) => ({ ...prev, mode }));
  }, []);

  const cycleMastery = useCallback((nodeId: string) => {
    setState((prev) => {
      const current = prev.mastery[nodeId] ?? 0;
      const next = ((current + 1) % 3) as Mastery;
      const mastery = { ...prev.mastery };
      if (next === 0) delete mastery[nodeId];
      else mastery[nodeId] = next;
      return { ...prev, mastery };
    });
  }, []);

  const toggleDone = useCallback((problemKey: string) => {
    setState((prev) => {
      const done = { ...prev.done };
      if (done[problemKey]) delete done[problemKey];
      else done[problemKey] = Date.now();
      return { ...prev, done };
    });
  }, []);

  const isRecentlyDone = useCallback(
    (problemKey: string) => {
      const at = state.done[problemKey];
      if (!at) return false;
      return Date.now() - at < DONE_COOLDOWN_MS;
    },
    [state.done],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      ...state,
      setMode,
      cycleMastery,
      toggleDone,
      isRecentlyDone,
    }),
    [state, setMode, cycleMastery, toggleDone, isRecentlyDone],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress 必须在 ProgressProvider 内使用");
  return ctx;
}
