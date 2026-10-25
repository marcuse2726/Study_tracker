"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

/** 四个板块：主页 / 算法竞赛 / 英语 / 日程规划 */
const TABS = [
  { href: "/", label: "主页" },
  { href: "/algorithm", label: "算法竞赛" },
  { href: "/english", label: "英语" },
  { href: "/schedule", label: "日程规划" },
];

export function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center gap-3">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-semibold text-foreground"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-4" />
            </span>
            <span className="text-base">Study Tracker</span>
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/settings"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Settings2 className="size-4" />
              <span className="hidden sm:inline">设置</span>
            </Link>
          </div>
        </div>

        {/* 持久任务栏 */}
        <nav className="flex gap-1 overflow-x-auto pb-2">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors",
                isActive(t.href)
                  ? "bg-primary/15 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
