"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import type { DifficultyDist } from "@/lib/types";
import { DIFFICULTY_META } from "@/lib/constants";
import { useChartTheme } from "@/lib/chart-theme";
import { EChart } from "@/components/charts/echart";

/** 难度分布环形图 */
export function DifficultyChart({
  data,
  height = 260,
}: {
  data: DifficultyDist;
  height?: number;
}) {
  const t = useChartTheme();

  const option = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: "item",
        backgroundColor: t.tooltipBg,
        borderColor: t.tooltipBorder,
        textStyle: { color: t.text },
        formatter: "{b}：{c} 题（{d}%）",
      },
      legend: {
        bottom: 0,
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: t.muted },
      },
      series: [
        {
          type: "pie",
          radius: ["52%", "74%"],
          center: ["50%", "44%"],
          itemStyle: { borderRadius: 8, borderColor: "transparent", borderWidth: 2 },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontWeight: "bold",
              color: t.text,
              formatter: "{b}\n{c} 题",
            },
          },
          data: (["easy", "medium", "hard"] as const).map((key) => ({
            name: DIFFICULTY_META[key].label,
            value: data[key],
            itemStyle: { color: DIFFICULTY_META[key].color },
          })),
        },
      ],
    }),
    [data, t],
  );

  return <EChart option={option} height={height} />;
}
