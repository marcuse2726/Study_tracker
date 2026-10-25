"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShoppingCart,
  X,
} from "lucide-react";
import { useStudy, type Task } from "@/lib/store/study";
import { ALGORITHMS } from "@/components/algo-decoration/algorithms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["起始日期", "终止日期", "每日题数", "选择算法"];

/** 新建 / 编辑计划任务的分步弹窗 */
export function TaskDialog({
  task,
  onClose,
}: {
  task: Task | null;
  onClose: () => void;
}) {
  const { addTask, updateTask } = useStudy();
  // 编辑时直接跳到「选择算法」步骤
  const [step, setStep] = useState(task ? 3 : 0);
  const [start, setStart] = useState(task?.start ?? "");
  const [end, setEnd] = useState(task?.end ?? "");
  const [count, setCount] = useState(task ? String(task.count) : "3");
  const [algos, setAlgos] = useState<string[]>(task?.algos ?? []);
  const [removing, setRemoving] = useState<string[]>([]);

  const canNext =
    step === 0
      ? !!start
      : step === 1
        ? !!end && end >= start
        : step === 2
          ? (Number(count) || 0) > 0
          : true;

  const confirm = () => {
    if (!start || !end || (Number(count) || 0) <= 0) return;
    const payload = { start, end, count: Number(count) || 0, algos };
    if (task) updateTask(task.id, payload);
    else addTask(payload);
    onClose();
  };

  const toggleAlgo = (name: string) => {
    const selected = algos.includes(name) && !removing.includes(name);
    if (selected) {
      // 开始淡出，300ms 后再真正移除
      setRemoving((prev) => [...prev, name]);
      window.setTimeout(() => {
        setAlgos((prev) => prev.filter((x) => x !== name));
        setRemoving((prev) => prev.filter((x) => x !== name));
      }, 300);
    } else {
      setAlgos((prev) => [...prev, name]);
    }
  };

  return (
    <div
      data-interactive
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        data-interactive
        className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            {task ? "编辑计划任务" : "新建计划任务"}
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* 步骤指示 */}
        <div className="mt-4 flex gap-1.5">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={cn(
                  "h-1.5 rounded-full",
                  i <= step ? "bg-primary" : "bg-muted",
                )}
              />
              <div
                className={cn(
                  "mt-1 text-center text-[10px]",
                  i <= step ? "text-primary" : "text-muted-foreground",
                )}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* 步骤内容 */}
        <div className="mt-5 min-h-60">
          {step === 0 ? (
            <Field label="点击日历选择起始日期" icon={<CalendarDays className="size-4" />}>
              <DatePicker value={start} onChange={setStart} />
            </Field>
          ) : step === 1 ? (
            <Field label="点击日历选择终止日期" icon={<CalendarDays className="size-4" />}>
              <DatePicker value={end} onChange={setEnd} min={start} />
            </Field>
          ) : step === 2 ? (
            <Field label="每天做几道题？" icon={<Check className="size-4" />}>
              <Input
                type="number"
                min={1}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                autoFocus
              />
            </Field>
          ) : (
            <AlgoShoppingCart
              algos={algos}
              removing={removing}
              onToggle={toggleAlgo}
            />
          )}
        </div>

        {/* 底部按钮 */}
        <div className="mt-5 flex items-center justify-between">
          <Button
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            上一步
          </Button>
          {step < 3 ? (
            <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              下一步
            </Button>
          ) : (
            <Button onClick={confirm}>{task ? "保存修改" : "确认创建"}</Button>
          )}
        </div>
      </div>
    </div>
  );
}

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function fmtKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function todayKey(): string {
  const n = new Date();
  return fmtKey(n.getFullYear(), n.getMonth(), n.getDate());
}

/** 可跨月 / 跨年的日历选择器：左右箭头换月，双箭头换年 */
function DatePicker({
  value,
  onChange,
  min,
}: {
  value: string;
  onChange: (date: string) => void;
  min?: string;
}) {
  const [view, setView] = useState(() => {
    const d = value ? new Date(`${value}T00:00:00`) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = view.getFullYear();
  const mon = view.getMonth();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const startWeekday = (new Date(year, mon, 1).getDay() + 6) % 7;
  const today = todayKey();

  const cells: Array<number | null> = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className="rounded p-1 hover:bg-muted"
          onClick={() => setView(new Date(year - 1, mon, 1))}
          aria-label="上一年"
        >
          <ChevronsLeft className="size-4" />
        </button>
        <button
          type="button"
          className="rounded p-1 hover:bg-muted"
          onClick={() => setView(new Date(year, mon - 1, 1))}
          aria-label="上个月"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="font-medium">
          {year} 年 {mon + 1} 月
        </div>
        <button
          type="button"
          className="rounded p-1 hover:bg-muted"
          onClick={() => setView(new Date(year, mon + 1, 1))}
          aria-label="下个月"
        >
          <ChevronRight className="size-4" />
        </button>
        <button
          type="button"
          className="rounded p-1 hover:bg-muted"
          onClick={() => setView(new Date(year + 1, mon, 1))}
          aria-label="下一年"
        >
          <ChevronsRight className="size-4" />
        </button>
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
          const disabled = min ? key < min : false;
          const selected = key === value;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(key)}
              className={cn(
                "aspect-square rounded-lg text-xs transition-colors",
                selected
                  ? "bg-primary text-primary-foreground"
                  : disabled
                    ? "text-muted-foreground/30"
                    : "text-foreground hover:bg-muted",
                key === today && !selected && "ring-1 ring-primary",
              )}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

/** 选算法的购物车：上方词条，下方购物车，选中即放入（掉落动画），取消即淡出 */
function AlgoShoppingCart({
  algos,
  removing,
  onToggle,
}: {
  algos: string[];
  removing: string[];
  onToggle: (name: string) => void;
}) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">
        点选算法放入购物车（已选 {algos.length} 个）
      </div>

      {/* 算法词条 */}
      <div className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-1">
        {ALGORITHMS.map((a) => {
          const active = algos.includes(a.name) && !removing.includes(a.name);
          return (
            <button
              key={a.name}
              onClick={() => onToggle(a.name)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {a.name}
            </button>
          );
        })}
      </div>

      {/* 购物车 */}
      <div className="mt-4 min-h-24 rounded-xl border-2 border-dashed border-border p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShoppingCart className="size-4" />
          购物车
          {algos.length > 0 ? (
            <span className="text-xs">（{algos.length} 件）</span>
          ) : (
            <span className="text-xs">空</span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {algos.map((name) => {
            const isRemoving = removing.includes(name);
            return (
              <span
                key={name}
                className="inline-flex items-center rounded-full border bg-muted/50 px-2.5 py-1 text-xs"
                style={{
                  animation: isRemoving
                    ? "cart-item-out 0.3s ease-in forwards"
                    : "cart-item-in 0.35s ease-out",
                }}
              >
                {name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
