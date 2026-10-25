"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  useSchedule,
  SCHEDULE_CATEGORIES,
  type CategoryId,
  type ScheduleItem,
} from "@/lib/store/schedule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function fmtKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function todayKey(): string {
  const n = new Date();
  return fmtKey(n.getFullYear(), n.getMonth(), n.getDate());
}

type Stage = "idle" | "title" | "date";

/**
 * 日程规划：上方日历 + 下方四个板块（自上而下、与日历同宽）。
 * 点板块「+」→ 填事项 → 点日历选日期 → 日期上出现彩色小圆圈，板块里出现任务词条。
 */
export function ScheduleCalendar() {
  const { items, addItem, removeItem } = useSchedule();
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [selected, setSelected] = useState(todayKey());
  const [pendingCat, setPendingCat] = useState<CategoryId | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [title, setTitle] = useState("");

  const year = month.getFullYear();
  const mon = month.getMonth();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const startWeekday = (new Date(year, mon, 1).getDay() + 6) % 7;
  const today = todayKey();

  const cells: Array<number | null> = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // 每个板块的全部任务（按日期排序）
  const tasksByCategory = useMemo(() => {
    const map = {} as Record<
      CategoryId,
      Array<{ date: string; item: ScheduleItem }>
    >;
    for (const c of SCHEDULE_CATEGORIES) map[c.id] = [];
    for (const [date, dayItems] of Object.entries(items)) {
      for (const it of dayItems) {
        (map[it.category] ??= []).push({ date, item: it });
      }
    }
    for (const c of SCHEDULE_CATEGORIES) {
      map[c.id].sort((a, b) => (a.date < b.date ? -1 : 1));
    }
    return map;
  }, [items]);

  const pendingLabel =
    SCHEDULE_CATEGORIES.find((c) => c.id === pendingCat)?.label ?? "";

  const startAdd = (cat: CategoryId) => {
    setPendingCat(cat);
    setTitle("");
    setStage("title");
  };

  const cancelAdd = () => {
    setPendingCat(null);
    setTitle("");
    setStage("idle");
  };

  const nextStage = () => {
    if (stage === "title") setStage("date");
  };

  const onDayClick = (key: string) => {
    if (stage === "date" && pendingCat) {
      addItem(key, pendingCat, title);
      cancelAdd();
    } else {
      setSelected(key);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-5 text-primary" />
          日程规划
        </CardTitle>
        <CardDescription>
          点击下方板块的「+」新建事项，再点日历选择日期
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stage === "date" ? (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm">
            <span>请点击日历，为「{pendingLabel}」选择日期</span>
            <Button variant="ghost" size="sm" onClick={cancelAdd}>
              <X className="size-4" />
              取消
            </Button>
          </div>
        ) : null}

        {/* 月份导航 */}
        <div className="mb-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMonth(new Date(year, mon - 1, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="font-medium">
            {year} 年 {mon + 1} 月
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMonth(new Date(year, mon + 1, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* 日历网格 */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1 text-xs text-muted-foreground">
              {w}
            </div>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} />;
            const key = fmtKey(year, mon, d);
            const dayItems = items[key] ?? [];
            const isToday = key === today;
            const isSelected = key === selected;
            return (
              <button
                key={key}
                onClick={() => onDayClick(key)}
                className={cn(
                  "flex min-h-20 flex-col items-center gap-1 rounded-lg border p-1.5 text-xs transition-colors",
                  isToday
                    ? "border-primary/60 bg-primary/5"
                    : "border-border hover:bg-muted",
                  isSelected && !isToday ? "border-primary/40" : "",
                  stage === "date" ? "cursor-crosshair" : "",
                )}
              >
                <span className={cn(isToday && "font-semibold text-primary")}>
                  {d}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-0.5">
                  {dayItems.map((it) => {
                    const c = SCHEDULE_CATEGORIES.find(
                      (x) => x.id === it.category,
                    );
                    return (
                      <span
                        key={it.id}
                        onClick={(e) => {
                          if (stage !== "idle") return;
                          e.stopPropagation();
                          removeItem(key, it.id);
                        }}
                        title={
                          stage === "idle"
                            ? `点击删除：${it.title}`
                            : it.title
                        }
                        className="size-2 rounded-full"
                        style={{ backgroundColor: c?.color ?? "#888" }}
                      />
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>

        {/* 四个板块：自上而下，与日历同宽；初始高度约日历一半 */}
        <div className="mt-6 space-y-4">
          {SCHEDULE_CATEGORIES.map((c) => {
            const tasks = tasksByCategory[c.id];
            return (
              <div
                key={c.id}
                className="flex min-h-56 flex-col rounded-xl border p-4"
                style={{ borderColor: `${c.color}66` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="font-medium">{c.label}</span>
                  <span className="text-xs text-muted-foreground">
                    （{tasks.length}）
                  </span>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="ml-auto"
                    onClick={() => startAdd(c.id)}
                    aria-label={`新建${c.label}`}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>

                {tasks.length === 0 ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    还没有任务，点击右上角 + 新建
                  </p>
                ) : (
                  <ul className="mt-3 space-y-1">
                    {tasks.map(({ date, item }) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-2 rounded-lg bg-muted/30 px-2 py-1.5"
                      >
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="flex-1 truncate text-sm">
                          {item.title}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {date.slice(5)}
                        </span>
                        <button
                          onClick={() => removeItem(date, item.id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label="删除"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* 新建：填入事项 */}
        {stage === "title" ? (
          <div
            data-interactive
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={cancelAdd}
          >
            <div
              className="w-full max-w-sm rounded-2xl border bg-card p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">新建「{pendingLabel}」事项</h3>
                <button
                  onClick={cancelAdd}
                  className="rounded p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                填入具体事项
              </p>
              <Input
                className="mt-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：高等数学考试"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") nextStage();
                }}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={cancelAdd}>
                  取消
                </Button>
                <Button onClick={nextStage}>下一步：选择日期</Button>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
