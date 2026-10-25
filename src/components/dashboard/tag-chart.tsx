"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import type { TagCount } from "@/lib/types";
import { useChartTheme } from "@/lib/chart-theme";
import { EChart } from "@/components/charts/echart";

/** 标签分布（Top 横向条形图） */
export function TagChart({
  data,
  height = 300,
}: {
  data: TagCount[];
  height?: number;
}) {
  const t = useChartTheme();

  const option = useMemo<EChartsOption>(() => {
    // 反转使最大值显示在最上方
    const top = data.slice(0, 12).reverse();
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: t.tooltipBg,
        borderColor: t.tooltipBorder,
        textStyle: { color: t.text },
        formatter: "{b}：{c} 题",
      },
      grid: { left: 8, right: 32, top: 8, bottom: 8, containLabel: true },
      xAxis: {
        type: "value",
        axisLabel: { color: t.muted },
        splitLine: { lineStyle: { color: t.splitLine } },
      },
      yAxis: {
        type: "category",
        data: top.map((x) => x.name),
        axisLabel: { color: t.text },
        axisLine: { lineStyle: { color: t.axisLine } },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: top.map((x) => x.count),
          barWidth: "60%",
          itemStyle: {
            color: "#8B5CF6",
            borderRadius: [0, 6, 6, 0],
          },
          label: { show: true, position: "right", color: t.muted, fontSize: 11 },
        },
      ],
    };
  }, [data, t]);

  return <EChart option={option} height={height} />;
}
