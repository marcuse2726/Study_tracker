# Study Tracker · 让学习看得见

一个个人学习记录仪表盘：把**算法竞赛**、**英语背单词**、**日程规划**放在同一个星空背景的站点里，数据全部存在浏览器本地，开箱即用。

- 纯前端 + 两个轻量后端代理（Codeforces / 词典），无需数据库、无需注册登录
- 全站深色星空视觉，支持明暗主题切换
- 手机 / 桌面响应式

## ✨ 功能

### 主页 `/`
装饰性落地页：星空背景 + 渐显标题 `Study Tracker` + 星芒点缀。

### 算法竞赛 `/algorithm`
- **每日计划**：月历上点大号「+」→ 填写任务名、起止日期、每天题量、算法范围 → 生成计划，任务以彩条显示在日历上
- **扭蛋机**：按当天任务的题量抽取算法卡片，带摇把转动、胶囊掉落、开盖迸发的动画；同一天可重抽，附「重置」按钮
- **Codeforces 数据**：Rating 曲线、难度分布、标签分布、提交热力图（GitHub 贡献图同款）、最近提交

### 英语 `/english`
- **单词本**：增删单词，支持标记「已掌握」
- **每日复习**：按设定数量抽词，卡片左右滑动切换，点「点击翻译」展示**多个词典义项**与音标

### 日程规划 `/schedule`
- 月历视图，四类事项分块展示：**考试 / 活动 / 课程 / DDL**（各有配色）
- 每个分类块内点「+」新建：填写标题 → 点选日期 → 日历上出现圆点标记

### 全站
- **点击随机算法装饰**：点击页面空白处弹出随机算法卡片（共 38 个算法），最多同时 5 个、不重复、自动淡出；**按钮、链接、输入框等可交互控件上不触发**
- **动态宇宙星空**：Canvas 绘制的闪烁星辰、银河带、流星
- **主题切换**：亮 / 暗一键切换
- **设置页 `/settings`**：Codeforces 用户名、星空 / 算法装饰开关
- **关于页 `/about`**：数据来源与合规声明

## 🧱 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16.3.5（App Router / Turbopack） |
| UI | React 19.2.8 + TypeScript（strict） |
| 样式 | Tailwind CSS v4（CSS-first）+ shadcn/ui v4（Base UI） |
| 图表 | ECharts 6（按需引入，tree-shaking） |
| 数据请求 | SWR |
| 状态 / 持久化 | React Context + `localStorage` |
| 主题 | 自研轻量主题系统（不依赖 next-themes / 无内联 script） |
| 后端 | Next.js Route Handlers（代理 + 进程内 TTL 缓存） |

## 🚀 快速开始

要求 Node.js ≥ 20.9。

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 生产构建
npm run start    # 启动生产版本
```

> 国内网络建议用镜像：项目已内置 `.npmrc` 指向 `registry.npmmirror.com`。
> Windows 下也可直接双击 `启动网站.bat`（启动开发服务器并打开浏览器）。

## 📂 目录结构

```
coding-stats/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局：导航 + 页脚 + 星空 + 算法装饰
│   │   ├── page.tsx                # 主页（装饰性落地页）
│   │   ├── algorithm/page.tsx      # 算法竞赛
│   │   ├── english/page.tsx        # 英语
│   │   ├── schedule/page.tsx       # 日程规划
│   │   ├── settings/page.tsx       # 设置
│   │   ├── about/page.tsx          # 关于 / 声明
│   │   ├── globals.css             # 主题变量、关键帧动画
│   │   └── api/
│   │       ├── codeforces/route.ts # GET /api/codeforces?username=
│   │       └── translate/route.ts  # GET /api/translate?word=
│   ├── components/
│   │   ├── algorithm/              # 算法竞赛页（日历、任务弹窗、扭蛋机、CF 区块）
│   │   ├── english/                # 单词本、复习会话
│   │   ├── schedule/               # 日程日历 + 四类事项
│   │   ├── dashboard/              # ECharts 图表（难度 / 标签 / 热力 / Rating / 最近提交）
│   │   ├── algo-decoration/        # 点击随机算法装饰
│   │   ├── starfield/              # Canvas 星空
│   │   ├── layout/                 # 导航栏 / 主题切换 / 页脚
│   │   ├── settings/               # 设置表单
│   │   ├── ui/                     # shadcn/ui 基础组件
│   │   └── shared/status.tsx       # 卡片 / 骨架屏 / 错误 / 空态
│   ├── lib/
│   │   ├── store/                  # theme / settings / study / english / schedule
│   │   ├── types.ts                # 共享类型
│   │   ├── constants.ts            # 平台 / 难度 / 判定元信息
│   │   ├── hooks.ts                # SWR hooks
│   │   ├── chart-theme.ts          # 图表配色
│   │   └── utils.ts
│   └── providers/                  # 数据源（Codeforces + mock 兜底 + 缓存）
├── DEPLOY.md                       # 部署到 Vercel 的步骤
├── 启动网站.bat                     # Windows 一键启动脚本
└── package.json
```

## 🔌 数据接口

| 接口 | 说明 |
|---|---|
| `GET /api/codeforces?username=<handle>` | 代理 Codeforces 官方公开 API，聚合 Rating / 提交 / 难度 / 标签；带进程内 TTL 缓存与并发去重；上游失败时**自动降级为示例数据**（响应含 `isMock: true`） |
| `GET /api/translate?word=<word>` | 单词翻译：有道词典 JSON（**多义项** + 音标）优先，MyMemory 兜底；24 小时进程内缓存 |

> 用户名留空时直接返回示例数据，方便无账号预览。

## 💾 数据存储

所有个人数据只存在浏览器 `localStorage`，**不会上传到服务器**，也不在 Git 仓库里：

| Key | 内容 |
|---|---|
| `studytracker.theme` | 主题（light / dark / system） |
| `studytracker.settings.v1` | Codeforces 用户名、星空 / 算法装饰开关 |
| `studytracker.study.v2` | 每日计划任务、扭蛋记录 |
| `studytracker.english.v1` | 单词本、每日复习数量 |
| `studytracker.schedule.v2` | 日程事项（按日期分组） |

换浏览器 / 清缓存会丢失数据，需要自备备份习惯。

## ⚙️ 配置

打开「设置」页填写 Codeforces 用户名即可拉取真实数据；不填则显示示例数据（界面会标注）。

## 📌 合规说明

- 仅访问 **Codeforces 官方公开 API**，不绕过登录、验证码或反爬机制；
- 所有跨域请求走后端代理，统一频率控制与缓存；
- 数据获取失败自动降级为示例数据并明确标注。

## 🚀 部署

详见 [DEPLOY.md](./DEPLOY.md)。当前**无需任何环境变量**即可运行；Vercel 零配置识别 Next.js。

## 📄 License

见 [LICENSE](./LICENSE)。
