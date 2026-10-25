"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEnglish, type Word } from "@/lib/store/english";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Anim = "idle" | "out-next" | "out-prev" | "in-next" | "in-prev";

type Translation =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; meanings: string[]; phonetic?: string }
  | { status: "error" };

/**
 * 复习检测：方形区域中间显示生词，左右箭头切换。
 * 下一个：当前词向左划出、下一个词从右侧飞入；上一个：反向。
 * 单词下方可「点击翻译」（后端代理 MyMemory）。
 */
export function ReviewSession({
  wordIds,
  onExit,
}: {
  wordIds: string[];
  onExit: () => void;
}) {
  const { words: allWords, toggleMastered } = useEnglish();
  const [index, setIndex] = useState(0);
  const [anim, setAnim] = useState<Anim>("idle");
  const [translation, setTranslation] = useState<Translation>({ status: "idle" });

  const reviewWords = wordIds
    .map((id) => allWords.find((w) => w.id === id))
    .filter((w): w is Word => !!w);

  const safeIndex = Math.min(index, Math.max(0, reviewWords.length - 1));
  const current = reviewWords[safeIndex];

  // 切换单词时重置翻译状态
  useEffect(() => {
    setTranslation({ status: "idle" });
  }, [current?.id]);

  const translate = async () => {
    if (!current || translation.status === "loading") return;
    setTranslation({ status: "loading" });
    try {
      const res = await fetch(
        `/api/translate?word=${encodeURIComponent(current.text)}`,
      );
      if (!res.ok) throw new Error("fail");
      const data = (await res.json()) as {
        meanings?: string[];
        phonetic?: string;
      };
      if (!data.meanings?.length) throw new Error("empty");
      setTranslation({
        status: "done",
        meanings: data.meanings,
        phonetic: data.phonetic,
      });
    } catch {
      setTranslation({ status: "error" });
    }
  };

  const go = (dir: "next" | "prev") => {
    if (anim !== "idle") return;
    if (dir === "next" && safeIndex >= reviewWords.length - 1) return;
    if (dir === "prev" && safeIndex <= 0) return;

    setAnim(dir === "next" ? "out-next" : "out-prev");
    window.setTimeout(() => {
      setIndex((i) =>
        dir === "next"
          ? Math.min(i + 1, reviewWords.length - 1)
          : Math.max(i - 1, 0),
      );
      setAnim(dir === "next" ? "in-next" : "in-prev");
      window.setTimeout(() => setAnim("idle"), 280);
    }, 230);
  };

  const animClass = {
    "out-next": "review-out-left",
    "out-prev": "review-out-right",
    "in-next": "review-in-right",
    "in-prev": "review-in-left",
    idle: "",
  }[anim];

  if (!current) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        复习池为空
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={onExit}>
            返回
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
        <span>
          {safeIndex + 1} / {reviewWords.length}
        </span>
        <Button variant="ghost" size="sm" onClick={onExit}>
          退出复习
        </Button>
      </div>

      <div className="flex w-full items-center justify-center gap-3">
        <Button
          variant="outline"
          className="flex h-16 flex-col gap-0.5 px-3"
          disabled={safeIndex <= 0 || anim !== "idle"}
          onClick={() => go("prev")}
          aria-label="上一个"
        >
          <ChevronLeft className="size-5" />
          <span className="text-[10px]">上一个</span>
        </Button>

        <div className="relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/30 bg-card sm:h-72 sm:w-72">
          <div
            key={current.id}
            className={cn("flex flex-col items-center gap-3 px-4", animClass)}
          >
            <span className="text-center text-3xl font-bold tracking-wide sm:text-4xl">
              {current.text}
            </span>

            {/* 点击翻译（多义项） */}
            <div className="flex max-h-24 w-full flex-col items-center gap-1 overflow-y-auto text-center">
              {translation.status === "idle" ? (
                <button
                  onClick={translate}
                  className="text-xs text-primary hover:underline"
                >
                  点击翻译
                </button>
              ) : translation.status === "loading" ? (
                <span className="text-xs text-muted-foreground">翻译中…</span>
              ) : translation.status === "done" ? (
                <>
                  {translation.phonetic ? (
                    <span className="text-[11px] text-muted-foreground">
                      /{translation.phonetic}/
                    </span>
                  ) : null}
                  {translation.meanings.map((m, i) => (
                    <span
                      key={i}
                      className="text-[11px] leading-snug text-foreground"
                    >
                      {m}
                    </span>
                  ))}
                </>
              ) : (
                <button
                  onClick={translate}
                  className="text-xs text-destructive hover:underline"
                >
                  翻译失败，点击重试
                </button>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={current.mastered}
                onChange={() => toggleMastered(current.id)}
                className="size-4 accent-primary"
              />
              我已彻底掌握
            </label>
          </div>
        </div>

        <Button
          variant="outline"
          className="flex h-16 flex-col gap-0.5 px-3"
          disabled={safeIndex >= reviewWords.length - 1 || anim !== "idle"}
          onClick={() => go("next")}
          aria-label="下一个"
        >
          <ChevronRight className="size-5" />
          <span className="text-[10px]">下一个</span>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        勾选「我已彻底掌握」的单词会从未掌握池移除
      </p>
    </div>
  );
}
