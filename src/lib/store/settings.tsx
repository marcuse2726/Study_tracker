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

/** 用户配置：Codeforces 用户名 + 各开关 */
export interface Settings {
  codeforcesUsername: string;
  algoEnabled: boolean;
  starfieldEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  codeforcesUsername: "",
  algoEnabled: true,
  starfieldEnabled: true,
};

const STORAGE_KEY = "studytracker.settings.v1";

interface SettingsContextValue extends Settings {
  setCodeforcesUsername: (username: string) => void;
  setAlgoEnabled: (enabled: boolean) => void;
  setStarfieldEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      codeforcesUsername: parsed.codeforcesUsername ?? "",
      algoEnabled: parsed.algoEnabled ?? true,
      starfieldEnabled: parsed.starfieldEnabled ?? true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* 忽略隐私模式 / 配额异常 */
    }
  }, [settings, hydrated]);

  const setCodeforcesUsername = useCallback((username: string) => {
    setSettings((prev) => ({ ...prev, codeforcesUsername: username.trim() }));
  }, []);

  const setAlgoEnabled = useCallback((algoEnabled: boolean) => {
    setSettings((prev) => ({ ...prev, algoEnabled }));
  }, []);

  const setStarfieldEnabled = useCallback((starfieldEnabled: boolean) => {
    setSettings((prev) => ({ ...prev, starfieldEnabled }));
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      setCodeforcesUsername,
      setAlgoEnabled,
      setStarfieldEnabled,
    }),
    [settings, setCodeforcesUsername, setAlgoEnabled, setStarfieldEnabled],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings 必须在 SettingsProvider 内使用");
  return ctx;
}
