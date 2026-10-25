"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { useEnglish } from "@/lib/store/english";
import { WordBook } from "./word-book";
import { ReviewSession } from "./review-session";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** 英语模块：生词集 + 每日随机复习 */
export function EnglishModule() {
  const { words, dailyCount, setDailyCount } = useEnglish();
  const [reviewIds, setReviewIds] = useState<string[] | null>(null);

  const unmastered = words.filter((w) => !w.mastered);

  const startReview = () => {
    if (unmastered.length === 0) return;
    const n = Math.min(
      Math.max(dailyCount || 1, 1),
      unmastered.length,
    );
    const shuffled = [...unmastered].sort(() => Math.random() - 0.5);
    setReviewIds(shuffled.slice(0, n).map((w) => w.id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>每日复习</CardTitle>
          <CardDescription>
            每天随机抽取 n 个未掌握的生词进行检测（当前未掌握 {unmastered.length} 个）
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviewIds ? (
            <ReviewSession wordIds={reviewIds} onExit={() => setReviewIds(null)} />
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">每天复习</span>
              <Input
                type="number"
                min={1}
                className="h-9 w-20"
                value={dailyCount || ""}
                onChange={(e) => setDailyCount(Number(e.target.value) || 0)}
              />
              <span className="text-sm text-muted-foreground">个</span>
              <Button
                onClick={startReview}
                disabled={unmastered.length === 0}
              >
                <Play className="size-4" />
                开始复习
              </Button>
              {unmastered.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  还没有未掌握的生词，先在下方生词集里添加
                </p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <WordBook />
    </div>
  );
}
