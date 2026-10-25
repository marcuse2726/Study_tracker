"use client";

import { useTheme } from "@/lib/store/theme";
import { Moon, Sun } from "lucide-react";

/** 主题切换：亮 <-> 暗 二态切换（点一次换一种，不会卡住） */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const Icon = resolvedTheme === "light" ? Sun : Moon;

  return (
    <button
      onClick={toggle}
      aria-label={resolvedTheme === "dark" ? "切换到亮色" : "切换到暗色"}
      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <Icon className="size-4" />
    </button>
  );
}
