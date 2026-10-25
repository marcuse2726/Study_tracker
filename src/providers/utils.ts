/** providers/utils.ts — 数据层共享的日期 / 连续打卡工具 */

export const DAY_MS = 24 * 60 * 60 * 1000;

/** 本地日期 -> YYYY-MM-DD */
export function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 从「有提交的日期集合」计算连续打卡天数（今天或昨天为终点） */
export function computeStreak(activeDays: Set<string>): number {
  const now = new Date();
  let cursor = new Date(now);
  // 今天可能还没提交，允许从昨天开始算连续
  if (!activeDays.has(fmtDate(cursor))) {
    cursor = new Date(now.getTime() - DAY_MS);
  }
  let streak = 0;
  while (activeDays.has(fmtDate(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}
