"use client";

import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import { useStudy, type Task } from "@/lib/store/study";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TaskDialog } from "./task-dialog";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function fmtKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function todayKey(): string {
  const n = new Date();
  return fmtKey(n.getFullYear(), n.getMonth(), n.getDate());
}

/** 每日计划：左侧日历 + 右侧「大加号」和任务词条 */
export function DailyPlan() {
  const { tasks, deleteTask } = useStudy();
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const year = month.getFullYear();
  const mon = month.getMonth();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const startWeekday = (new Date(year, mon, 1).getDay() + 6) % 7;
  const today = todayKey();

  const cells: Array<number | null> = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const taskForDay = (key: string) =>
    tasks.find((t) => t.start <= key && t.end >= key);

  const sortedTasks = [...tasks].sort((a, b) => (a.start < b.start ? -1 : 1));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-5 text-primary" />
          每日计划
        </CardTitle>
        <CardDescription>点击右侧「+」新建一段时期的做题计划</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1fr_240px]">
        {/* 日历 */}
        <div>
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

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1 text-xs text-muted-foreground">
                {w}
              </div>
            ))}
            {cells.map((d, i) => {
              if (d === null) return <div key={`e${i}`} />;
              const key = fmtKey(year, mon, d);
              const task = taskForDay(key);
              const isToday = key === today;
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (task) {
                      setEditing(task);
                      setDialogOpen(true);
                    }
                  }}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-lg border text-xs transition-colors",
                    task ? "text-foreground" : "border-border text-muted-foreground hover:bg-muted",
                    isToday && "ring-1 ring-primary",
                  )}
                  style={
                    task
                      ? { backgroundColor: `${task.color}3d`, borderColor: task.color }
                      : undefined
                  }
                >
                  <span>{d}</span>
                  {task ? (
                    <span className="text-[10px] font-bold">{task.count}题</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            点击带颜色的日期或右侧词条可重新编辑
          </p>
        </div>

        {/* 右侧：大加号 + 任务词条 */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="flex h-24 w-full flex-col items-center justify-center gap-1 border-2 border-dashed text-4xl font-light text-muted-foreground hover:border-primary hover:text-primary"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-8" />
            <span className="text-xs font-normal">新建计划</span>
          </Button>

          <div className="space-y-2">
            {sortedTasks.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                还没有计划任务
              </p>
            ) : (
              sortedTasks.map((t) => (
                <TaskEntry
                  key={t.id}
                  task={t}
                  onEdit={() => {
                    setEditing(t);
                    setDialogOpen(true);
                  }}
                  onDelete={() => deleteTask(t.id)}
                />
              ))
            )}
          </div>
        </div>
      </CardContent>

      {dialogOpen ? (
        <TaskDialog
          task={editing}
          onClose={() => {
            setDialogOpen(false);
            setEditing(null);
          }}
        />
      ) : null}
    </Card>
  );
}

function TaskEntry({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const shown = task.algos.slice(0, 3);
  const extra = task.algos.length - 3;

  return (
    <div
      data-interactive
      className="group relative cursor-pointer rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/40"
      style={{ borderLeft: `3px solid ${task.color}` }}
      onClick={onEdit}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-1.5 top-1.5 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
      >
        <X className="size-3" />
      </button>

      <div className="text-xs text-muted-foreground">
        {task.start} ~ {task.end}
      </div>
      <div className="mt-1 text-sm font-medium">每天 {task.count} 题</div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {shown.map((a) => (
          <span key={a} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
            {a}
          </span>
        ))}
        {extra > 0 ? (
          <span className="text-[10px] text-muted-foreground">
            +{extra} 更多…
          </span>
        ) : null}
        {task.algos.length === 0 ? (
          <span className="text-[10px] text-muted-foreground">未选算法</span>
        ) : null}
      </div>
    </div>
  );
}
