"use client";

import type { ReactNode } from "react";
import { Flame, Hash, Trophy } from "lucide-react";
import { useCodeforces } from "@/lib/hooks";
import { useSettings } from "@/lib/store/settings";
import {
  ChartSkeleton,
  ErrorState,
  SectionCard,
} from "@/components/shared/status";
import { DifficultyChart } from "@/components/dashboard/difficulty-chart";
import { TagChart } from "@/components/dashboard/tag-chart";
import { Heatmap } from "@/components/dashboard/heatmap";
import { RatingChart } from "@/components/dashboard/rating-chart";
import { RecentSubmissions } from "@/components/dashboard/recent-submissions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** Codeforces 数据区：填写用户名后抓取公开数据 */
export function CodeforcesSection() {
  const { codeforcesUsername, setCodeforcesUsername } = useSettings();
  const { data, error, isLoading, mutate } = useCodeforces();

  return (
    <SectionCard
      title="Codeforces 数据"
      description="抓取你的 Codeforces 公开数据（填写用户名）"
      action={
        <div className="flex gap-2">
          <Input
            className="h-8 w-44"
            placeholder="用户名"
            value={codeforcesUsername}
            onChange={(e) => setCodeforcesUsername(e.target.value)}
            autoComplete="off"
          />
          <Button size="sm" variant="outline" onClick={() => mutate()}>
            刷新
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <ChartSkeleton height={320} />
      ) : error ? (
        <ErrorState onRetry={() => mutate()} />
      ) : data ? (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <MiniStat
              icon={<Hash className="size-4" />}
              label="已解决"
              value={data.totalSolved}
            />
            <MiniStat
              icon={<Trophy className="size-4" />}
              label="Rating"
              value={data.rating ?? "—"}
            />
            <MiniStat
              icon={<Flame className="size-4" />}
              label="连续打卡"
              value={data.streakDays}
              unit="天"
            />
          </div>

          {data.isMock ? (
            <p className="text-xs text-amber-500">
              当前为示例数据（未填写用户名或抓取失败）
            </p>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <div className="mb-1 text-sm text-muted-foreground">难度分布</div>
              <DifficultyChart data={data.difficulty} height={240} />
            </div>
            <div>
              <div className="mb-1 text-sm text-muted-foreground">标签分布</div>
              {data.tags.length > 0 ? (
                <TagChart data={data.tags} height={240} />
              ) : (
                <p className="text-sm text-muted-foreground">暂无标签数据</p>
              )}
            </div>
          </div>

          {data.heatmap.length > 0 ? (
            <div>
              <div className="mb-1 text-sm text-muted-foreground">提交热力图</div>
              <Heatmap data={data.heatmap} height={170} />
            </div>
          ) : null}

          {data.ratingHistory.length > 0 ? (
            <div>
              <div className="mb-1 text-sm text-muted-foreground">Rating 曲线</div>
              <RatingChart
                series={[
                  {
                    platform: data.id,
                    name: data.name,
                    points: data.ratingHistory,
                  },
                ]}
                height={260}
              />
            </div>
          ) : null}

          <div>
            <div className="mb-1 text-sm text-muted-foreground">最近提交</div>
            <RecentSubmissions submissions={data.recent} />
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}

function MiniStat({
  icon,
  label,
  value,
  unit,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  unit?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold tabular-nums">
        {value}
        {unit ? (
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}
