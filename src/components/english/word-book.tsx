"use client";

import { useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { useEnglish } from "@/lib/store/english";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** 生词集：添加单词 + 勾选「已完全掌握」+ 删除 */
export function WordBook() {
  const { words, addWord, removeWord, toggleMastered } = useEnglish();
  const [text, setText] = useState("");

  const submit = () => {
    addWord(text);
    setText("");
  };

  const mastered = words.filter((w) => w.mastered).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          生词集
        </CardTitle>
        <CardDescription>
          共 {words.length} 个生词，已掌握 {mastered} 个
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="输入生词，如 abandon，回车添加"
          />
          <Button onClick={submit}>
            <Plus className="size-4" />
            添加
          </Button>
        </div>

        {words.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            还没有生词，先添加一个吧
          </p>
        ) : (
          <ul className="max-h-80 space-y-1 overflow-y-auto pr-1">
            {words.map((w) => (
              <li
                key={w.id}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={w.mastered}
                  onChange={() => toggleMastered(w.id)}
                  className="size-4 shrink-0 accent-primary"
                  aria-label="已完全掌握"
                />
                <span
                  className={cn(
                    "flex-1 text-sm",
                    w.mastered && "text-muted-foreground line-through",
                  )}
                >
                  {w.text}
                </span>
                <button
                  onClick={() => removeWord(w.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label="删除"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
