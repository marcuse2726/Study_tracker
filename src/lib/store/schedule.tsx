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

export type CategoryId = "exam" | "activity" | "course" | "ddl";

/** 日历四个板块及其颜色 */
export const SCHEDULE_CATEGORIES: Array<{
  id: CategoryId;
  label: string;
  color: string;
}> = [
  { id: "exam", label: "考试", color: "#EF4444" },
  { id: "activity", label: "活动", color: "#F59E0B" },
  { id: "course", label: "博雅课程", color: "#8B5CF6" },
  { id: "ddl", label: "作业ddl", color: "#3B82F6" },
];

export interface ScheduleItem {
  id: string;
  category: CategoryId;
  title: string;
}

interface ScheduleState {
  /** YYYY-MM-DD -> 当天任务 */
  items: Record<string, ScheduleItem[]>;
}

const DEFAULT_STATE: ScheduleState = { items: {} };
const STORAGE_KEY = "studytracker.schedule.v2";

interface ScheduleContextValue extends ScheduleState {
  addItem: (date: string, category: CategoryId, title: string) => void;
  removeItem: (date: string, id: string) => void;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

function loadState(): ScheduleState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<ScheduleState>;
    return { items: parsed.items ?? {} };
  } catch {
    return DEFAULT_STATE;
  }
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScheduleState>(DEFAULT_STATE);
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
  }, [hydrated, state]);

  const addItem = useCallback(
    (date: string, category: CategoryId, title: string) => {
      const label =
        SCHEDULE_CATEGORIES.find((c) => c.id === category)?.label ?? category;
      const t = title.trim() || label;
      setState((prev) => ({
        ...prev,
        items: {
          ...prev.items,
          [date]: [
            ...(prev.items[date] ?? []),
            {
              id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              category,
              title: t,
            },
          ],
        },
      }));
    },
    [],
  );

  const removeItem = useCallback((date: string, id: string) => {
    setState((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [date]: (prev.items[date] ?? []).filter((i) => i.id !== id),
      },
    }));
  }, []);

  const value = useMemo<ScheduleContextValue>(
    () => ({ ...state, addItem, removeItem }),
    [state, addItem, removeItem],
  );

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule(): ScheduleContextValue {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule 必须在 ScheduleProvider 内使用");
  return ctx;
}
