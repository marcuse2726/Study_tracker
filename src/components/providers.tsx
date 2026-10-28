"use client";

import { ThemeProvider } from "@/lib/store/theme";
import { SettingsProvider } from "@/lib/store/settings";
import { StudyProvider } from "@/lib/store/study";
import { EnglishProvider } from "@/lib/store/english";
import { ScheduleProvider } from "@/lib/store/schedule";
import { ProgressProvider } from "@/lib/store/progress";

/**
 * 全局 Provider 组合：
 * - ThemeProvider：轻量主题系统（默认深色，支持亮/暗/跟随系统）
 * - SettingsProvider：Codeforces 用户名、算法装饰 / 星空开关
 * - StudyProvider：每日计划、任务、扭蛋机
 * - ProgressProvider：算法学习路径的模式 / 掌握状态 / 做过的题
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <StudyProvider>
          <EnglishProvider>
            <ScheduleProvider>
              <ProgressProvider>{children}</ProgressProvider>
            </ScheduleProvider>
          </EnglishProvider>
        </StudyProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
