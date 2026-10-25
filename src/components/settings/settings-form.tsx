"use client";

import { Sparkles } from "lucide-react";
import { useSettings } from "@/lib/store/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SettingsForm() {
  const {
    codeforcesUsername,
    setCodeforcesUsername,
    algoEnabled,
    setAlgoEnabled,
    starfieldEnabled,
    setStarfieldEnabled,
  } = useSettings();

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Codeforces 用户名</h2>
          <p className="text-sm text-muted-foreground">
            填写后拉取你的 Codeforces 公开数据（算法竞赛模块）。
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cf-username">Codeforces</Label>
          <Input
            id="cf-username"
            placeholder="输入 Codeforces 用户名"
            value={codeforcesUsername}
            onChange={(e) => setCodeforcesUsername(e.target.value)}
            autoComplete="off"
          />
        </div>
      </section>

      <section className="flex items-center justify-between gap-4 rounded-xl border p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-4 text-primary" />
          <div>
            <div className="font-medium">点击随机算法装饰</div>
            <div className="text-sm text-muted-foreground">
              点击页面任意位置弹出随机算法卡片（默认开启）
            </div>
          </div>
        </div>
        <Switch checked={algoEnabled} onCheckedChange={setAlgoEnabled} />
      </section>

      <section className="flex items-center justify-between gap-4 rounded-xl border p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-4 text-primary" />
          <div>
            <div className="font-medium">宇宙星空背景</div>
            <div className="text-sm text-muted-foreground">
              全屏动态星空、银河与星云（默认开启，可关闭）
            </div>
          </div>
        </div>
        <Switch
          checked={starfieldEnabled}
          onCheckedChange={setStarfieldEnabled}
        />
      </section>

      <p className="text-xs text-muted-foreground">
        配置仅保存在浏览器本地（localStorage），不会上传到服务器。
      </p>
    </div>
  );
}
