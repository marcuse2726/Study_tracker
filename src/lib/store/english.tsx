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

export interface Word {
  id: string;
  text: string;
  mastered: boolean;
}

interface EnglishState {
  words: Word[];
  /** 每日复习数量 n */
  dailyCount: number;
}

const DEFAULT_STATE: EnglishState = { words: [], dailyCount: 5 };
const STORAGE_KEY = "studytracker.english.v1";

interface EnglishContextValue extends EnglishState {
  addWord: (text: string) => void;
  removeWord: (id: string) => void;
  toggleMastered: (id: string) => void;
  setDailyCount: (n: number) => void;
}

const EnglishContext = createContext<EnglishContextValue | null>(null);

function loadState(): EnglishState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<EnglishState>;
    return {
      words: parsed.words ?? [],
      dailyCount: parsed.dailyCount ?? 5,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function EnglishProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EnglishState>(DEFAULT_STATE);
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

  const addWord = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    setState((prev) => {
      if (prev.words.some((w) => w.text.toLowerCase() === t.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        words: [
          ...prev.words,
          {
            id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            text: t,
            mastered: false,
          },
        ],
      };
    });
  }, []);

  const removeWord = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      words: prev.words.filter((w) => w.id !== id),
    }));
  }, []);

  const toggleMastered = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      words: prev.words.map((w) =>
        w.id === id ? { ...w, mastered: !w.mastered } : w,
      ),
    }));
  }, []);

  const setDailyCount = useCallback((n: number) => {
    setState((prev) => ({ ...prev, dailyCount: Math.max(0, Math.floor(n)) }));
  }, []);

  const value = useMemo<EnglishContextValue>(
    () => ({
      ...state,
      addWord,
      removeWord,
      toggleMastered,
      setDailyCount,
    }),
    [state, addWord, removeWord, toggleMastered, setDailyCount],
  );

  return (
    <EnglishContext.Provider value={value}>{children}</EnglishContext.Provider>
  );
}

export function useEnglish(): EnglishContextValue {
  const ctx = useContext(EnglishContext);
  if (!ctx) throw new Error("useEnglish 必须在 EnglishProvider 内使用");
  return ctx;
}
