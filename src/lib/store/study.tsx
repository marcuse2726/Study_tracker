"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  ALGORITHMS,
  type Algorithm,
} from "@/components/algo-decoration/algorithms";

/** 一段时期的计划任务：起止日期 + 每日题数 + 算法 + 专属颜色 */
export interface Task {
  id: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  count: number; // 每天题数
  algos: string[]; // 算法名
  color: string; // 专属颜色
}

export interface GachaState {
  date: string;
  draws: string[];
}

interface StudyState {
  tasks: Task[];
  gacha: GachaState;
}

const TASK_COLORS = [
  "#8B5CF6",
  "#0EA5E9",
  "#F59E0B",
  "#EC4899",
  "#10B981",
  "#F97316",
  "#6366F1",
];

const DEFAULT_STATE: StudyState = { tasks: [], gacha: { date: "", draws: [] } };
const STORAGE_KEY = "studytracker.study.v2";

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayStr(): string {
  return fmt(new Date());
}

interface StudyContextValue extends StudyState {
  todayTask: Task | undefined;
  todayLimit: number;
  todayDraws: string[];
  todayRemaining: number;
  addTask: (task: {
    start: string;
    end: string;
    count: number;
    algos: string[];
  }) => void;
  updateTask: (
    id: string,
    patch: Partial<Pick<Task, "start" | "end" | "count" | "algos">>,
  ) => void;
  deleteTask: (id: string) => void;
  drawGacha: () => Algorithm | null;
  resetGacha: () => void;
}

const StudyContext = createContext<StudyContextValue | null>(null);

function loadState(): StudyState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<StudyState>;
    return {
      tasks: parsed.tasks ?? [],
      gacha: parsed.gacha ?? { date: "", draws: [] },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(DEFAULT_STATE);
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
      /* 忽略 */
    }
  }, [state, hydrated]);

  const addTask = useCallback(
    (task: { start: string; end: string; count: number; algos: string[] }) => {
      setState((prev) => {
        const color = TASK_COLORS[prev.tasks.length % TASK_COLORS.length];
        return {
          ...prev,
          tasks: [...prev.tasks, { ...task, id: `t-${Date.now()}`, color }],
        };
      });
    },
    [],
  );

  const updateTask = useCallback(
    (
      id: string,
      patch: Partial<Pick<Task, "start" | "end" | "count" | "algos">>,
    ) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      }));
    },
    [],
  );

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }, []);

  const drawGacha = useCallback((): Algorithm | null => {
    const today = todayStr();
    const gacha =
      state.gacha.date === today ? state.gacha : { date: today, draws: [] };
    const task = state.tasks.find((t) => t.start <= today && t.end >= today);
    const max = task?.count ?? 0;
    if (gacha.draws.length >= max) return null;

    // 优先从「今天覆盖的任务」的算法里抽，没有则从全部算法抽
    const pool =
      task?.algos?.length
        ? ALGORITHMS.filter((a) => task.algos!.includes(a.name))
        : ALGORITHMS;
    const candidates = pool.filter((a) => !gacha.draws.includes(a.name));
    const src = candidates.length ? candidates : pool;
    const algo = src[Math.floor(Math.random() * src.length)];

    setState({
      ...state,
      gacha: { date: today, draws: [...gacha.draws, algo.name] },
    });
    return algo;
  }, [state]);

  const resetGacha = useCallback(() => {
    const today = todayStr();
    setState((prev) => ({ ...prev, gacha: { date: today, draws: [] } }));
  }, []);

  const today = todayStr();
  const todayTask = state.tasks.find((t) => t.start <= today && t.end >= today);
  const todayLimit = todayTask?.count ?? 0;
  const todayDraws = state.gacha.date === today ? state.gacha.draws : [];

  const value = useMemo<StudyContextValue>(
    () => ({
      ...state,
      todayTask,
      todayLimit,
      todayDraws,
      todayRemaining: Math.max(0, todayLimit - todayDraws.length),
      addTask,
      updateTask,
      deleteTask,
      drawGacha,
      resetGacha,
    }),
    [
      state,
      todayTask,
      todayLimit,
      todayDraws,
      addTask,
      updateTask,
      deleteTask,
      drawGacha,
      resetGacha,
    ],
  );

  return (
    <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
  );
}

export function useStudy(): StudyContextValue {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy 必须在 StudyProvider 内使用");
  return ctx;
}
