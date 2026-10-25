"use client";

import { useEffect, useRef } from "react";
import { init, use, type ECharts } from "echarts/core";
import {
  BarChart,
  LineChart,
  PieChart,
  HeatmapChart,
} from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  CalendarComponent,
  DatasetComponent,
} from "echarts/components";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";

// 按需注册，避免打入未使用的图表，控制体积
use([
  BarChart,
  LineChart,
  PieChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  CalendarComponent,
  DatasetComponent,
  LabelLayout,
  CanvasRenderer,
]);

interface EChartProps {
  option: EChartsOption;
  height?: number | string;
  className?: string;
}

/**
 * 轻量 ECharts 封装：
 * - 客户端初始化（useEffect）
 * - 容器尺寸变化自动 resize
 * - option 变化 / 主题切换时整体重绘
 */
export function EChart({ option, height = 300, className }: EChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const chart = init(el);
    chartRef.current = chart;

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return <div ref={ref} className={className} style={{ height, width: "100%" }} />;
}
