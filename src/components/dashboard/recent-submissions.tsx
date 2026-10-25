"use client";

import type { Submission } from "@/lib/types";
import { DIFFICULTY_META, PLATFORM_MAP, VERDICT_META } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return iso.slice(0, 10);
}

/** 最近提交列表 */
export function RecentSubmissions({
  submissions,
}: {
  submissions: Submission[];
}) {
  if (submissions.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">暂无提交记录</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {submissions.map((s) => {
        const platform = PLATFORM_MAP[s.platform];
        return (
          <li key={s.id} className="flex items-center gap-3 py-2.5">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: platform.color }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{s.title}</span>
                <Badge
                  variant="secondary"
                  className="shrink-0 px-1.5 text-[10px]"
                >
                  {platform.shortName}
                </Badge>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatRelative(s.submittedAt)}</span>
                <span>·</span>
                <span style={{ color: DIFFICULTY_META[s.difficulty].color }}>
                  {DIFFICULTY_META[s.difficulty].label}
                </span>
              </div>
            </div>
            <span
              className="shrink-0 text-xs font-medium"
              style={{ color: VERDICT_META[s.verdict].color }}
            >
              {VERDICT_META[s.verdict].label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
