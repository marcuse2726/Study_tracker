# 部署到 Vercel

标准 Next.js（App Router）应用，Vercel 可零配置识别，**无需 `vercel.json`，也无需任何环境变量**。

> 当前代码已托管在 GitHub：<https://github.com/marcuse2726/Study_tracker>

## 前置条件

- Node.js ≥ 20.9（本地已满足）
- 一个 [Vercel](https://vercel.com) 账号（可直接用 GitHub 账号登录）
- 代码已在 GitHub 上（已完成）

## 方式一：GitHub + Vercel Dashboard（推荐）

1. 打开 Vercel → **Add New… → Project**
2. 选择仓库 `marcuse2726/Study_tracker`，点击 **Import**
3. 构建配置保持默认（Vercel 自动识别 Next.js）：
   - Framework Preset：`Next.js`
   - Build Command：`next build`
   - Output Directory：`.next`
   - Install Command：`npm install`
4. 点击 **Deploy**，完成后访问分配的 `*.vercel.app` 域名即可

之后每次 `git push` 到 `main`，Vercel 会自动重新构建并发布。

## 方式二：Vercel CLI（不依赖 Git 自动部署）

```bash
npm i -g vercel
cd coding-stats
vercel            # 首次会要求登录并关联项目（一路回车即可）
vercel --prod     # 部署到生产环境
```

> 方式二会把本地文件直接上传到 Vercel，不依赖仓库。

## 环境变量

**当前无需任何环境变量**：Codeforces 走官方公开接口，用户名保存在浏览器 `localStorage`，单词翻译走公共词典接口。

未来接入共享缓存 / 数据库时的可选变量（见 `.env.example`）：

| 变量 | 用途 | 何时需要 |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST 地址 | 生产环境想换共享缓存时 |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis Token | 同上 |
| `DATABASE_URL` | Prisma / Supabase 连接串 | 接入数据库时 |

## 缓存说明（重要）

当前缓存是**进程内内存缓存**（`src/providers/cache.ts`、`src/app/api/translate/route.ts`）：

- 本地开发、单实例部署：完全够用，已带 TTL + 并发去重，不会高频请求上游；
- **Vercel Serverless 是无状态多实例**：每个实例各自缓存、冷启动清空，缓存命中率会降低（功能不受影响，只是部分请求会打到上游）。

生产环境若想提升命中率，可把 `cache.ts` 换成 Upstash Redis（REST，纯 `fetch`，无需额外依赖）：

```ts
// 伪代码：用 Upstash REST 替换 cacheGet / cacheSet
const REST = process.env.UPSTASH_REDIS_REST_URL!;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

export async function cacheGet<T>(key: string): Promise<T | undefined> {
  const res = await fetch(`${REST}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  const data = await res.json();
  return data.result ? (JSON.parse(data.result) as T) : undefined;
}

export async function cacheSet(key: string, value: unknown, ttlMs: number): Promise<void> {
  await fetch(`${REST}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ value: JSON.stringify(value), ex: Math.floor(ttlMs / 1000) }),
  });
}
```

## 已知问题与提示

1. **函数超时**：Vercel Hobby 计划函数默认超时约 10s。`/api/codeforces` 在冷启动 + 上游较慢时可能接近上限；如遇超时，可在路由里加 `export const maxDuration = 30`（需 Pro 计划支持更长时长）。
2. **Codeforces 接口偶发慢 / 失败**：代码已做「失败自动降级为示例数据」（响应 `isMock: true`），页面不会报错。
3. **`.npmrc` 镜像**：项目内置 `.npmrc` 指向 npmmirror（国内安装加速）。Vercel 海外构建时会用它，可能略慢；若想更快，可在 Vercel 项目设置里加环境变量 `NPM_CONFIG_REGISTRY=https://registry.npmjs.org/`。
4. **个人数据**：所有数据在浏览器 `localStorage`，**不上传服务器**，因此换设备 / 换浏览器看不到原有数据，也无法在线上查看「别人的」数据。
5. **`启动网站.bat`**：仅本地双击启动用，对 Vercel 无影响，保留即可。

## 本地 vs 线上

| | 本地 | 线上（Vercel） |
|---|---|---|
| 启动 | 双击 `启动网站.bat` 或 `npm run dev` | 访问 `*.vercel.app` |
| 数据源 | 本机网络直连 Codeforces / 词典 | Vercel 海外服务器（可能更稳或更慢） |
| 缓存 | 进程内存缓存，稳定 | 多实例内存缓存，命中率较低 |
| 个人数据 | 浏览器 `localStorage` | 同样在各自浏览器 `localStorage` |
