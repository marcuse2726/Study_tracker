"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import type { RatingSeries } from "@/lib/types";
import { PLATFORM_MAP } from "@/lib/constants";
import { useChartTheme } from "@/lib/chart-theme";
import { EChart } from "@/components/charts/echart";

/** Rating 曲线（多平台叠加折线） */
export function RatingChart({
  series,
  height = 300,
}: {
  series: RatingSeries[];
  height?: number;
}) {
  const t = useChartTheme();

  const option = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: "axis",
        backgroundColor: t.tooltipBg,
        borderColor: t.tooltipBorder,
        textStyle: { color: t.text },
      },
      legend: {
        top: 0,
        icon: "roundRect",
        itemWidth: 12,
        itemHeight: 6,
        textStyle: { color: t.muted },
      },
      grid: { left: 8, right: 16, top: 32, bottom: 8, containLabel: true },
      xAxis: {
        type: "time",
        axisLabel: { color: t.muted },
        axisLine: { lineStyle: { color: t.axisLine } },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: t.muted },
        splitLine: { lineStyle: { color: t.splitLine } },
      },
      series: series.map((s) => ({
        name: s.name,
        type: "line",
        data: s.points.map((p) => [p.date, p.value] as [string, number]),
        showSymbol: false,
        smooth: true,
        lineStyle: { width: 2, color: PLATFORM_MAP[s.platform].color },
        itemStyle: { color: PLATFORM_MAP[s.platform].color },
      })),
    }),
    [series, t],
  );

  return <EChart option={option} height={height} />;
}
