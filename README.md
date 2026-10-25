# CodeStat · 编程刷题数据统计

个人编程刷题数据仪表盘，汇总 LeetCode、Codeforces、AtCoder、洛谷、牛客的做题数据，并用可视化图表展示。响应式设计，支持桌面与手机。

## ✨ 功能

- **总览仪表盘**：总刷题数、总提交数、连续打卡、各平台题数卡片
- **可视化图表**：难度分布、标签分布、提交热力图（GitHub 贡献图同款）、Rating 曲线、排名变化、最近提交
- **平台筛选**：导航栏 / 首页胶囊一键切换「全部 / 单平台」
- **平台详情页**：每个平台独立统计
- **设置页**：配置各平台用户名、手动导入数据、开关算法装饰、主题切换（亮 / 暗 / 跟随系统）
- **关于页**：数据来源说明
- **点击随机算法装饰**（重点交互）：点击页面任意位置弹出随机算法卡片（38 个算法），淡入上浮淡出，最多同时 5 个，不重复，`pointer-events:none` 不阻挡交互，可开关，默认开启，支持移动端

## 🧱 技术栈

- 前端：Next.js 16（App Router）+ React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui
- 图表：ECharts 6（按需引入）
- 数据请求：SWR；主题：next-themes；配置：localStorage
- 后端：Next.js Route Handlers（数据源 Provider 可插拔架构）

## 🚀 快速开始

要求 Node.js ≥ 20.9。

```bash
cd coding-stats

# 国内网络建议使用镜像（项目已内置 .npmrc 指向 npmmirror）
npm install

# 开发模式（默认 http://localhost:3000）
npm run dev

# 生产构建 + 启动
npm run build
npm run start
```

> 若 `npm install` 因网络超时失败，可临时执行：
> `npm config set registry https://registry.npmmirror.com/`

## 📂 目录结构

```
coding-stats/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # 根布局（导航 + 页脚 + 算法装饰挂载）
│   │   ├── page.tsx              # 首页仪表盘
│   │   ├── platform/[platform]/page.tsx   # 平台详情页
│   │   ├── settings/page.tsx     # 设置页
│   │   ├── about/page.tsx        # 关于页
│   │   └── api/
│   │       ├── stats/route.ts    # GET /api/stats 聚合统计
│   │       ├── platforms/route.ts
│   │       └── platforms/[platform]/route.ts
│   ├── components/
│   │   ├── ui/                   # shadcn/ui 基础组件
│   │   ├── layout/               # 导航栏 / 主题切换 / 页脚
│   │   ├── dashboard/            # 各图表组件
│   │   ├── charts/echart.tsx     # ECharts 轻量封装
│   │   ├── algo-decoration/      # 点击随机算法装饰
│   │   └── shared/               # 卡片 / 加载 / 错误 / 空态
│   ├── lib/
│   │   ├── types.ts              # 全站共享类型
│   │   ├── constants.ts          # 平台元信息 / 颜色
│   │   ├── hooks.ts              # SWR 数据 hooks
│   │   ├── chart-theme.ts        # 图表主题配色
│   │   └── store/                # settings / filter 状态（localStorage）
│   └── providers/
│       ├── types.ts              # PlatformProvider 接口
│       ├── mock.ts               # mock 数据生成器
│       └── registry.ts           # 注册表 + 聚合逻辑
├── .npmrc                        # 国内 npm 镜像
└── README.md
```

## ⚙️ 配置用户名

进入「设置」页，填写各平台用户名。配置保存在浏览器 `localStorage`，前端会通过查询参数传给后端 API。

> 配置用户名后，Codeforces、AtCoder 会拉取真实数据；LeetCode、洛谷、牛客可在「设置」页手动导入真实数据（否则显示示例数据）。界面会标注「真实数据 / 手动导入 / 示例数据」。

## 🔌 数据源与接入新平台

数据源统一抽象为 `PlatformProvider` 接口（`src/providers/types.ts`）：

| 平台 | 接口 | 状态 |
|---|---|---|
| Codeforces | 官方 API | 真实数据 ✅ |
| AtCoder | 官方 history.json + AtCoder Problems 非官方 API | 真实数据 ✅ |
| LeetCode | 非官方 GraphQL（leetcode.cn） | 真实 + mock 兜底（受反爬影响） |
| 洛谷 | 非官方 `_contentOnly` JSON | 真实 + mock 兜底（受反爬影响） |
| 牛客 | 无公开 API | 仅示例数据 |

**接入新平台的步骤：**

1. 在 `src/lib/types.ts` 与 `src/lib/constants.ts` 中新增平台 ID / 元信息；
2. 新建 `src/providers/<id>.ts`，实现 `PlatformProvider` 接口；
3. 在 `src/providers/registry.ts` 中登记一行。

前端与 API 路由无需改动，即可自动支持新平台。

## 📌 合规说明

- 所有跨域请求走后端代理，统一频率控制与缓存；
- 仅访问公开数据，不绕过登录、验证码或封禁机制；
- 数据获取失败自动降级为示例数据，并在界面标注「示例数据」。

## 🚀 部署到 Vercel

详细步骤见 [DEPLOY.md](./DEPLOY.md)。摘要：

- 当前**无需任何环境变量**即可运行；
- Vercel 零配置识别 Next.js，导入 Git 仓库或 `vercel --prod` 一键部署；
- 生产环境建议把内存缓存换成 Upstash Redis（见 DEPLOY.md）。

## 🗺️ Roadmap

- [x] 第二步：前端 + mock 数据 + 点击随机算法装饰
- [x] 第三步：接入真实数据源（Codeforces / AtCoder 真实；LeetCode / 洛谷带兜底）
- [x] 第四步：Vercel 部署说明与完善
