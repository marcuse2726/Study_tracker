export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">关于 Study Tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          让学习看得见 —— 个人学习追踪工具箱。
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">功能</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>算法竞赛：每日做题计划（日历）、学习算法清单、算法扭蛋机、Codeforces 数据统计。</li>
          <li>英语：生词集与每日随机复习。</li>
          <li>日程规划：按日历安排每日日程。</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">数据来源</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">数据源</th>
                <th className="px-4 py-2.5 font-medium">接口</th>
                <th className="px-4 py-2.5 font-medium">说明</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2.5 font-medium">Codeforces</td>
                <td className="px-4 py-2.5 text-muted-foreground">官方 API</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  公开数据，无需认证；后端代理 + 缓存，失败自动回退示例数据。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">合规说明</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>所有跨域请求均通过后端代理转发，统一控制频率与缓存。</li>
          <li>仅访问公开数据，不绕过登录、验证码或封禁机制。</li>
          <li>数据获取失败时自动降级为示例数据，并在界面标注。</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">技术栈</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>前端：Next.js 16（App Router）+ React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui</li>
          <li>图表：ECharts 6（按需引入）</li>
          <li>数据请求：SWR；主题：自研轻量主题系统；配置：localStorage</li>
          <li>后端：Next.js Route Handlers（数据源 Provider 可插拔架构）</li>
        </ul>
      </section>
    </div>
  );
}
