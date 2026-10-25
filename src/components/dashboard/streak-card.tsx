"use client";

import { Flame } from "lucide-react";

/** 连续打卡卡片 */
export function StreakCard({ streakDays }: { streakDays: number }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-gradient-to-br from-orange-500/10 to-rose-500/10 p-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-500">
        <Flame className="size-6" />
      </div>
      <div>
        <div className="text-2xl font-bold">
          {streakDays}
          <span className="ml-1 text-sm font-normal text-muted-foreground">天</span>
        </div>
        <div className="text-xs text-muted-foreground">连续打卡</div>
      </div>
    </div>
  );
}
