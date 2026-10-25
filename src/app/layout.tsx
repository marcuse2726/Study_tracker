import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AlgoClickDecorator } from "@/components/algo-decoration/algo-click-decorator";
import { Starfield } from "@/components/starfield/starfield";

export const metadata: Metadata = {
  title: {
    default: "Study Tracker · 让学习看得见",
    template: "%s · Study Tracker",
  },
  description:
    "Study Tracker —— 让学习看得见：算法竞赛刷题计划、Codeforces 数据统计、算法扭蛋机。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          {/* 宇宙星空背景（固定在内容层下方，不阻挡交互） */}
          <Starfield />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
              {children}
            </main>
            <Footer />
          </div>
          {/* 点击随机算法装饰：全局旁路监听，不阻挡任何交互 */}
          <AlgoClickDecorator />
        </Providers>
      </body>
    </html>
  );
}
