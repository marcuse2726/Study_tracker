"use client";

import { useTheme } from "@/lib/store/theme";

/**
 * 图表配色：ECharts 使用 Canvas 渲染，无法解析 CSS 变量，
 * 因此这里根据当前主题（亮/暗）返回一套适配的文字 / 轴线 / 提示框颜色。
 * 主题切换时 resolvedTheme 变化，依赖该 hook 的图表会重建 option。
 */
export interface ChartTheme {
  dark: boolean;
  text: string;
  muted: string;
  axisLine: string;
  splitLine: string;
  tooltipBg: string;
  tooltipBorder: string;
}

export function useChartTheme(): ChartTheme {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return {
    dark,
    text: dark ? "rgba(237,237,237,0.9)" : "rgba(24,24,27,0.85)",
    muted: dark ? "rgba(237,237,237,0.5)" : "rgba(24,24,27,0.5)",
    axisLine: dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
    splitLine: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    tooltipBg: dark ? "#18181b" : "#ffffff",
    tooltipBorder: dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.1)",
  };
}
