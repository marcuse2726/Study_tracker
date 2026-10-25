import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回主页
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">设置</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          配置 Codeforces 用户名与偏好，数据保存在浏览器本地。
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
