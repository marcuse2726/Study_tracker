"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import type { HeatmapCell } from "@/lib/types";
import { useChartTheme } from "@/lib/chart-theme";
import { EChart } from "@/components/charts/echart";

const DAY_MS = 24 * 60 * 60 * 1000;

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 提交热力图（GitHub 贡献图同款日历） */
export function Heatmap({
  data,
  height = 170,
}: {
  data: HeatmapCell[];
  height?: number;
}) {
  const t = useChartTheme();

  const option = useMemo<EChartsOption>(() => {
    const values = data.map((d) => d.count);
    const max = values.length ? Math.max(...values) : 1;

    const range: [string, string] = (() => {
      if (!data.length) {
        const now = new Date();
        return [fmtDate(new Date(now.getTime() - 365 * DAY_MS)), fmtDate(now)];
      }
      const dates = data.map((d) => d.date).sort();
      return [dates[0], dates[dates.length - 1]];
    })();

    // GitHub 同款绿阶（亮 / 暗两套）
    const palette = t.dark
      ? ["#0e4429", "#006d32", "#26a641", "#39d353"]
      : ["#9be9a8", "#40c463", "#30a14e", "#216e39"];

    return {
      tooltip: {
        backgroundColor: t.tooltipBg,
        borderColor: t.tooltipBorder,
        textStyle: { color: t.text },
        formatter: (params: unknown) => {
          const v = (params as { value?: [string, number] })?.value;
          return `${v?.[0] ?? ""}：${v?.[1] ?? 0} 次提交`;
        },
      },
      visualMap: {
        min: 1,
        max,
        show: false,
        inRange: { color: palette },
      },
      calendar: {
        top: 28,
        left: 40,
        right: 16,
        bottom: 6,
        range,
        cellSize: ["auto", 13],
        yearLabel: { show: false },
        monthLabel: {
          nameMap: "ZH",
          color: t.muted,
          margin: 8,
        },
        dayLabel: {
          nameMap: ["日", "一", "二", "三", "四", "五", "六"],
          firstDay: 1,
          color: t.muted,
          margin: 8,
        },
        itemStyle: {
          color: t.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
          borderWidth: 2,
          borderColor: t.dark ? "#1c1c22" : "#ffffff",
        },
        splitLine: { show: false },
      },
      series: [
        {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: data.map((d) => [d.date, d.count] as [string, number]),
        },
      ],
    };
  }, [data, t]);

  return <EChart option={option} height={height} />;
}
